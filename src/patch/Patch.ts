import { Diff, EQUAL, DELETE, INSERT } from "fast-diff";
import { TableId } from "./PatchTable";
import { UTCMillis } from "./schema";

export type PatchId = string | undefined;
export type PatchDiff = string | number;

export interface IPatch {
  run(text: string, reverse: boolean): string;
  readonly tableRef: TableId | undefined;
  readonly creationTime: UTCMillis;
  readonly changes: PatchDiff[];
}

const runForward = (patch: Patch, text: string): string => {
  let offset = 0;
  const tokens: string[] = [];
  patch.diffs.forEach((diff) => {
    if (typeof diff === "string") {
      tokens.push(diff);
    } else if (typeof diff === "number") {
      if (diff > 0) {
        tokens.push(text.substring(offset, offset + diff));
      }
      offset += Math.abs(diff);
    }
  }, tokens);
  /**
   * PatchDiff 포맷으로는 이전 상태로 복구할 수가 없다.
   * prev()를 지원하기 위해서 일단 아래와 같이 참조를 저장함.
   * PathDiff를 diff.Diff포맷으로 변환한 후 복구용 PatchDiff를 얻어낼 수는 있을거 같음
   */
  patch.prevText = text;
  return tokens.join("");
};

const runReverse = (patch: Patch) => {
  return patch.prevText!;
};

export class Patch implements IPatch {
  id: PatchId;
  tableRef: TableId | undefined;
  creationTime: UTCMillis;
  prevText: string | undefined;
  constructor(
    readonly diffs: PatchDiff[],
    tableRef: TableId | undefined = undefined,
    id?: PatchId
  ) {
    this.id = id;
    this.tableRef = tableRef;
    this.creationTime = new Date().getUTCMilliseconds();
  }
  get changes() {
    return this.diffs;
  }
  /**
   * converts Patch into fast-diff's Diff format
   * @param baseText text used to convert to fast-diff format
   * @returns
   */
  toFastDiffs(baseText: string): Diff[] {
    let cursor = 0;
    return this.diffs.map((val) => {
      let diff: Diff;
      if (typeof val === "number") {
        if (val === 0) {
          throw new Error("invalid patch data format. value cannot be zero");
        }
        const token = baseText.substring(cursor, cursor + Math.abs(val));
        const sign = val > 0 ? 0 : -1;
        diff = [sign, token];
        cursor += token.length;
      } else if (typeof val === "string") {
        diff = [1, val];
      } else {
        throw new Error(`invalid PatchDiff format: [${val}]`);
      }
      return diff;
    });
  }
  run(text: string, reverse: boolean): string {
    const fn = reverse ? runReverse : runForward;
    return fn(this, text);
  }

  static fromFastDiff(fastDiffs: Diff[]): Patch {
    const data = fastDiffs.map((diff) => {
      if (diff[0] === EQUAL) {
        return diff[1].length;
      } else if (diff[0] === INSERT) {
        return diff[1];
      } else if (diff[0] === DELETE) {
        return -1 * diff[1].length;
      } else {
        throw new Error("invalid fast-diff value: " + diff);
      }
    });
    return new Patch(data);
  }
}
