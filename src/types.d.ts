export type Haystack<T> = string | string[] | T[];
export type Needle = string | RegExp;
export type ReplacerFunction<T> = (
    match: string,
    meta: {
        match: RegExpMatchArray;
        needleIndex: number;
        matchIndex: number;
        key: string;
    }
) => T;
export type ToNeedleReplacerArray<T> = [Needle, ReplacerFunction<T>][];
export type NeedleReplacerMap<T> = Map<Needle, ReplacerFunction<T>>;
