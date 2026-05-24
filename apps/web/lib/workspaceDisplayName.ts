import type { WorkspaceSummary } from "@av/store";

export function workspaceDisplayName(
  ws: Pick<WorkspaceSummary, "name" | "type">,
) {
  if (ws.type === "personal") {
    return "Personal";
  }
  return ws.name;
}
