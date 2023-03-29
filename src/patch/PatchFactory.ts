import util from "../util";
import { BackwardPatchTable, IPatchTable, TableId } from "./PatchTable";

export type PatchTableOption = {
  uid?: string | number;
  baseText?: string;
};
export class PatchFactory {
  constructor() {}

  creatPatchTable(option: PatchTableOption): IPatchTable {
    const uid = option.uid || util.uid.generate();
    const baseText = option.baseText || "";
    const table: BackwardPatchTable = new BackwardPatchTable(
      <TableId>uid,
      [],
      baseText
    );
    return table;
  }

  static loadFactory() {
    return new PatchFactory();
  }
}
