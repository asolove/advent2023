import { inputLines, isPresent, sum } from "../lib/";

type Run = "#" | "?";
type Expected = number[];

let parse = (s: string): [string, Expected] => {
  let [a, b] = s.split(" ");
  return [a, b.split(",").map((x) => parseInt(x, 10))];
};

let puzzle = (await inputLines()).map(parse);

let possibleObservations = (s: string, expectedDamaged: number): string[] => {
  let knownDamaged = s.split("").filter((c) => c === "#").length;
  let unknown = s.split("").filter((c) => c === "?").length;

  let rs: string[] = [];
  choose(unknown, expectedDamaged - knownDamaged).forEach((replacements) => {
    let i = 0;
    rs.push(s.replace(/\?/g, (_c) => (replacements[i++] ? "#" : ".")));
  });
  return rs;
};

let summary = (s: string) =>
  s
    .split(".")
    .filter((x) => x.length > 0)
    .map((x) => x.length);

let matches = (s: string, e: Expected) => {
  let runs = summary(s);
  return e.length === runs.length && e.every((v, i) => v === runs[i]);
};

let choose = (n: number, k: number): boolean[][] => {
  if (k > n) return [];
  if (n === 0) return [[]];

  let withTrue: boolean[][] = [];
  let withFalse: boolean[][] = [];
  if (k < n) withFalse = choose(n - 1, k).map((r) => r.concat(false));
  if (k !== 0) withTrue = choose(n - 1, k - 1).map((r) => r.concat(true));
  return withTrue.concat(withFalse);
};

let matchCount = (s: string, expected: Expected): number => {
  let possible = possibleObservations(s, expected.reduce(sum));
  let matching = possible.filter((s) => matches(s, expected));
  return matching.length;
};

let fasterMatchCount = (
  actual: string,
  runs: number[],
  i: number = 0,
  r: number = 0
): number => {
  let table = new Array(actual.length + 1)
    .fill([])
    .map((_x) => new Array(runs.length + 1).fill(NaN));

  let memo = (i, r) => {
    let result;
    try {
      result = table[i][r];
    } catch {
      result = NaN;
    }
    if (isNaN(result)) {
      result = calc(i, r);
      if (i <= actual.length && r <= runs.length) table[i][r] = result;
    }
    return result;
  };

  let calc = (i, r) => {
    // console.log(actual.length - i, runs.length);
    // If we're out of observations, it was a success iff we're also at end of runs
    if (i > actual.length) return r >= runs.length ? 1 : 0;
    // If we're at end of runs, it was a success iff the rest can all be fine.
    if (runs.length - r === 0) return actual.lastIndexOf("#") < i ? 1 : 0;

    if (actual[i] === ".") return memo(i + 1, r);
    if (actual[i] === "#") {
      let run = runs[r];
      return run <= actual.length - i &&
        actual.slice(i, i + run).indexOf(".") === -1 &&
        actual[i + run] !== "#"
        ? memo(i + run + 1, r + 1)
        : 0;
    }
    let matchesAsDot = memo(i + 1, r);
    let run = runs[r];
    let matchesAsHash =
      run <= actual.length - i &&
      actual.slice(i, i + run).indexOf(".") === -1 &&
      actual[i + run] !== "#"
        ? memo(i + run + 1, r + 1)
        : 0;
    return matchesAsDot + matchesAsHash;
  };
  return memo(0, 0);
};

console.log(
  "Part 1",
  puzzle.map(([s, e]) => fasterMatchCount(s, e)).reduce(sum)
);

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
    .map(([s, e]) => fasterMatchCount(s, e))
    .reduce(sum)
);
