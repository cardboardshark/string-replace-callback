export type Needle = string | RegExp;
export type ReplacerFunction<T> = (match: string, index: number) => T;
export type TokenArray<T> = [Needle, ReplacerFunction<T>][];
export type NeedleReplacerMap<T> = Map<Needle, ReplacerFunction<T>>;
export type Output<T> = (string | T)[];

export const stringReplaceCallback = (
  haystack: string,
  needleStringOrMap: string | NeedleReplacerMap<T>,
  replacer?: ReplacerFunction<T>
) => Output<T>;
