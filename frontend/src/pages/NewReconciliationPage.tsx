import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Download,
  Table2,
} from "lucide-react";
import { workspaceRepo } from "../db/dexieRepository";
import { useWorkspace } from "../context/WorkspaceContext";
import { ProjectSummary } from "../types/project";
import {
  DatasetPreview,
  FieldMappingItem,
  MappedFieldType,
} from "../types/dataset";
import {
  ReconciliationConfig,
  ReconciliationSession,
  ValidationOptions,
} from "../types/reconciliation";
import { previewCsvFile } from "../services/csvService";
import {
  previewMappedRecords,
  MappingPreviewRow,
  suggestColumnMappings,
  validateFieldMappings,
} from "../services/mappingService";
import {
  executeReconciliation,
  validateReconciliationConfig,
} from "../services/reconciliationService";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassInput } from "../components/glass/GlassInput";
import { GlassSelect } from "../components/glass/GlassSelect";
import { GlassUploadZone } from "../components/glass/GlassUploadZone";
import { GlassStepper } from "../components/glass/GlassStepper";
import { StepItem } from "../components/glass/GlassStepper";
import { GlassModal } from "../components/glass/GlassModal";
import { GlassStatusBadge } from "../components/glass/GlassStatusBadge";

const WIZARD_STEPS: StepItem[] = [
  { stepNumber: 1, title: "Create Session", description: "Metadata & systems" },
  { stepNumber: 2, title: "Upload CSVs", description: "Source & destination" },
  { stepNumber: 3, title: "Column Mapping", description: "Keys & field types" },
  { stepNumber: 4, title: "Validation Rules", description: "Tolerances & checks" },
  { stepNumber: 5, title: "Review", description: "Verify configuration" },
  { stepNumber: 6, title: "Run & Results", description: "Execute engine" },
];

const SAMPLE_SOURCE_CSV = `ID,Name,Email,Amount,Status
101,Rahul Sharma,rahul@example.com,5000,Active
102,Amit Das,amit@example.com,2500,Active
103,Priya Sen,priya@example.com,8000,Active
104,Ankit Roy,ankit@example.com,3200,Active
105,Neha Das,neha@example.com,4500,Inactive`;

const SAMPLE_DESTINATION_CSV = `customer_id,customer_name,email,amount,status
101,Rahul Sharma,rahul@example.com,5000,Active
102,Amit Das,amit@example.com,2500,Active
103,Priya Sen,priya@example.com,800,Active
105,Neha Das,neha@example.com,4500,Inactive
106,Sourav Pal,sourav@example.com,6000,Active`;

const SAMPLE_DUPLICATE_SOURCE_CSV = `ID,Name,Email,Amount,Status
201,Karan Verma,karan@example.com,1200,Active
201,Karan Verma Dup,karan@example.com,1200,Active
202,Riya Sen,riya@example.com,3400,Active`;

const SAMPLE_INVALID_SOURCE_CSV = `ID,Name,Email,Amount,Status
301,Suman Roy,not-an-email,not-a-number,Active
,Missing ID User,valid@example.com,1500,Active
303,Valid User,valid3@example.com,2200,Active`;

function makeSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function downloadSampleCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const NewReconciliationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { settings, notify, bumpRefresh } = useWorkspace();

  const [sessionId] = useState<string>(() => makeSessionId());
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Projects list + quick create
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [quickProjectOpen, setQuickProjectOpen] = useState(false);
  const [quickProjectName, setQuickProjectName] = useState("");
  const [quickProjectDesc, setQuickProjectDesc] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  // Step 1: Session state
  const [sessionName, setSessionName] = useState("");
  const [projectId, setProjectId] = useState(searchParams.get("projectId") ?? "");
  const [description, setDescription] = useState("");
  const [sourceSystem, setSourceSystem] = useState("");
  const [destinationSystem, setDestinationSystem] = useState("");
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Step 2: Upload state
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [destinationFile, setDestinationFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<DatasetPreview | null>(null);
  const [destinationPreview, setDestinationPreview] =
    useState<DatasetPreview | null>(null);
  const [uploadingSide, setUploadingSide] = useState<
    "source" | "destination" | null
  >(null);
  const [uploadErrors, setUploadErrors] = useState<{
    source?: string | null;
    destination?: string | null;
  }>({});
  const [previewTab, setPreviewTab] = useState<"source" | "destination">("source");

  // Step 3: Column Mapping state
  const [uniqueKeySource, setUniqueKeySource] = useState("");
  const [uniqueKeyDestination, setUniqueKeyDestination] = useState("");
  const [fieldMappings, setFieldMappings] = useState<FieldMappingItem[]>([]);
  const [mappingErrors, setMappingErrors] = useState<string[]>([]);
  const [mappedPreviewRows, setMappedPreviewRows] = useState<
    MappingPreviewRow[]
  >([]);
  const [loadingMappingPreview, setLoadingMappingPreview] = useState(false);

  // Step 4: Validation Configuration state
  const [validationOptions] = useState<ValidationOptions>(
    () => ({
      caseInsensitive: settings.defaultCaseInsensitive,
      trimWhitespace: settings.defaultTrimWhitespace,
      normalizeNumbers: true,
      normalizeDates: false,
      dateFormat: "%Y-%m-%d",
      numericTolerance: settings.defaultNumericTolerance || "0.01",
      detectMissing: true,
      detectUnexpected: true,
      detectDuplicates: true,
      validateRequired: true,
      validateNonEmpty: true,
      validateNumeric: true,
      validateEmail: true,
    })
  );
  const [configWarnings, setConfigWarnings] = useState<string[]>([]);
  const [configErrors, setConfigErrors] = useState<string[]>([]);

  // Step 5 & 6: Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    workspaceRepo
      .listProjectsWithSummary()
      .then((list) => {
        if (!active) return;
        setProjects(list);
        if (!projectId && list.length > 0) {
          setProjectId(list[0].id);
        }
      })
      .catch(() => {
        // Handled cleanly if DB unavailable
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  const handleQuickCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProjectName.trim()) return;
    setCreatingProject(true);
    try {
      const created = await workspaceRepo.createProject({
        name: quickProjectName.trim(),
        description: quickProjectDesc.trim(),
      });
      const updatedList = await workspaceRepo.listProjectsWithSummary();
      setProjects(updatedList);
      setProjectId(created.id);
      setQuickProjectName("");
      setQuickProjectDesc("");
      setQuickProjectOpen(false);
      bumpRefresh();
      notify("success", "Project Created", `Selected "${created.name}".`);
    } catch (err) {
      notify(
        "error",
        "Could not create project",
        err instanceof Error ? err.message : "Storage error."
      );
    } finally {
      setCreatingProject(false);
    }
  };

  // Auto-generate column mappings when both previews are ready and mappings aren't set yet
  useEffect(() => {
    if (
      sourcePreview &&
      destinationPreview &&
      fieldMappings.length === 0
    ) {
      const suggested = suggestColumnMappings(
        sourcePreview.headers,
        destinationPreview.headers
      );
      setFieldMappings(suggested);

      const idCandidate = suggested.find(
        (m) => m.isUniqueKey && m.destinationColumn
      );
      if (idCandidate) {
        setUniqueKeySource(idCandidate.sourceColumn);
        setUniqueKeyDestination(idCandidate.destinationColumn);
      } else if (sourcePreview.headers[0] && destinationPreview.headers[0]) {
        setUniqueKeySource(sourcePreview.headers[0]);
        setUniqueKeyDestination(destinationPreview.headers[0]);
      }
    }
  }, [sourcePreview, destinationPreview, fieldMappings.length]);

  const handleUploadSide = async (
    file: File,
    side: "source" | "destination"
  ) => {
    setUploadErrors((prev) => ({ ...prev, [side]: null }));
    setUploadingSide(side);

    try {
      const preview = await previewCsvFile(file, sessionId, side, 10);
      await workspaceRepo.saveDatasetPreview(preview);
      bumpRefresh();

      if (side === "source") {
        setSourceFile(file);
        setSourcePreview(preview);
        setFieldMappings([]);
      } else {
        setDestinationFile(file);
        setDestinationPreview(preview);
        setFieldMappings([]);
      }

      notify(
        "success",
        `${side === "source" ? "Source" : "Destination"} CSV Loaded`,
        `${file.name} (${preview.rowCount.toLocaleString()} rows, ${preview.headers.length} columns)`
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to parse CSV file.";
      setUploadErrors((prev) => ({ ...prev, [side]: msg }));
      if (side === "source") {
        setSourceFile(null);
        setSourcePreview(null);
      } else {
        setDestinationFile(null);
        setDestinationPreview(null);
      }
    } finally {
      setUploadingSide(null);
    }
  };

  const handleLoadSamplePair = async () => {
    const srcFile = new File([SAMPLE_SOURCE_CSV], "sample_source.csv", {
      type: "text/csv",
    });
    const dstFile = new File(
      [SAMPLE_DESTINATION_CSV],
      "sample_destination.csv",
      { type: "text/csv" }
    );
    await handleUploadSide(srcFile, "source");
    await handleUploadSide(dstFile, "destination");
  };

  const handleRemoveFile = (side: "source" | "destination") => {
    setUploadErrors((prev) => ({ ...prev, [side]: null }));
    setFieldMappings([]);
    if (side === "source") {
      setSourceFile(null);
      setSourcePreview(null);
    } else {
      setDestinationFile(null);
      setDestinationPreview(null);
    }
  };

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!sessionName.trim()) {
      errs.sessionName = "Session name is required.";
    }
    if (!projectId) {
      errs.projectId = "Select or create a project for this session.";
    }
    if (!sourceSystem.trim()) {
      errs.sourceSystem = "Source system name is required.";
    }
    if (!destinationSystem.trim()) {
      errs.destinationSystem = "Destination system name is required.";
    }
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const nextErrs: { source?: string | null; destination?: string | null } =
      {};
    if (!sourceFile || !sourcePreview) {
      nextErrs.source = "Please upload and validate a Source CSV file.";
    }
    if (!destinationFile || !destinationPreview) {
      nextErrs.destination =
        "Please upload and validate a Destination CSV file.";
    }
    setUploadErrors(nextErrs);
    return !nextErrs.source && !nextErrs.destination;
  };

  const handlePreviewMapped = async () => {
    if (!sourcePreview) return;
    setLoadingMappingPreview(true);
    try {
      const active = fieldMappings
        .filter((m) => m.destinationColumn.trim().length > 0)
        .map((m) => ({
          source_column: m.sourceColumn,
          destination_column: m.destinationColumn,
          data_type: m.dataType,
          required: m.required,
        }));

      const res = await previewMappedRecords({
        sample_source_rows: sourcePreview.sampleRows.slice(0, 5),
        sample_destination_rows: (
          destinationPreview?.sampleRows ?? []
        ).slice(0, 5),
        field_mappings: active,
      });
      setMappedPreviewRows(res.source_preview);
    } catch (err) {
      notify(
        "warning",
        "Mapping Preview Note",
        err instanceof Error ? err.message : "Could not load server preview."
      );
    } finally {
      setLoadingMappingPreview(false);
    }
  };

  const validateStep3 = async (): Promise<boolean> => {
    const errs = validateFieldMappings(
      fieldMappings,
      uniqueKeySource,
      uniqueKeyDestination
    );
    setMappingErrors(errs);
    if (errs.length > 0) return false;

    const currentConfig: ReconciliationConfig = {
      sessionId,
      uniqueKeySource,
      uniqueKeyDestination,
      fieldMappings,
      validationOptions,
    };
    await workspaceRepo.saveConfig(currentConfig);
    await workspaceRepo.recordActivity(
      "MAPPING_SAVED",
      `Saved column mapping (${fieldMappings.filter((m) => m.destinationColumn).length} mapped fields) for "${sessionName.trim()}"`,
      { projectId, sessionId }
    );
    bumpRefresh();
    return true;
  };

  const validateStep4 = async (): Promise<boolean> => {
    setConfigErrors([]);
    setConfigWarnings([]);

    const tol = Number(validationOptions.numericTolerance);
    if (
      validationOptions.numericTolerance.trim() === "" ||
      Number.isNaN(tol) ||
      tol < 0
    ) {
      setConfigErrors([
        "Numeric tolerance must be a non-negative number (e.g., 0.01 or 0).",
      ]);
      return false;
    }

    if (
      validationOptions.normalizeDates &&
      !validationOptions.dateFormat.trim()
    ) {
      setConfigErrors([
        "Specify an explicit date format when date normalization is enabled.",
      ]);
      return false;
    }

    const currentConfig: ReconciliationConfig = {
      sessionId,
      uniqueKeySource,
      uniqueKeyDestination,
      fieldMappings,
      validationOptions,
    };

    try {
      const check = await validateReconciliationConfig(currentConfig);
      if (!check.valid && check.errors?.length) {
        setConfigErrors(check.errors);
        return false;
      }
      setConfigWarnings(check.warnings ?? []);
    } catch {
      // Allow proceeding to review if config endpoint is offline; execution will verify
    }

    await workspaceRepo.saveConfig(currentConfig);
    return true;
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
      return;
    }
    if (currentStep === 3) {
      const ok = await validateStep3();
      if (ok) setCurrentStep(4);
      return;
    }
    if (currentStep === 4) {
      const ok = await validateStep4();
      if (ok) setCurrentStep(5);
      return;
    }
    if (currentStep === 5) {
      await handleRunReconciliation();
    }
  };

  const handleRunReconciliation = async () => {
    if (isRunning || !sourceFile || !destinationFile || !sourcePreview || !destinationPreview) {
      return;
    }

    setIsRunning(true);
    setExecutionError(null);
    setCurrentStep(6);

    const config: ReconciliationConfig = {
      sessionId,
      uniqueKeySource,
      uniqueKeyDestination,
      fieldMappings,
      validationOptions,
    };

    const draftSession: ReconciliationSession = {
      id: sessionId,
      projectId,
      projectName: selectedProject?.name ?? "Workspace Project",
      name: sessionName.trim(),
      description: description.trim(),
      sourceSystem: sourceSystem.trim(),
      destinationSystem: destinationSystem.trim(),
      status: "RUNNING",
      matchPercentage: 0,
      sourceRowCount: sourcePreview.rowCount,
      destinationRowCount: destinationPreview.rowCount,
      matchedCount: 0,
      mismatchedCount: 0,
      missingCount: 0,
      unexpectedCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      totalIssues: 0,
      durationMs: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await workspaceRepo.saveConfig(config);
      await workspaceRepo.upsertSession(draftSession);

      const { completedSession, records } = await executeReconciliation({
        session: draftSession,
        config,
        sourceFile,
        destinationFile,
      });

      await workspaceRepo.saveReconciliationOutcome(completedSession, records);
      bumpRefresh();
      notify(
        "success",
        "Reconciliation Complete",
        `"${completedSession.name}" finished with ${completedSession.matchPercentage.toFixed(1)}% match rate.`
      );
      navigate(`/app/reconcile/${sessionId}`);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Reconciliation engine encountered an error.";
      setExecutionError(msg);
      await workspaceRepo.upsertSession({
        ...draftSession,
        status: "FAILED",
      });
      bumpRefresh();
      notify("error", "Reconciliation Failed", msg);
    } finally {
      setIsRunning(false);
    }
  };

  const activePreview =
    previewTab === "source" ? sourcePreview : destinationPreview;

  void quickProjectOpen;
  void creatingProject;
  void configWarnings;
  void configErrors;
  void executionError;
  void handleQuickCreateProject;
  void handleNextStep;

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          New Reconciliation Session
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Guided six-step workflow to compare, validate, and reconcile source and destination datasets.
        </p>
      </div>

      {/* Stepper */}
      <GlassPanel level={2} className="p-3 sm:p-4">
        <GlassStepper
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onSelectStep={(stepNum) => {
            if (!isRunning && stepNum < 6) {
              setCurrentStep(stepNum);
            }
          }}
        />
      </GlassPanel>

      {/* STEP 1: CREATE SESSION */}
      {currentStep === 1 && (
        <GlassPanel level={1} className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Step 1: Session Details
              </h3>
<p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                 Name your reconciliation run and identify the source and destination systems.
               </p>
               <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                 Tip: Press Tab on any empty field to quick-fill the suggested value.
               </p>
            </div>

            <GlassButton
              size="sm"
              variant="secondary"
              leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => setQuickProjectOpen(true)}
            >
              New Project
            </GlassButton>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <GlassInput
              label="Session Name"
              placeholder="e.g., November Financial Migration"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab" && !e.shiftKey && sessionName.trim() === "") {
                  setSessionName("November Financial Migration");
                }
              }}
              error={step1Errors.sessionName}
              required
            />

            <GlassSelect
              label="Project"
              placeholder="Select a project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              error={step1Errors.projectId}
              options={projects.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
              required
            />

            <GlassInput
              label="Source System"
              placeholder="e.g., Legacy ERP"
              value={sourceSystem}
              onChange={(e) => setSourceSystem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab" && !e.shiftKey && sourceSystem.trim() === "") {
                  setSourceSystem("Legacy ERP");
                }
              }}
              error={step1Errors.sourceSystem}
              required
            />

            <GlassInput
              label="Destination System"
              placeholder="e.g., New ERP"
              value={destinationSystem}
              onChange={(e) => setDestinationSystem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab" && !e.shiftKey && destinationSystem.trim() === "") {
                  setDestinationSystem("New ERP");
                }
              }}
              error={step1Errors.destinationSystem}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="session-description"
              className="block text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              Description (Optional)
            </label>
            <textarea
              id="session-description"
              rows={3}
              placeholder="e.g., Cutover batch validation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Tab" && !e.shiftKey && description.trim() === "") {
                  setDescription("Cutover batch validation and reconciliation run.");
                }
              }}
              className="glass-level-2 w-full rounded-[12px] p-3 text-sm focus:border-[var(--accent-cyan)]"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </GlassPanel>
      )}

      {/* STEP 2: UPLOAD SOURCE AND DESTINATION */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <GlassPanel level={1} className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Step 2: Upload Source &amp; Destination CSVs
                </h3>
                <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                  Upload up to 20 MB per file. Or load/download sample datasets to test scenarios immediately.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <GlassButton
                  size="sm"
                  variant="primary"
                  onClick={() => void handleLoadSamplePair()}
                  disabled={uploadingSide !== null}
                >
                  Load Sample Pair
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="ghost"
                  leftIcon={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() =>
                    downloadSampleCsv("sample_source.csv", SAMPLE_SOURCE_CSV)
                  }
                >
                  sample_source.csv
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="ghost"
                  leftIcon={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() =>
                    downloadSampleCsv(
                      "sample_destination.csv",
                      SAMPLE_DESTINATION_CSV
                    )
                  }
                >
                  sample_destination.csv
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    downloadSampleCsv(
                      "sample_duplicates_source.csv",
                      SAMPLE_DUPLICATE_SOURCE_CSV
                    )
                  }
                >
                  Duplicates CSV
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    downloadSampleCsv(
                      "sample_invalid_source.csv",
                      SAMPLE_INVALID_SOURCE_CSV
                    )
                  }
                >
                  Invalid Rows CSV
                </GlassButton>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <GlassUploadZone
                title="Source Dataset"
                subtitle={`Baseline export from ${sourceSystem || "Source System"}`}
                file={sourceFile}
                rowCount={sourcePreview?.rowCount}
                columnCount={sourcePreview?.headers.length}
                loading={uploadingSide === "source"}
                error={uploadErrors.source}
                onFileSelected={(f) => void handleUploadSide(f, "source")}
                onRemoveFile={() => handleRemoveFile("source")}
                onLoadSample={() => {
                  const f = new File([SAMPLE_SOURCE_CSV], "sample_source.csv", {
                    type: "text/csv",
                  });
                  void handleUploadSide(f, "source");
                }}
              />

              <GlassUploadZone
                title="Destination Dataset"
                subtitle={`Target export from ${destinationSystem || "Destination System"}`}
                file={destinationFile}
                rowCount={destinationPreview?.rowCount}
                columnCount={destinationPreview?.headers.length}
                loading={uploadingSide === "destination"}
                error={uploadErrors.destination}
                onFileSelected={(f) => void handleUploadSide(f, "destination")}
                onRemoveFile={() => handleRemoveFile("destination")}
                onLoadSample={() => {
                  const f = new File(
                    [SAMPLE_DESTINATION_CSV],
                    "sample_destination.csv",
                    { type: "text/csv" }
                  );
                  void handleUploadSide(f, "destination");
                }}
              />
            </div>

            {/* First 10 Rows Preview */}
            {(sourcePreview || destinationPreview) && (
              <GlassCard level={2} padding="md" className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Table2
                      className="h-4 w-4"
                      style={{ color: "var(--accent-cyan)" }}
                      aria-hidden="true"
                    />
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Dataset Preview (First 10 Rows)
                    </h4>
                  </div>

                  <div className="flex gap-2">
                    <GlassButton
                      size="sm"
                      variant={previewTab === "source" ? "primary" : "ghost"}
                      disabled={!sourcePreview}
                      onClick={() => setPreviewTab("source")}
                    >
                      Source ({sourcePreview?.rowCount ?? 0})
                    </GlassButton>
                    <GlassButton
                      size="sm"
                      variant={
                        previewTab === "destination" ? "primary" : "ghost"
                      }
                      disabled={!destinationPreview}
                      onClick={() => setPreviewTab("destination")}
                    >
                      Destination ({destinationPreview?.rowCount ?? 0})
                    </GlassButton>
                  </div>
                </div>

                {activePreview && (
                  <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--glass-2-border)" }}>
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr
                          className="border-b"
                          style={{
                            borderColor: "var(--glass-2-border)",
                            color: "var(--text-muted)",
                            backgroundColor: "rgba(255,255,255,0.03)",
                          }}
                        >
                          {activePreview.headers.map((h) => (
                            <th key={h} className="px-3 py-2 font-mono whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody
                        className="divide-y"
                        style={{ borderColor: "var(--glass-2-border)" }}
                      >
                        {activePreview.sampleRows.slice(0, 10).map((row, idx) => (
                          <tr key={idx}>
                            {activePreview.headers.map((h) => (
                              <td
                                key={h}
                                className="px-3 py-2 font-mono whitespace-nowrap"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {row[h] ?? ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            )}
          </GlassPanel>
        </div>
      )}

      {/* STEP 3: COLUMN MAPPING */}
      {currentStep === 3 && sourcePreview && destinationPreview && (
        <GlassPanel level={1} className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Step 3: Column Mapping &amp; Unique Identifier
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                Map source fields to destination columns, select the unique identifier, and configure field types. Unmapped source columns can be left blank.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <GlassButton
                size="sm"
                variant="secondary"
                onClick={() =>
                  setFieldMappings(
                    suggestColumnMappings(
                      sourcePreview.headers,
                      destinationPreview.headers
                    )
                  )
                }
              >
                Re-Suggest Mappings
              </GlassButton>
              <GlassButton
                size="sm"
                variant="ghost"
                loading={loadingMappingPreview}
                onClick={() => void handlePreviewMapped()}
              >
                Preview Mapped Rows
              </GlassButton>
            </div>
          </div>

          {mappingErrors.length > 0 && (
            <div
              role="alert"
              className="rounded-xl border p-4 text-xs space-y-1"
              style={{
                borderColor: "rgba(255, 126, 134, 0.45)",
                backgroundColor: "rgba(255, 126, 134, 0.12)",
                color: "var(--status-error)",
              }}
            >
              {mappingErrors.map((err) => (
                <p key={err} className="font-medium">
                  • {err}
                </p>
              ))}
            </div>
          )}

          {/* Unique Identifier Pair */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 glass-level-2 p-4 rounded-2xl">
            <GlassSelect
              label="Source Unique Identifier"
              placeholder="Choose source ID column"
              value={uniqueKeySource}
              onChange={(e) => setUniqueKeySource(e.target.value)}
              options={sourcePreview.headers.map((h) => ({
                value: h,
                label: h,
              }))}
              helperText="Leading zeros are preserved as strings unless numeric comparison is needed."
            />

            <GlassSelect
              label="Destination Unique Identifier"
              placeholder="Choose destination ID column"
              value={uniqueKeyDestination}
              onChange={(e) => setUniqueKeyDestination(e.target.value)}
              options={destinationPreview.headers.map((h) => ({
                value: h,
                label: h,
              }))}
              helperText="Must match a unique record key in the destination CSV."
            />
          </div>

          {/* Field Mapping Rows */}
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--glass-2-border)" }}>
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr
                  className="border-b text-xs uppercase"
                  style={{
                    borderColor: "var(--glass-2-border)",
                    color: "var(--text-muted)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <th className="px-4 py-3">Source Column</th>
                  <th className="px-4 py-3">Destination Column</th>
                  <th className="px-4 py-3">Data Type</th>
                  <th className="px-4 py-3 text-center">Required</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--glass-2-border)" }}
              >
                {fieldMappings.map((m, idx) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-mono font-medium">
                      {m.sourceColumn}
                      {m.sourceColumn === uniqueKeySource && (
                        <span className="ml-2">
                          <GlassStatusBadge label="ID KEY" tone="info" icon="none" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <GlassSelect
                        aria-label={`Destination column for ${m.sourceColumn}`}
                        value={m.destinationColumn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldMappings((prev) =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, destinationColumn: val }
                                : item
                            )
                          );
                        }}
                        options={[
                          { value: "", label: "— Unmapped (Ignore) —" },
                          ...destinationPreview.headers.map((dh) => ({
                            value: dh,
                            label: dh,
                          })),
                        ]}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <GlassSelect
                        aria-label={`Data type for ${m.sourceColumn}`}
                        value={m.dataType}
                        onChange={(e) => {
                          const dt = e.target.value as MappedFieldType;
                          setFieldMappings((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, dataType: dt } : item
                            )
                          );
                        }}
                        options={[
                          { value: "string", label: "String" },
                          { value: "currency", label: "Currency (Decimal)" },
                          { value: "number", label: "Number" },
                          { value: "date", label: "Date" },
                          { value: "email", label: "Email" },
                          { value: "boolean", label: "Boolean" },
                        ]}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Required field ${m.sourceColumn}`}
                        checked={m.required}
                        onChange={(e) => {
                          const req = e.target.checked;
                          setFieldMappings((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, required: req } : item
                            )
                          );
                        }}
                        className="h-4 w-4 rounded border-white/20"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mappedPreviewRows.length > 0 && (
            <GlassCard level={2} padding="md" className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-cyan)" }}>
                Mapped Sample Preview (Source)
              </h4>
              <pre />
            </GlassCard>
          )}
        </GlassPanel>
      )}
      {/* Step 4: Validation Rules */}
      {currentStep === 4 && (
        <GlassPanel level={1} className="p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Step 4: Validation Rules</h3>
          <p className="text-sm text-[#6B7280]">Numeric tolerance: {validationOptions.numericTolerance}. Adjust in code or proceed.</p>
        </GlassPanel>
      )}

      {/* Step 5: Review */}
      {currentStep === 5 && (
        <GlassPanel level={1} className="p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Step 5: Review</h3>
          <p className="text-sm text-[#6B7280]">Review configuration and run reconciliation.</p>
          <GlassButton variant="primary" onClick={() => void handleRunReconciliation()} loading={isRunning}>
            Run Reconciliation
          </GlassButton>
        </GlassPanel>
      )}

      {/* Step 6: Run & Results */}
      {currentStep === 6 && (
        <GlassPanel level={1} className="p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Step 6: Run & Results</h3>
          <p className="text-sm text-[#6B7280]">{isRunning ? "Running reconciliation…" : executionError ?? "Completed. Redirecting…"}</p>
        </GlassPanel>
      )}

      {/* Bottom action footer */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <GlassButton
          variant="secondary"
          disabled={currentStep === 1 || isRunning}
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
        >
          Back
        </GlassButton>
        {currentStep < 6 && (
          <GlassButton
            variant="primary"
            disabled={isRunning}
            onClick={() => void handleNextStep()}
          >
            {currentStep === 5 ? "Run" : "Continue"}
          </GlassButton>
        )}
      </div>

      {/* Quick create project modal */}
      <GlassModal
        open={quickProjectOpen}
        onClose={() => setQuickProjectOpen(false)}
        title="New Project"
        description="Create a project to organize reconciliation sessions."
        footer={
          <>
            <GlassButton variant="secondary" onClick={() => setQuickProjectOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              loading={creatingProject}
              onClick={(e) => void handleQuickCreateProject(e as any)}
            >
              Create Project
            </GlassButton>
          </>
        }
      >
        <GlassInput
          label="Project Name"
          value={quickProjectName}
          onChange={(e) => setQuickProjectName(e.target.value)}
          required
        />
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wide text-[#6B7280]">
            Description (optional)
          </label>
          <textarea
            rows={3}
            value={quickProjectDesc}
            onChange={(e) => setQuickProjectDesc(e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] p-3 text-sm text-[var(--text-primary)]"
          />
        </div>
      </GlassModal>

    </div>
  );
};
