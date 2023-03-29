import { describe, test, expect } from "vitest";
import { IPatch } from "../../src/patch/Patch";
import { PatchFactory } from "../../src/patch/PatchFactory";
import { TableId } from "../../src/patch/PatchTable";
import { ICursor } from "../../src/patch/Cursor";
describe("patch", () => {
  test("backward table 1", () => {
    const factory = PatchFactory.loadFactory();
    /*
    "one" -> "two" -> "three" -> "four"
    */
    const baseText = "one";
    const table = factory.creatPatchTable({
      uid: <TableId>"doc-7638",
      baseText,
    });
    expect(table.uid).toBe("doc-7638");
    table.createPatch("two");
    table.createPatch("three");
    table.createPatch("four");

    const cursor: ICursor = table.getCursor();

    expect(() => cursor.prev()).toThrowError();

    expect(cursor.currentText).toEqual("four");
    expect(cursor.next()).toEqual("three");
    expect(cursor.prev()).toEqual("four");
    expect(cursor.next()).toEqual("three");
    expect(cursor.next()).toEqual("two");
    expect(cursor.next()).toEqual("one");

    expect(() => cursor.next()).toThrowError();
  });

  test("backward table 2", () => {
    const factory = PatchFactory.loadFactory();
    const baseText = "";
    const table = factory.creatPatchTable({
      uid: undefined, // random uuid generated for table
      baseText,
    });
    expect(!!table.uid).toBe(true);
    const histories = [
      "We can use named parameters when we invoke a Groovy method, but Groovy doesn't invoke the method with just those parameters.",
      "Groovy collects all named parameters and puts them in a Map.",
      "The Map is passed on to the method as the first argument.",
      "The method needs to know how to get the information from the Map and process it.",
      "END OF DOC",
    ];
    histories.forEach((h) => table.createPatch(h));

    const cursor: ICursor = table.getCursor();
    expect(cursor.currentText).toBe("END OF DOC");
    const h2 = [...histories].reverse().slice(1); // exclude last empty("") line

    expect(cursor.hasPrev()).toBe(false);
    h2.forEach((h) => {
      expect(cursor.hasNext()).toBe(true);
      expect(cursor.next()).toEqual(h);
      expect(cursor.hasPrev()).toBe(true);
    });
    expect(cursor.next()).toBe(""); // initial empty text
    expect(cursor.hasNext()).toBe(false);
  });
});
