import { describe, test } from "vitest";

describe("array proxy", () => {
  test("array.push", () => {
    const arr: number[] = [];
    Reflect.defineProperty(arr, "splice", {
      configurable: true,
      enumerable: false,
      value: (...args: any[]) => {
        // console.log("[called] splice", args);
        Reflect.apply(Array.prototype.splice, arr, args);
        return true;
      },
    });
    Reflect.defineProperty(arr, "push", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: (...args: any[]) => {
        // console.log("[called] push: ", args);
        Reflect.apply(Array.prototype.splice, arr, args);
        return true;
      },
    });
    arr.push(3);
    arr.push(5);
    arr.push(7);
    // arr.push(13);
    arr.splice(0, 1);
  });
});
