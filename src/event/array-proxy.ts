export type Consumer<T> = (type: string, value: T[] | undefined) => void;

class ArrayWrapper<T> extends Array<T> {
  constructor(initials: T[], readonly consumer: Consumer<T>) {
    super();
    super.push(...initials);
  }
  push(value: T) {
    super.push(value);
    this.consumer("I", [value]);
    return super.length;
  }
  pop() {
    const val: T | undefined = super.pop();
    this.consumer("D", val ? [val] : undefined);
    return val;
  }
  shift() {
    const val: T | undefined = super.shift();
    this.consumer("D", val ? [val] : undefined);
    return val;
  }
  unshift(...items: T[]) {
    const len = super.unshift(...items);
    this.consumer("I", items);
    return len;
  }
  splice(start: number, delCnt: number, ...items: T[]) {
    const deleted = super.splice(start, delCnt, ...items);
    this.consumer("D", deleted);
    this.consumer("I", items);
    return deleted;
  }
}
export const injectInterceptor = <T>(initials: T[], consumer: Consumer<T>) =>
  new ArrayWrapper<T>(initials, consumer);
