import test from "node:test";
import assert from "node:assert/strict";

import { binarySearchLeftmost, lowerBound } from "../src/binarySearch.js";

// Deterministic PRNG (mulberry32) so randomized tests are reproducible.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// All combinations of `n` elements drawn from `alphabet`, in sorted order
// (combinations with repetition) — used for the exhaustive small-input test.
function* combinationsWithReplacement(alphabet, n, start = 0, prefix = []) {
  if (n === 0) {
    yield prefix;
    return;
  }
  for (let i = start; i < alphabet.length; i++) {
    yield* combinationsWithReplacement(alphabet, n - 1, i, [...prefix, alphabet[i]]);
  }
}

test("empty array", () => {
  assert.equal(binarySearchLeftmost([], 1), -1);
});

test("single element found / not found", () => {
  assert.equal(binarySearchLeftmost([7], 7), 0);
  assert.equal(binarySearchLeftmost([7], 8), -1);
});

test("exact match unique", () => {
  assert.equal(binarySearchLeftmost([1, 3, 5, 7, 9], 5), 2);
  assert.equal(binarySearchLeftmost([1, 3, 5, 7, 9], 1), 0);
  assert.equal(binarySearchLeftmost([1, 3, 5, 7, 9], 9), 4);
});

test("not found: smaller / larger / between", () => {
  assert.equal(binarySearchLeftmost([2, 4, 6], 1), -1);
  assert.equal(binarySearchLeftmost([2, 4, 6], 7), -1);
  assert.equal(binarySearchLeftmost([2, 4, 6], 5), -1);
});

test("leftmost of duplicates", () => {
  assert.equal(binarySearchLeftmost([1, 2, 2, 2, 3], 2), 1);
  assert.equal(binarySearchLeftmost([2, 2, 2, 2], 2), 0);
  assert.equal(binarySearchLeftmost([1, 2, 3, 3, 4], 3), 2);
});

test("duplicates at start / end", () => {
  assert.equal(binarySearchLeftmost([3, 3, 4, 5], 3), 0);
  assert.equal(binarySearchLeftmost([1, 2, 3, 3], 3), 2);
});

test("all same elements", () => {
  assert.equal(binarySearchLeftmost([5, 5, 5, 5, 5], 5), 0);
});

test("even-length array", () => {
  assert.equal(binarySearchLeftmost([1, 2, 2, 3, 4, 5], 2), 1);
  assert.equal(binarySearchLeftmost([1, 2, 2, 3, 4, 5], 4), 4);
});

test("strings", () => {
  assert.equal(binarySearchLeftmost(["a", "b", "b", "c"], "b"), 1);
});

test("floats", () => {
  assert.equal(binarySearchLeftmost([0.5, 1.5, 1.5, 2.5], 1.5), 1);
});

test("negative numbers", () => {
  assert.equal(binarySearchLeftmost([-5, -3, -3, -1, 0], -3), 1);
});

test("zero and boundary values", () => {
  assert.equal(binarySearchLeftmost([0, 0, 1], 0), 0);
  assert.equal(binarySearchLeftmost([-1, 0, 1], 0), 1);
});

test("large array with duplicates", () => {
  const values = Array.from({ length: 100_000 }, (_, i) => Math.floor(i / 100)); // 0..999, 100 copies each
  assert.equal(binarySearchLeftmost(values, 0), 0);
  assert.equal(binarySearchLeftmost(values, 500), 50_000);
  assert.equal(binarySearchLeftmost(values, 999), 99_900);
  assert.equal(binarySearchLeftmost(values, 1000), -1);
});

test("large array of even numbers only", () => {
  const values = Array.from({ length: 10_000 }, (_, i) => i * 2); // 0, 2, ..., 19998
  assert.equal(binarySearchLeftmost(values, 0), 0);
  assert.equal(binarySearchLeftmost(values, 1234), 617);
  assert.equal(binarySearchLeftmost(values, 1235), -1); // odd, absent
  assert.equal(binarySearchLeftmost(values, 19_998), 9_999);
  assert.equal(binarySearchLeftmost(values, 20_000), -1);
});

test("duplicates everywhere", () => {
  const values = [...Array(50).fill(1), ...Array(50).fill(2), ...Array(50).fill(3)];
  assert.equal(binarySearchLeftmost(values, 1), 0);
  assert.equal(binarySearchLeftmost(values, 2), 50);
  assert.equal(binarySearchLeftmost(values, 3), 100);
  assert.equal(binarySearchLeftmost(values, 4), -1);
  assert.equal(binarySearchLeftmost(values, 0), -1);
});

test("every element found at its first occurrence", () => {
  const values = [1, 1, 2, 3, 3, 3, 4, 5, 5, 6];
  for (let i = 0; i < values.length; i++) {
    if (i === 0 || values[i - 1] !== values[i]) {
      assert.equal(binarySearchLeftmost(values, values[i]), i);
    }
  }
});

test("returns a number", () => {
  assert.equal(typeof binarySearchLeftmost([1, 2, 2, 3], 2), "number");
});

test("custom comparator: objects sorted by id", () => {
  const values = [{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }];
  const byId = (a, b) => a.id - b.id;
  assert.equal(binarySearchLeftmost(values, { id: 2 }, byId), 1);
  assert.equal(binarySearchLeftmost(values, { id: 4 }, byId), -1);
});

test("custom comparator: case-insensitive strings", () => {
  const values = ["a", "B", "b", "C"]; // sorted case-insensitively: a < b == b < c
  const ci = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());
  assert.equal(binarySearchLeftmost(values, "b", ci), 1);
  assert.equal(binarySearchLeftmost(values, "B", ci), 1); // same key -> leftmost
  assert.equal(binarySearchLeftmost(values, "d", ci), -1);
});

test("matches Array.prototype.indexOf on random arrays (leftmost semantics)", () => {
  const rand = mulberry32(42);
  for (let iter = 0; iter < 1000; iter++) {
    const n = Math.floor(rand() * 60);
    const values = Array.from({ length: n }, () => Math.floor(rand() * 10)).sort((a, b) => a - b);
    const target = Math.floor(rand() * 10);
    assert.equal(binarySearchLeftmost(values, target), values.indexOf(target));
  }
});

test("lowerBound: empty / front / between / end", () => {
  assert.equal(lowerBound([], 1), 0);
  assert.equal(lowerBound([5, 6, 7], 1), 0);
  assert.equal(lowerBound([5, 6, 7], 5), 0);
  assert.equal(lowerBound([1, 3, 5], 4), 2);
  assert.equal(lowerBound([1, 3, 5], 3), 1);
  assert.equal(lowerBound([1, 2, 3], 4), 3);
  assert.equal(lowerBound([1, 2, 3], 3), 2);
});

test("lowerBound: duplicates and all-equal runs", () => {
  assert.equal(lowerBound([1, 2, 2, 2, 3], 2), 1);
  assert.equal(lowerBound([2, 2, 2], 2), 0);
  assert.equal(lowerBound([1, 1, 1], 2), 3);
  assert.equal(lowerBound([4, 4, 4, 4], 4), 0);
  assert.equal(lowerBound([4, 4, 4, 4], 3), 0);
  assert.equal(lowerBound([4, 4, 4, 4], 5), 4);
});

test("lowerBound: negative numbers", () => {
  assert.equal(lowerBound([-5, -3, -1], -4), 1);
  assert.equal(lowerBound([-5, -3, -1], -5), 0);
});

test("lowerBound: equals the number of elements strictly less than target", () => {
  const rand = mulberry32(1234);
  for (let iter = 0; iter < 1000; iter++) {
    const n = Math.floor(rand() * 80);
    const values = Array.from({ length: n }, () => Math.floor(rand() * 20)).sort((a, b) => a - b);
    const target = Math.floor(rand() * 20);
    const strictlyLess = values.filter((v) => v < target).length;
    assert.equal(lowerBound(values, target), strictlyLess);
  }
});

test("exhaustive: every sorted multiset up to length 7 over {0,1,2,3}", () => {
  const alphabet = [0, 1, 2, 3];
  const targets = [0, 1, 2, 3, 4]; // 4 is always absent
  for (let length = 0; length <= 7; length++) {
    for (const values of combinationsWithReplacement(alphabet, length)) {
      for (const target of targets) {
        assert.equal(
          binarySearchLeftmost(values, target),
          values.indexOf(target),
          `values=${JSON.stringify(values)} target=${target}`,
        );
      }
    }
  }
});
