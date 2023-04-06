import { describe, expect, test, vi } from "vitest";
import { PatchListener } from "../../src/event/PatchEvent";
import type { PatchEvent } from "../../src/event/PatchEvent";
import { PatchFactory } from "../../src/patch/PatchFactory";

describe("event listeners", () => {
  const TABLE_ID = "doc-8973";
  test("table crud", () => {
    const events: PatchEvent[] = [];
    const listener = (e: PatchEvent) => {
      expect(e.type).toBe("table");
      events.push(e);
    };
    const tableCrudListener = vi.fn().mockImplementation(listener);
    // vi.fn()
    // const tableDeletion = vi.spyOn(listener);
    const fac = PatchFactory.loadFactory();
    fac.addPatchListener(tableCrudListener);
    fac.creatPatchTable({ uid: TABLE_ID, direction: "B" });
    const table = fac.creatPatchTable();

    table.delete();

    expect(tableCrudListener).toHaveBeenCalledTimes(3);
    expect(events.length).toBe(3);
    expect(events.filter((e) => e.inserted).length).toBe(2);
    expect(events.filter((e) => e.deleted).length).toBe(1);
  });

  test("patch crud", () => {
    const events: PatchEvent[] = [];
    const patchListener = vi.fn().mockImplementation((e) => events.push(e));

    const fac = PatchFactory.loadFactory();
    fac.addPatchListener(patchListener);
    const table = fac.creatPatchTable();
    /**
     * "" -> "event" -> "enter" -> "clear"
     *    P0         P1         P2
     */
    table.createPatch("event");
    table.createPatch("enter");
    table.createPatch("clear");

    expect(patchListener).toHaveBeenCalledTimes(4);
    expect(events.filter((e) => e.type === "table").length).toBe(1);
    expect(events.filter((e) => e.type === "patch").length).toBe(3);
  });
});
