import { apiClient, extractApiErrorMessage } from "./apiClient";
import { FieldMappingItem, MappedFieldType } from "../types/dataset";

function normalizeHeaderName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function suggestColumnMappings(
  sourceHeaders: string[],
  destinationHeaders: string[]
): FieldMappingItem[] {
  const usedDest = new Set<string>();

  return sourceHeaders.map((srcCol: string, idx: number) => {
    const normSrc = normalizeHeaderName(srcCol);

    // 1. Exact normalized match
    let matchedDest = destinationHeaders.find(
      (dstCol) => !usedDest.has(dstCol) && normalizeHeaderName(dstCol) === normSrc
    );

    // 2. Substring / alias match
    if (!matchedDest) {
      matchedDest = destinationHeaders.find((dstCol) => {
        if (usedDest.has(dstCol)) return false;
        const normDst = normalizeHeaderName(dstCol);
        return normDst.includes(normSrc) || normSrc.includes(normDst);
      });
    }

    if (matchedDest) {
      usedDest.add(matchedDest);
    }

    let inferredType: MappedFieldType = "string";
    if (normSrc.includes("amount") || normSrc.includes("price") || normSrc.includes("total") || normSrc.includes("balance")) {
      inferredType = "currency";
    } else if (normSrc.includes("email")) {
      inferredType = "email";
    } else if (normSrc.includes("date") || normSrc.endsWith("at")) {
      inferredType = "date";
    } else if (normSrc.includes("count") || normSrc.includes("qty") || normSrc.includes("num")) {
      inferredType = "number";
    }

    const isId = normSrc === "id" || normSrc.endsWith("id") || normSrc === "customerid" || normSrc === "recordid";

    return {
      id: `map-${idx}-${srcCol}`,
      sourceColumn: srcCol,
      destinationColumn: matchedDest ?? "",
      dataType: inferredType,
      required: isId,
      isUniqueKey: isId,
    };
  });
}

export function validateFieldMappings(
  mappings: FieldMappingItem[],
  uniqueKeySource: string,
  uniqueKeyDestination: string
): string[] {
  const errors: string[] = [];

  if (!uniqueKeySource) {
    errors.push("Select a source unique identifier column.");
  }
  if (!uniqueKeyDestination) {
    errors.push("Select a destination unique identifier column.");
  }

  const activeMappings = mappings.filter((m) => m.destinationColumn.trim().length > 0);
  if (activeMappings.length === 0) {
    errors.push("Map at least one source column to a destination column.");
  }

  const destCounts = new Map<string, string[]>();
  for (const m of activeMappings) {
    const list = destCounts.get(m.destinationColumn) ?? [];
    list.push(m.sourceColumn);
    destCounts.set(m.destinationColumn, list);
  }

  for (const [destCol, sources] of destCounts.entries()) {
    if (sources.length > 1) {
      errors.push(
        `Destination column "${destCol}" is mapped multiple times (${sources.join(", ")}). Each destination field must have a single source.`
      );
    }
  }

  if (uniqueKeySource && uniqueKeyDestination) {
    const keyMapped = activeMappings.some(
      (m) => m.sourceColumn === uniqueKeySource && m.destinationColumn === uniqueKeyDestination
    );
    if (!keyMapped) {
      errors.push(
        `Unique key pair ("${uniqueKeySource}" → "${uniqueKeyDestination}") must be included in active column mappings.`
      );
    }
  }

  return errors;
}

export interface MappingPreviewRow {
  mapped_record: Record<string, string | null>;
  missing_required: string[];
}

export async function previewMappedRecords(payload: {
  sample_source_rows: Record<string, string>[];
  sample_destination_rows: Record<string, string>[];
  field_mappings: {
    source_column: string;
    destination_column: string;
    data_type: MappedFieldType;
    required: boolean;
  }[];
}): Promise<{ source_preview: MappingPreviewRow[]; destination_preview: MappingPreviewRow[] }> {
  try {
    const { data } = await apiClient.post("/mapping/preview", payload);
    return data;
  } catch (err) {
    throw new Error(extractApiErrorMessage(err, "Failed to generate mapping preview."));
  }
}