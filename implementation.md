# Implementation notes

Here are a couple of notes regarding implementation issues. This is by
no means comprehensive -- just miscellaneous bits that might come in handy
later.

## Packaging

This was my first experience with ES6 modules and with Rollup, so this
might not be the best way to do things.

*src/main.js* defines one default export: the `flextree()` function.

In a D3 environment, the `flextree()` function needs to be a property of
the global `d3` object. The file d3.js is used as an adapter for this purpose.
