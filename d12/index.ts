import { inputLines, isPresent, sum } from "../lib/";

type Run = "#" | "?";
type Expected = number[];

let parse = (s: string): [string, Expected] => {
  let [a, b] = s.split(" ");
  return [a, b.split(",").map((x) => parseInt(x, 10))];
};

let puzzle = (await inputLines()).map(parse);

let matches = (
  actual: string,
  runs: number[],
  i: number = 0,
  r: number = 0
): number => {
  let table = {};

  let memo =
    (fn) =>
    (...args) => {
      let key = args.join(",");
      let result = table[key];
      if (result === undefined) {
        result = fn.apply(this, args);
        table[key] = result;
      }
      return result;
    };

  let calc = memo((i, r) => {
    // If we're out of observations, it was a success iff we're also at end of runs
    if (i > actual.length) return r >= runs.length ? 1 : 0;
    // If we're at end of runs, it was a success iff the rest can all be fine.
    if (runs.length - r === 0) return actual.lastIndexOf("#") < i ? 1 : 0;

    // If this space is a dot, skip it and match a run starting at next
    let matchesAsDot = calc(i + 1, r);

    // If this space is a hash, see if we can consume enough hashes to make up this run
    let run = runs[r];
    let matchesAsHash =
      run <= actual.length - i &&
      actual.slice(i, i + run).indexOf(".") === -1 &&
      actual[i + run] !== "#"
        ? calc(i + run + 1, r + 1)
        : 0;

    switch (actual[i]) {
      case ".":
        return matchesAsDot;
      case "#":
        return matchesAsHash;
      default:
        return matchesAsDot + matchesAsHash;
    }
  });

  return calc(0, 0);
};

console.log("Part 1", puzzle.map(([s, e]) => matches(s, e)).reduce(sum));

// Part 2:

let lengthen = ([s, e]): [string, Expected] => {
  let e2: Expected = new Array(e.length * 5)
    .fill(0)
    .map((_x, i) => e[i % e.length]);
  return [new Array(5).fill(s).join("?"), e2];
};

console.log(
  "Part 2",
  puzzle
    .map(lengthen)
    .map(([s, e]) => matches(s, e))
    .reduce(sum)
);
