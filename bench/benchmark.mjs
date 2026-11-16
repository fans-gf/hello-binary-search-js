/**
 * Benchmark binarySearchLeftmost. Run: node bench/benchmark.mjs
 *
 * Same methodology across the Python / JavaScript / Clojure repos:
 * fixed set of 1024 seeded-random targets per scenario (cycled),
 * 20,000 warmup ops, then 5 timed reps of 51,200 ops; report best-of-5 ns/op.
 * Comparison numbers are machine-specific — re-run locally to reproduce.
 */

import { performance } from "node:perf_hooks";
import { binarySearchLeftmost } from "../src/binarySearch.js";

const REPS = 5;
const BATCH = 50 * 1024; // 51,200 searches per timed rep

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bench(name, data, targets) {
  const n = targets.length;
  for (let i = 0; i < 20_000; i++) binarySearchLeftmost(data, targets[i % n]); // warmup
  let best = Infinity;
  for (let rep = 0; rep < REPS; rep++) {
    const start = performance.now();
    for (let i = 0; i < BATCH; i++) binarySearchLeftmost(data, targets[i % n]);
    best = Math.min(best, ((performance.now() - start) * 1e6) / BATCH);
  }
  const label = name.padEnd(48, " ");
  console.log(`${label} n=${String(data.length).padEnd(9)} best=${best.toFixed(1).padStart(9)} ns/op  (${Math.round(1e9 / best).toLocaleString("en-US")} ops/s)`);
}

const rand = mulberry32(42);
const ri = (n) => Math.floor(rand() * n);

const full = Array.from({ length: 1_000_000 }, (_, i) => i);
bench("hit, unique elements", full, Array.from({ length: 1024 }, () => ri(1_000_000)));

const evens = Array.from({ length: 1_000_000 }, (_, i) => i * 2);
bench("miss, odd target in even array", evens, Array.from({ length: 1024 }, () => ri(1_000_000) * 2 + 1));

const dups = Array.from({ length: 1_000_000 }, (_, i) => Math.floor(i / 50));
bench("hit, leftmost of duplicates", dups, Array.from({ length: 1024 }, () => ri(20_000)));

const small = Array.from({ length: 100 }, (_, i) => i);
bench("hit, small array", small, Array.from({ length: 1024 }, () => ri(100)));
