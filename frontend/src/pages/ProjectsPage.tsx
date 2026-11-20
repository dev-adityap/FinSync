import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search,
  Pencil,
  Trash2,
  GitCompareArrows,
  Eye,
  Calendar,
} from "lucide-react";
import { workspaceRepo } from "../db/dexieRepository";
import { useWorkspace } from "../context/WorkspaceContext";
import { ProjectSummary } from "../types/project";
import { ReconciliationSession } from "../types/reconciliation";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassInput } from "../components/glass/GlassInput";
import { GlassSelect } from "../components/glass/GlassSelect";
import { GlassModal } from "../components/glass/GlassModal";
import { GlassStatusBadge } from "../components/glass/GlassStatusBadge";

type SortMode = "newest" | "oldest" | "name" | "sessions";

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notify, refreshCounter, bumpRefresh } = useWorkspace();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortMode>("newest");

  // Create / Edit Modal
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(
    null
  );
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // View Sessions Modal
  const [viewingProject, setViewingProject] = useState<ProjectSummary | null>(
    null
  );

  // Delete Confirmation Modal
  const [deletingProject, setDeletingProject] = useState<ProjectSummary | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      workspaceRepo.listProjectsWithSummary(),
      workspaceRepo.listSessions(),
    ])
      .then(([projList, sessList]) => {
        if (!active) return;
        setProjects(projList);
        setSessions(sessList);
      })
      .catch((err) => {
        if (!active) return;
        notify(
          "error",
          "Failed to load projects",
          err instanceof Error ? err.message : "Storage error."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshCounter, notify]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );

    return list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "sessions") return b.sessionCount - a.sessionCount;
      if (sortBy === "oldest") return a.createdAt.localeCompare(b.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [projects, searchQuery, sortBy]);

  const openCreateModal = () => {
    setEditingProject(null);
    setNameInput("");
    setDescInput("");
    setFormError(null);
    setEditorOpen(true);
  };

  const openEditModal = (project: ProjectSummary) => {
    setEditingProject(project);
    setNameInput(project.name);
    setDescInput(project.description);
    setFormError(null);
    setEditorOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setFormError("Project name is required.");
      return;
    }
    setFormError(null);
    setSaving(true);

    try {
      if (editingProject) {
        await workspaceRepo.updateProject(editingProject.id, {
          name: nameInput,
          description: descInput,
        });
        notify("success", "Project Updated", `Saved changes to "${nameInput.trim()}".`);
      } else {
        await workspaceRepo.createProject({
          name: nameInput,
          description: descInput,
        });
        notify("success", "Project Created", `Created "${nameInput.trim()}".`);
      }
      setEditorOpen(false);
      bumpRefresh();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save project."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    setDeleting(true);
    try {
      await workspaceRepo.deleteProject(deletingProject.id);
      notify(
        "info",
        "Project Deleted",
        `Removed "${deletingProject.name}" and its associated local sessions.`
      );
      setDeletingProject(null);
      bumpRefresh();
    } catch (err) {
      notify(
        "error",
        "Delete Failed",
        err instanceof Error ? err.message : "Unable to delete project."
      );
    } finally {
      setDeleting(false);
    }
  };

  const associatedSessions = useMemo(() => {
    if (!viewingProject) return [];
    return sessions.filter((s) => s.projectId === viewingProject.id);
  }, [viewingProject, sessions]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Migration Projects
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Organize reconciliation runs by ERP cutover, accounting migration, or integration pipeline.
          </p>
        </div>

        <GlassButton
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
          onClick={openCreateModal}
        >
          New Project
        </GlassButton>
      </div>

      {/* Search & Sort Toolbar */}
      <GlassCard level={2} padding="sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <GlassInput
              placeholder="Search projects by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
            />
          </div>
          <div className="sm:col-span-4">
            <GlassSelect
              aria-label="Sort projects"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortMode)}
              options={[
                { value: "newest", label: "Sort: Newest First" },
                { value: "oldest", label: "Sort: Oldest First" },
                { value: "name", label: "Sort: Name (A–Z)" },
                { value: "sessions", label: "Sort: Most Sessions" },
              ]}
            />
          </div>
        </div>
      </GlassCard>

      {/* Project Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="glass-level-2 h-48 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <GlassPanel level={1} className="p-10 text-center space-y-4">
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "rgba(99, 139, 255, 0.16)",
              color: "var(--accent-blue)",
            }}
          >
            <FolderKanban className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {projects.length === 0
              ? "No projects created yet"
              : "No projects match your search"}
          </h3>
          <p
            className="mx-auto max-w-md text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {projects.length === 0
              ? "Create your first project to group related source-to-destination CSV validation sessions."
              : "Try clearing your search filter or create a new project."}
          </p>
          <div className="pt-1">
            <GlassButton
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
              onClick={openCreateModal}
            >
              Create Project
            </GlassButton>
          </div>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <GlassCard
              key={project.id}
              level={2}
              padding="md"
              className="flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: "rgba(99, 139, 255, 0.16)",
                        color: "var(--accent-cyan)",
                      }}
                    >
                      <FolderKanban className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3
                      className="text-base font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {project.name}
                    </h3>
                  </div>

                  <GlassStatusBadge
                    label={project.sessionCount > 0 ? "ACTIVE" : "NEW"}
                    tone={project.sessionCount > 0 ? "success" : "neutral"}
                    icon="none"
                  />
                </div>

                <p
                  className="text-xs sm:text-sm line-clamp-2 min-h-[2.5rem]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {project.description || "No description provided."}
                </p>

                <div
                  className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs tabular-nums"
                  style={{
                    borderColor: "var(--glass-2-border)",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>
                    <strong style={{ color: "var(--text-primary)" }}>
                      {project.sessionCount}
                    </strong>{" "}
                    {project.sessionCount === 1 ? "session" : "sessions"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <GlassButton
                  size="sm"
                  variant="primary"
                  leftIcon={
                    <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />
                  }
                  onClick={() =>
                    navigate(`/app/reconcile/new?projectId=${project.id}`)
                  }
                >
                  Reconcile
                </GlassButton>

                <div className="flex items-center gap-1">
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    title="View associated sessions"
                    onClick={() => setViewingProject(project)}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    title="Edit project"
                    onClick={() => openEditModal(project)}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    title="Delete project"
                    onClick={() => setDeletingProject(project)}
                  >
                    <Trash2
                      className="h-4 w-4"
                      style={{ color: "var(--status-error)" }}
                      aria-hidden="true"
                    />
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <GlassModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingProject ? "Edit Project" : "Create New Project"}
        description="Projects are stored locally in your browser's IndexedDB workspace."
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setEditorOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              loading={saving}
              onClick={(e) => void handleSaveProject(e)}
            >
              {editingProject ? "Save Changes" : "Create Project"}
            </GlassButton>
          </>
        }
      >
        <form onSubmit={(e) => void handleSaveProject(e)} className="space-y-4">
          <GlassInput
            label="Project Name"
            placeholder="e.g., Q4 Legacy ERP to NetSuite Cutover"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            error={formError ?? undefined}
            required
          />

          <div className="space-y-1.5">
            <label
              htmlFor="project-desc"
              className="block text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--text-secondary)" }}
            >
              Description
            </label>
            <textarea
              id="project-desc"
              rows={3}
              placeholder="Scope, source/target systems, or cutover notes..."
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              className="glass-level-2 w-full rounded-[12px] p-3 text-sm focus:border-[var(--accent-cyan)]"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </form>
      </GlassModal>

      {/* View Project Sessions Modal */}
      <GlassModal
        open={Boolean(viewingProject)}
        onClose={() => setViewingProject(null)}
        title={viewingProject ? `${viewingProject.name} — Sessions` : "Sessions"}
        description={viewingProject?.description || "Reconciliation runs under this project"}
        size="lg"
        footer={
          <>
            <GlassButton variant="ghost" onClick={() => setViewingProject(null)}>
              Close
            </GlassButton>
            {viewingProject && (
              <GlassButton
                variant="primary"
                onClick={() => {
                  const id = viewingProject.id;
                  setViewingProject(null);
                  navigate(`/app/reconcile/new?projectId=${id}`);
                }}
              >
                Start Reconciliation
              </GlassButton>
            )}
          </>
        }
      >
        {associatedSessions.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
            No reconciliation sessions run under this project yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {associatedSessions.map((s) => (
              <div
                key={s.id}
                className="glass-level-2 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl"
              >
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {s.name}
                  </div>
                  <div
                    className="text-xs tabular-nums"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {s.sourceSystem} → {s.destinationSystem} •{" "}
                    {s.matchPercentage.toFixed(1)}% matched •{" "}
                    {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GlassStatusBadge
                    label={s.overallValidationStatus ?? s.status}
                  />
                  <Link
                    to={`/app/reconcile/${s.id}`}
                    onClick={() => setViewingProject(null)}
                  >
                    <GlassButton size="sm" variant="secondary">
                      Results
                    </GlassButton>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassModal>

      {/* Delete Project Confirmation Modal */}
      <GlassModal
        open={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        title="Delete Project?"
        description="This permanently removes the project and all linked reconciliation sessions and results from your local browser storage."
        size="sm"
        footer={
          <>
            <GlassButton
              variant="ghost"
              onClick={() => setDeletingProject(null)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              loading={deleting}
              onClick={() => void handleConfirmDelete()}
            >
              Delete Project
            </GlassButton>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Are you sure you want to delete{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {deletingProject?.name}
          </strong>
          ? This action cannot be undone.
        </p>
      </GlassModal>
    </div>
  );
};