import { describe, test, expect, vi } from "vitest";
import { PatchEvent } from "../../src/event/PatchEvent";
import { PatchFactory } from "../../src/patch/PatchFactory";

describe("patch factory", () => {
  test("table init", () => {
    const fac = PatchFactory.loadFactory();
    const forwardTable = fac.createForwardTable();
    expect(forwardTable.direction).toBe("F");

    const backwardTable = fac.createBackwardTable();
    expect(backwardTable.direction).toBe("B");

    const defaultTable = fac.creatPatchTable();
    expect(defaultTable.direction).toBe("B");
  });

  test("listeners", () => {
    const fac = PatchFactory.loadFactory();
    const listener = vi.fn().mockImplementation((event: PatchEvent) => {});
    fac.addPatchListener(listener);

    const table = fac.creatPatchTable();
    table.delete();

    expect(listener).toHaveBeenCalledTimes(2);

    expect(fac.removePatchListener(listener)).toBe(true);
    // 2 more tables;
    fac.creatPatchTable();
    fac.creatPatchTable();

    expect(listener).toHaveBeenCalledTimes(2);
    expect(fac.removePatchListener(listener)).toBe(false);
  });
});
