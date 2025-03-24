import {
    transformToRegexp,
    transformToNeedleReplacerArray,
} from "./transforms.js";

import { NeedleReplacerMap, ReplacerFunction, Needle, Haystack } from "./types";

/**
 * Replace all instances of a given needle with anything defined by the callback.
 * Any passed regular expressions MUST have a capture group. i.e: `/(Username)/gmi`
 */
export function stringReplaceCallback<T>(
    haystack: Haystack<T>,
    needleStringRegexOrMap: string | RegExp | NeedleReplacerMap<T>,
    replacer?: ReplacerFunction<T>
) {
    // for return type consistency, we always return an array.
    if (typeof haystack === "string" && haystack.length === 0) {
        return [];
    }

    const haystackAsFlatArray = Array.isArray(haystack)
        ? (haystack.flat() as (string | T)[])
        : [haystack];

    const tokens = transformToNeedleReplacerArray(
        needleStringRegexOrMap,
        replacer
    );
    if (tokens.length === 0) {
        throw new RangeError("stringReplaceCallback has no valid needles.");
    }
    return tokens.reduce((acc, [ned, rep], index) => {
        if (typeof ned !== "string" && !(ned instanceof RegExp)) {
            throw new TypeError(
                "stringReplaceCallback was passed an invalid needle."
            );
        }
        if (typeof rep !== "function") {
            throw new TypeError(
                "stringReplaceCallback was passed an invalid replacer."
            );
        }
        return replace(acc, ned, rep, index);
    }, haystackAsFlatArray);
}

function replace<T>(
    haystack: string[] | T[],
    needle: Needle,
    replacer: ReplacerFunction<T>,
    needleIndex: number
): string[] | T[] {
    return haystack.flatMap((element: string | T) => {
        if (typeof element === "string" && element.length > 0) {
            const regexp = transformToRegexp(needle);

            let unprocessedString = element;
            let results = [];
            let matchIndex = 0;

            let match: boolean | RegExpMatchArray = true;
            while (match) {
                const clonedRegex = new RegExp(regexp.source, regexp.flags);
                match = clonedRegex.exec(unprocessedString);
                let [remainingString, biteResults] = takeABite(
                    match,
                    unprocessedString,
                    replacer,
                    needleIndex,
                    matchIndex
                );
                unprocessedString = remainingString;
                results = [...results, ...biteResults];
                matchIndex += 1;
            }
            return results;
        }
        return element;
    });
}

/**
 * Process a single match, and then redact the processed chunk from the unprocessed string.
 */
function takeABite<T>(
    match: RegExpMatchArray,
    unprocessedString: string,
    replacer: ReplacerFunction<T>,
    needleIndex: number,
    matchIndex: number
) {
    // if no further match was found, return any uneaten string characters.
    if (match === null) {
        const remainingString = unprocessedString;

        if (unprocessedString.length > 0) {
            return [remainingString, [unprocessedString]] as const;
        }
        return ["", []] as const;
    }
    let results = [];
    let remainingString = unprocessedString;

    if (match.index !== 0) {
        // If the first match is not the first character, append the prefix string to the results array
        results.push(remainingString.slice(0, match.index));

        // remove the prefix string from the processable string.
        remainingString = remainingString.substring(match.index);
    }

    const firstMatch = match.at(0);
    results.push(
        replacer(firstMatch, {
            match,
            key: [needleIndex, matchIndex].join("-"),
            needleIndex,
            matchIndex,
        })
    );
    remainingString = remainingString.substring(firstMatch.length);

    return [remainingString, results] as const;
}
