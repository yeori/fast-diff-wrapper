import { PatchListener } from "../event/PatchEvent";
import type { PatchEvent } from "../event/PatchEvent";
import util from "../util";
import {
  BackwardPatchTable,
  ForwardPatchTable,
  IPatchTable,
  TableDir,
  TableId,
} from "./PatchTable";

const LISTEN_ALL_TABLE = <TableId>"*";

export type PatchTableOption = {
  uid?: string | number | (() => string | number);
  direction: TableDir;
  baseText?: string;
};

class EventUtil {
  static notify(listeners: Set<PatchListener> | undefined, event: PatchEvent) {
    if (!listeners || listeners.size === 0) {
      return;
    }
    listeners.forEach((listener) => {
      try {
        if (listener) {
          listener(event);
        }
      } catch (e) {
        console.error("Error when calling patch listner: ", e);
      }
    });
  }
}
export interface IPatchContext {
  dispatch(event: PatchEvent): void;
  createTable(table: IPatchTable): IPatchTable;
  deleteTable(table: IPatchTable): IPatchTable;
}
const resolveUid = (idGen: string | number | (() => string | number)) => {
  if (typeof idGen === "function") {
    return idGen();
  } else {
    return idGen;
  }
};
export class PatchFactory implements IPatchContext {
  private readonly listenerMap: Map<TableId, Set<PatchListener>> = new Map();
  constructor() {}

  dispatch(event: PatchEvent): void {
    try {
      EventUtil.notify(this.listenerMap.get(LISTEN_ALL_TABLE), event);
    } catch (e) {
      console.error(e);
    }
  }
  createForwardTable(option?: PatchTableOption): IPatchTable {
    return this.creatPatchTable(option || { direction: "F" });
  }
  createBackwardTable(option?: PatchTableOption): IPatchTable {
    return this.creatPatchTable(option || { direction: "B" });
  }
  creatPatchTable(option?: PatchTableOption): IPatchTable {
    option = option || { direction: "B" };
    const idGen = option.uid;

    const uid = idGen ? resolveUid(idGen) : util.uid.generate();
    const baseText = option.baseText || "";

    const Clazz =
      option?.direction === "F" ? ForwardPatchTable : BackwardPatchTable;
    const table = new Clazz(this, <TableId>uid, [], baseText);
    const e: PatchEvent = {
      type: "table",
      inserted: true,
      deleted: false,
      table,
      patches: undefined,
    };
    this.dispatch(e);
    return table;
  }

  createTable(option?: PatchTableOption): IPatchTable {
    return this.creatPatchTable(option);
  }
  deleteTable(table: IPatchTable): IPatchTable {
    const e: PatchEvent = {
      type: "table",
      inserted: false,
      deleted: true,
      table,
      patches: undefined,
    };
    EventUtil.notify(this.listenerMap.get(LISTEN_ALL_TABLE), e);
    return table;
  }

  addPatchListener(listener: PatchListener) {
    const key = LISTEN_ALL_TABLE;
    let listeners = this.listenerMap.get(key);
    if (!listeners) {
      listeners = new Set();
      this.listenerMap.set(key, listeners);
    }
    if (listeners.has(listener)) {
      listeners.delete(listener);
    }
    listeners.add(listener);
  }
  removePatchListener(listener: PatchListener): boolean {
    const key = LISTEN_ALL_TABLE;
    let listeners = this.listenerMap.get(key);
    const existing = listeners?.has(listener) || false;
    if (existing) {
      listeners!.delete(listener);
    }
    return existing;
  }

  static loadFactory() {
    return new PatchFactory();
  }
}
