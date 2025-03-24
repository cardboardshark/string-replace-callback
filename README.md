# String Replace Callback

This zero-dependency package lets a dev replace a string with a React or JSX Component without losing React's XSS protection. It's intended to safely populate user-generated content with rich elements. 


## Usage:
Needles can be either a string or regular expression, and your callback function can return anything. Note that regular expression needles _must_ use a capture group, or they straight-up won't work.

**String needle**

`stringReplaceCallback('My vanilla haystack', 'vanilla', (match) => <MagicComponent type={match} />)`

**Regexp needle**

`stringReplaceCallback('My vanilla haystack', /vanilla/gmi, (match) => <MagicComponent type={match} />)`

**Map**

If you have a stack of tokens to replace, you can pass it a Map keyed by needle.


```
const tokenMap = new Map();
tokenMap.set(/vanilla/gmi, (match) => <b>{match}</b>)
tokenMap.set('haystack', (match) => <i>{match}</i>)

stringReplaceCallback('My vanilla haystack', tokenMap);
```

**Multiple passes**

If you don't want to use a Map, you can also sequentially process the same haystack.

```
const firstPass = stringReplaceCallback('My vanilla haystack', 'vanilla', (match) => <b>{match}</b>)
return stringReplaceCallback(firstPass, /haystack/gmi, (match) => <i>{match}</i>);
```

## Replacer Function Shape
Simple replacers can use the first match property, but the full Regex match object is available if you need it. A unique string key is returned for React components.

```
export type ReplacerFunction<T> = (
    firstMatch: string,
    meta: {
        match: RegExpMatchArray;
        needleIndex: number;
        matchIndex: number;
        key: string;
    }
) => T;
```


## Examples

```
function UserSummary() {
  const haystack = 'My username is @FirstNameMcLastName, and...';
  const needle = /(@.[^, ]\*)/gmi;
  const replacerCallback = (name, {key) => {
      return <LinkWithHoverTooltip to={name} key={key}>{name}</Link/>
  }
  return stringReplaceCallback(haystack, needle, replacerCallback);
}
```

```
function ContactClient(clientInfo :string) {
  const phoneNumberRegexp = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/gm;
  const replacerCallback = (number, {key) => <PhoneComponent number={number} key={key}>;
  return stringReplaceCallback(clientInfo, phoneNumberRegexp, replacerCallback);
}

```

# Comparison to other projects

This is inspired by https://www.npmjs.com/package/react-string-replace/, but stringReplaceCallback is:

1. Not tethered to React. It can be used with React, JSX, Vue, Web Components, HTMX or your framework of choice.
1. Accepts Maps for multiple tokens rather than requiring sequential passes.
1. Type-safe.
