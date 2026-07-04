/**
 * Pure business logic for the save/un-save state machine. No DB, no HTTP —
 * given the current state of a (user, post) saved_posts row and an action,
 * decide what should happen. This is what makes idempotency and reactivation
 * testable without spinning up a database.
 */

export type SavedPostState = "none" | "active" | "inactive";
export type SaveAction = "save" | "unsave";
export type SaveDecision = "create" | "reactivate" | "deactivate" | "noop";

export function decideSaveTransition(
  currentState: SavedPostState,
  action: SaveAction,
): SaveDecision {
  if (action === "save") {
    if (currentState === "none") return "create";
    if (currentState === "inactive") return "reactivate";
    return "noop"; // already active — saving twice is a no-op
  }

  // action === "unsave"
  if (currentState === "active") return "deactivate";
  return "noop"; // nothing to un-save
}
