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

console.log("Part 1", puzzle.map(([s, e]) => matchCount(s, e)).reduce(sum));

// Part 2: requires redoing this, write a dynamic programming-like matcher...
