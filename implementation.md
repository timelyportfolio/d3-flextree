# Implementation notes

Here are a couple of notes regarding implementation issues. This is not a
comprehensive reference; it's just miscellaneous notes that might come in
handy someday.

A side goal of implementing this as a D3 plugin is actually to loosen its
coupling with D3. There's no real reason anyone has to use any particular
package to do the rendering.

## The Algorithm

The existing D3 tree layout is based on an algorithm developed originally by
Reingold and Tilford in a paper from 1981, with improvements by various others.
The latest improvement was from a paper by Bucheim and Leipert, in 2002. The
algorithm has been proven to run in linear time (O(n)).

However, a limitation of that algorithm is that it or assumes that all of
the nodes of the tree are the same size. This is fine for many applications,
but others could benefit from allowing variable node sizes.

In a paper from 2013, A.J. van der Ploeg enhanced the algorithm to allow for
variable-sized nodes, while keeping its linear runtime nature. The author of
that paper provide his algorithm as a working Java application on GitHub at
[cwi-swat/non-layered-tidy-trees](https://github.com/cwi-swat/non-layered-tidy-trees).

I adapted that code into this flextree plugin, and added a lot of tests.


## Packaging

[This was my first foray into writing ES6 modules and using Rollup, so if
there's a better way to do some things, please let me know.]

*src/main.js* only has one export (the `flextree()` function), but doesn't
use the *default* export. Instead, the function is exported with the name
`flextree`. This facilitates it being put into the global `d3` object by
rollup.
