# String Replace Callback
This zero-dependency type-safe package lets a dev replace any arbritrary string with a React or JSX Component without losing React's XSS protection. It's intended for use with hydrating user-generated content with links or other rich elements.

`stringReplaceCallback('My vanilla haystack', 'vanilla', (match) => <MagicComponent>{match}</MagicComponent/>)`

Transforms "My vanilla haystack" into "My 🪄Magic🪄 haystack".



## Regexp Needles
Needles can be either a string or regular expression. Note that regular expressions _must_ use a capture group, or they straight-up won't work.
 
```
function UserSummary() {
  const haystack = 'My username is @FirstNameMcLastName, and...';
  const needle = /(@.[^, ]*)/gmi;
  const replacerCallback = (name, index) => {
     <Link to={name}>{name}</Link/>
  }
  return stringReplaceCallback(haystack, needle, replacerCallback);
}
```

## Map it out
If you have a barrage of tokens to target, pass the method a Map keyed by needle.

```
const phoneNumberRegexp = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/gm;

const tokenMap = new Map();
tokenMap.set('keywordNeedle', (match) => <b>{match}</b>)
tokenMap.set('phoneNumberRegexp', (match) => <PhoneNumber number={match} />)

stringReplaceCallback('User profile data...', tokenMap);
```
_( why a Map and not an object? Because maps remember their insert order, and objects keys can't be regexps. )_

# Comparison to other projects
This is inspired by https://www.npmjs.com/package/react-string-replace/v/1.1.1, but with Typescript and untethered from React.
