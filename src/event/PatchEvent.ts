import { IPatch } from "../patch/Patch";
import { IPatchTable } from "../patch/PatchTable";

export type PatchEvent = {
  type: "table" | "patch";
  inserted: boolean;
  deleted: boolean;
  table?: IPatchTable;
  patches?: IPatch[] | undefined;
};

export type PatchListener = (event: PatchEvent) => void;
