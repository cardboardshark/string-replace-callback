/**
 * Replace all instances of a given needle with anything defined by the callback.
 * Any passed regular expressions MUST have a capture group. i.e: `/(Username)/gmi`
 */
export function stringReplaceCallback<T>(
  haystack: string,
  needleStringOrMap: string | NeedleReplacerMap<T>,
  replacer?: ReplacerFunction<T>
) {
  if (!haystack) {
    throw new ReferenceError("stringReplaceCallback is missing a haystack.");
  }

  // for return type consistency, we always return an array.
  if (typeof haystack === "string" && haystack.length === 0) {
    return [haystack];
  }

  const tokens = transformToTokenArray(needleStringOrMap, replacer);
  if (tokens.length === 0) {
    throw new RangeError("stringReplaceCallback has no valid needles.");
  }

  return tokens.reduce<Output<T>>(
    (acc, [ned, rep]) => {
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
      return replace(acc, ned, rep);
    },
    [haystack]
  );
}

function replace<T>(
  haystack: string[] | T[],
  needle: Needle,
  replacer: ReplacerFunction<T>
) {
  const haystackAsArray = Array.isArray(haystack) ? haystack : [haystack];
  return haystackAsArray.flatMap((element: string | T) => {
    // Since only strings can be parsed, we can safely assume anything else has been parsed by a previous loop.
    const isString = typeof element === "string";
    const isBlankString = isString && element.length === 0;

    if (isString && !isBlankString) {
      const regexp = transformToRegexp(needle);
      const elements = element.split(regexp);
      return elements.reduce<(string | T)[]>((acc, match, index) => {
        // don't append to the results if the Regexp capture group found nothing
        if (match === undefined) {
          return acc;
        }

        // every second element is a replaceable token.
        const isToken = index % 2;
        if (isToken) {
          acc.push(replacer(match, index));
        } else if (match !== "") {
          // ignore empty strings
          acc.push(match);
        }

        return acc;
      }, []);
    }
    return element;
  });
}

function transformToTokenArray<T>(
  needleStringOrMap: string | NeedleReplacerMap<T>,
  replacerFunction?: ReplacerFunction<T>
): TokenArray<T> {
  if (needleStringOrMap instanceof Map) {
    return Array.from(needleStringOrMap.entries());
  }
  if (typeof needleStringOrMap !== "string") {
    throw new TypeError(`Invalid ${typeof needleStringOrMap} was passed.`);
  }
  if (!replacerFunction) {
    throw new TypeError(
      `${typeof needleStringOrMap} was passed without replacerFunction.`
    );
  }
  return [[needleStringOrMap, replacerFunction]];
}

function transformToRegexp(needle: Needle) {
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
