import DiffContext from "./model/DiffContext";
import type { IRangeReader } from "./model/Range";
import { DiffConfig } from "./model/DiffConfig";

const createContext = (config: DiffConfig) => new DiffContext(config);

const createMarks = (
  prev: string,
  next: string,
  delim?: string
): [IRangeReader, IRangeReader] => {
  const config: DiffConfig = {
    lineDelimeter: delim || "\n",
  };
  const ctx = createContext(config);
  const [src, dst] = ctx.build(prev, next);
  return [src, dst];
};

export default { createMarks };
