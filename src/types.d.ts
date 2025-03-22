type Needle = string | RegExp;
type ReplacerFunction<T> = (match: string, index: number) => T;
type TokenArray<T> = [Needle, ReplacerFunction<T>][];
type NeedleReplacerMap<T> = Map<Needle, ReplacerFunction<T>>;
type Output<T> = (string | T)[];
