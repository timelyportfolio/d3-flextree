# Implementation notes

Here are a couple of notes regarding implementation issues. This is by
no means comprehensive -- just miscellaneous bits that might come in handy
later.

## Packaging

This was my first experience with ES6 modules and with Rollup, so this
might not be the best way to do things.

*src/main.js* only has one export (the `flextree()` function), but doesn't
use the *default* export. Instead, the function is exported with the name
`flextree`. This facilitates it being put into the global `d3` object by
rollup.
