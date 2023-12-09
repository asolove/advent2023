import { input, sum } from "../lib";

// Parse
let parseRows = (s) =>
  s.split("\n").map((l) => l.split(" ").map((x) => parseInt(x, 10)));

// IO
let rows = parseRows(await input());

// Part 1
let predictNext = (row: number[]): number => {
  if (row.every((n) => n === 0)) return 0;
  return predictNext(diffs(row)) + row[row.length - 1];
};

let diffs = (row: number[]): number[] => row.slice(1).map((x, i) => x - row[i]);

console.log("Part 1", rows.map(predictNext).reduce(sum));

// Part 2
let predictFirst = (row: number[]): number => {
  if (row.every((n) => n === 0)) return 0;
  return row[0] - predictFirst(diffs(row));
};

console.log("Part 2", rows.map(predictFirst).reduce(sum));
