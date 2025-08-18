// src/@types/lodash.debounce.d.ts
declare module 'lodash.debounce' {
  import type { DebouncedFunc } from 'lodash';
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: {
      leading?: boolean;
      maxWait?: number;
      trailing?: boolean;
    }
  ): DebouncedFunc<T>;
  export default debounce;
}
