/**
 * Binary search utilities.
 *
 * All functions assume the input array is sorted in non-decreasing order
 * according to the comparator. `target` and the elements of `values` must be
 * comparable: by default with the `<`/`>` operators (numbers, strings), or
 * via an optional `compare(a, b)` function returning a negative number when
 * `a < b`, a positive number when `a > b`, and 0 when they are equal —
 * e.g. `(a, b) => a.id - b.id`. Comparators like `Array.prototype.sort` are
 * supported.
 */

/** Default ordering: `<` / `>` on primitives. */
function defaultCompare(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Return the insertion point of `target` in sorted `values`: the index of
 * the first element greater than or equal to `target` (equivalently, the
 * position where `target` could be inserted to keep the array sorted).
 *
 * Runs in O(log n) time and O(1) space.
 *
 * @param {Array<*>} values - array sorted in non-decreasing order.
 * @param {*} target - value to locate.
 * @param {(a: *, b: *) => number} [compare] - optional comparator.
 * @returns {number} insertion point in the range `[0, values.length]`.
 *
 * @example
 * lowerBound([1, 2, 2, 2, 3], 2); // 1
 * lowerBound([1, 2, 3], 4);       // 3
 */
export function lowerBound(values, target, compare = defaultCompare) {
  let left = 0;
  let right = values.length; // invariant: answer is in [left, right]
  while (left < right) {
    const mid = Math.floor((left + right) / 2); // overflow-safe, unlike bit tricks for huge arrays
    if (compare(values[mid], target) < 0) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}

/**
 * Return the leftmost index of `target` in sorted `values`.
 *
 * Returns the index of the first occurrence of `target`, or -1 if `target`
 * is not present. Runs in O(log n) time and O(1) space.
 *
 * @param {Array<*>} values - array sorted in non-decreasing order.
 * @param {*} target - value to locate.
 * @param {(a: *, b: *) => number} [compare] - optional comparator.
 * @returns {number} index of the first occurrence, or -1.
 *
 * @example
 * binarySearchLeftmost([1, 2, 2, 2, 3], 2); // 1
 * binarySearchLeftmost([1, 2, 3], 4);       // -1
 */
export function binarySearchLeftmost(values, target, compare = defaultCompare) {
  const index = lowerBound(values, target, compare);
  if (index < values.length && compare(values[index], target) === 0) {
    return index;
  }
  return -1;
}

export default { lowerBound, binarySearchLeftmost };
