import { describe, expect, it } from "vitest";
import { decideSaveTransition } from "../save-posts";

describe("decideSaveTransition", () => {
  it("creates a new row when saving with no existing row", () => {
    expect(decideSaveTransition("none", "save")).toBe("create");
  });

  it("reactivates an inactive row when saving again", () => {
    expect(decideSaveTransition("inactive", "save")).toBe("reactivate");
  });

  it("is a no-op when saving an already-active row (idempotent)", () => {
    expect(decideSaveTransition("active", "save")).toBe("noop");
  });

  it("deactivates an active row when un-saving", () => {
    expect(decideSaveTransition("active", "unsave")).toBe("deactivate");
  });

  it("is a no-op when un-saving an already-inactive row", () => {
    expect(decideSaveTransition("inactive", "unsave")).toBe("noop");
  });

  it("is a no-op when un-saving a row that never existed", () => {
    expect(decideSaveTransition("none", "unsave")).toBe("noop");
  });
});
