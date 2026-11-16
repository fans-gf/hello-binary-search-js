# hello-binary-search-js

[![tests](https://github.com/fans-gf/hello-binary-search-js/actions/workflows/test.yml/badge.svg)](https://github.com/fans-gf/hello-binary-search-js/actions/workflows/test.yml)

Leftmost-exact-match binary search in JavaScript (ES modules, zero dependencies).

Given an array sorted in non-decreasing order, `binarySearchLeftmost` returns the
index of the **first** occurrence of `target`, or `-1` if absent — in O(log n) time
and O(1) space.

## Usage

```js
import { binarySearchLeftmost, lowerBound } from "./src/binarySearch.js";

binarySearchLeftmost([1, 2, 2, 2, 3], 2); // 1 (leftmost exact match)
binarySearchLeftmost([1, 2, 3], 4);       // -1 (absent)
binarySearchLeftmost(["a", "b", "b"], "b"); // 1

// Custom comparator for objects (like Array.prototype.sort):
const byId = (a, b) => a.id - b.id;
binarySearchLeftmost([{ id: 1 }, { id: 2 }, { id: 2 }], { id: 2 }, byId); // 1

// lowerBound: insertion point of target (first index with element >= target),
// in [0, values.length] — like bisect_left.
lowerBound([1, 2, 2, 3], 2); // 1
lowerBound([1, 2, 3], 4);    // 3
```

**Precondition:** `values` must be sorted in non-decreasing order according to the
same comparator used for the search. Behavior on unsorted input is undefined.
Default ordering uses `<` / `>` (numbers, strings); pass `compare(a, b)` (negative /
zero / positive, like `Array.prototype.sort`) for anything else.

## Running the tests

Requires Node.js >= 18 (tests use the built-in `node:test` runner — no dependencies).

```bash
npm test          # or: node --test
```

The suite covers empty/single/even-length arrays, duplicates at start/middle/end,
boundary values, large arrays (100k elements), a custom-comparator object search,
an exhaustive check of every sorted multiset of length ≤ 7 over `{0,1,2,3}`, and
seeded randomized property tests against `Array.prototype.indexOf` /
`Array.prototype.filter`.

Tests also run on every push via GitHub Actions (see
[.github/workflows/test.yml](.github/workflows/test.yml)).
