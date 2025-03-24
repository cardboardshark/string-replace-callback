import { NeedleReplacerMap, ReplacerFunction, Needle } from "./types";

export function transformToNeedleReplacerArray<T>(
    needleStringOrMap: string | RegExp | NeedleReplacerMap<T>,
    replacerFunction?: ReplacerFunction<T>
) {
    if (needleStringOrMap instanceof Map) {
        return Array.from(needleStringOrMap.entries());
    }

    if (
        typeof needleStringOrMap !== "string" &&
        !(needleStringOrMap instanceof RegExp)
    ) {
        throw new TypeError(
            `Invalid needle of type ${typeof needleStringOrMap} was passed.`
        );
    }
    if (!replacerFunction) {
        throw new TypeError(
            `Needle ${typeof needleStringOrMap} was passed without a corresponding replacerFunction.`
        );
    }
    return [[needleStringOrMap, replacerFunction]];
}

export function transformToRegexp(needle: Needle) {
    if (needle instanceof RegExp) {
        return needle;
    }
    const sanitizedNeedle = escapeRegExp(needle);
    return new RegExp(`(${sanitizedNeedle})`, "gmi");
}

function escapeRegExp(string: string) {
    const pattern = /[\\^$.*+?()[\]{}|]/g;
    return string && pattern.test(string)
        ? string.replace(pattern, "\\$&")
        : string;
}
