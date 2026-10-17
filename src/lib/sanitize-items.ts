/**
 * Safe parsing utility for topics and services.
 * Handles:
 * 1. Plain strings: "Painless Treatment"
 * 2. Stringified JSON: '{"id":"top_0","name":"Painless Treatment","type":"positive"}'
 * 3. Structured objects: { id: "top_0", name: "Painless Treatment", type: "positive" }
 * 4. Double-stringified names: { name: '{"name":"Painless Treatment"}' }
 */

export interface SafeTopic {
  id: string;
  name: string;
  type: "positive" | "issue";
}

export interface SafeService {
  id: string;
  name: string;
}

export function parseTopicItem(
  raw: any,
  fallbackType: "positive" | "issue" = "positive"
): SafeTopic | null {
  if (!raw) return null;
  let item = raw;

  // 1. If stringified JSON, parse it
  if (typeof item === "string") {
    const trimmed = item.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        item = JSON.parse(trimmed);
      } catch {}
    }
  }

  // 2. If object
  if (typeof item === "object" && item !== null) {
    let name = item.name || item.title || item.label || "";
    // Handle double-stringified name
    if (typeof name === "string") {
      const trimmedName = name.trim();
      if (trimmedName.startsWith("{") && trimmedName.endsWith("}")) {
        try {
          const inner = JSON.parse(trimmedName);
          name = inner.name || inner.title || "";
        } catch {}
      }
    }

    const cleanName = String(name || "").trim();
    // Do not allow raw JSON or empty strings as names
    if (!cleanName || cleanName.startsWith("{") || cleanName.endsWith("}")) return null;

    const rawType = String(item.type || "").toLowerCase();
    const type = rawType === "issue" || rawType === "negative" ? "issue" : fallbackType;
    const safeId = String(item.id || `top_${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`);

    return { id: safeId, name: cleanName, type };
  }

  // 3. If plain string
  if (typeof item === "string") {
    const clean = item.trim();
    if (clean && !clean.startsWith("{") && !clean.endsWith("}")) {
      const safeId = `top_${clean.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
      return { id: safeId, name: clean, type: fallbackType };
    }
  }

  return null;
}

export function parseServiceItem(raw: any): SafeService | null {
  if (!raw) return null;
  let item = raw;

  // 1. If stringified JSON, parse it
  if (typeof item === "string") {
    const trimmed = item.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        item = JSON.parse(trimmed);
      } catch {}
    }
  }

  // 2. If object
  if (typeof item === "object" && item !== null) {
    let name = item.name || item.title || item.label || "";
    if (typeof name === "string") {
      const trimmedName = name.trim();
      if (trimmedName.startsWith("{") && trimmedName.endsWith("}")) {
        try {
          const inner = JSON.parse(trimmedName);
          name = inner.name || inner.title || "";
        } catch {}
      }
    }

    const cleanName = String(name || "").trim();
    if (!cleanName || cleanName.startsWith("{") || cleanName.endsWith("}")) return null;

    const safeId = String(item.id || `srv_${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`);
    return { id: safeId, name: cleanName };
  }

  // 3. If plain string
  if (typeof item === "string") {
    const clean = item.trim();
    if (clean && !clean.startsWith("{") && !clean.endsWith("}")) {
      const safeId = `srv_${clean.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
      return { id: safeId, name: clean };
    }
  }

  return null;
}
