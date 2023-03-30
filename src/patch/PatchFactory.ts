import { PatchListener } from "../event/PatchEvent";
import type { PatchEvent } from "../event/PatchEvent";
import util from "../util";
import { BackwardPatchTable, IPatchTable, TableId } from "./PatchTable";

const LISTEN_ALL_TABLE = <TableId>"*";

export type PatchTableOption = {
  uid?: string | number;
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
  createTable(table: IPatchTable): void;
  deleteTable(table: IPatchTable): void;
}
export class PatchFactory implements IPatchContext {
  private readonly listenerMap: Map<TableId, Set<PatchListener>> = new Map();
  constructor() {}

  dispatch(event: PatchEvent): void {
    EventUtil.notify(this.listenerMap.get(LISTEN_ALL_TABLE), event);
  }
  creatPatchTable(option?: PatchTableOption): IPatchTable {
    const uid = option?.uid || util.uid.generate();
    const baseText = option?.baseText || "";
    const table = new BackwardPatchTable(this, <TableId>uid, [], baseText);

    try {
      const e: PatchEvent = {
        type: "table",
        inserted: true,
        deleted: false,
        table,
        patches: undefined,
      };
      this.dispatch(e);
    } finally {
    }

    return table;
  }

  createTable(option?: PatchTableOption): void {
    this.creatPatchTable(option);
  }
  deleteTable(table: IPatchTable): void {
    const e: PatchEvent = {
      type: "table",
      inserted: false,
      deleted: true,
      table,
      patches: undefined,
    };
    EventUtil.notify(this.listenerMap.get(LISTEN_ALL_TABLE), e);
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
