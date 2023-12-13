import { input, sum } from "../lib/";

// Representation
type Puzzle = string[];
type Puzzles = Puzzle[];

// Parse
let puzzles: Puzzles = (await input()).split("\n\n").map((p) => p.split("\n"));

let reflectsAt = (p: Puzzle, row: number): boolean => {
  let size = Math.min(p.length - row, row);
  if (size === 0) return false;
  let above = p.slice(row - size, row);
  let below = p.slice(row, row + size).reverse();
  return rowsEqual(above, below);
};

let rowsEqual = (r1: string[], r2: string[]): boolean => {
  return r1.length === r2.length && r1.every((r, i) => r === r2[i]);
};

let transpose = (p: Puzzle): Puzzle => {
  let t = new Array(p[0].length).fill("");
  p.forEach((line, row) => {
    line.split("").forEach((value, col) => {
      t[col] += value;
    });
  });
  return t;
};

let reflectionScore = (ps: Puzzles): number =>
  ps
    .map((p) =>
      new Array(p.length)
        .fill(0)
        .map((_x, i) => reflectsAt(p, i))
        .indexOf(true)
    )
    .filter((x) => x >= 0)
    .reduce(sum);

console.log(
  "Part 1",
  reflectionScore(puzzles) * 100 + reflectionScore(puzzles.map(transpose))
);

// Part 2: reflection smudges
// Overall: find a spot where reflectionErrors == 1

let reflectsAtWithSmudge = (p: Puzzle, row: number): boolean => {
  let size = Math.min(p.length - row, row);
  if (size === 0) return false;
  let above = p.slice(row - size, row);
  let below = p.slice(row, row + size).reverse();
  return equalButOne(above, below);
};

let equalButOne = (r1: string[], r2: string[]): boolean => {
  let s = 0;
  for (let i = 0; i < r1.length; i++) {
    for (let j = 0; j < r1[i].length; j++) {
      if (r1[i][j] !== r2[i][j]) s++;
    }
  }
  return s === 1;
};

let reflectionScoreWithSmudge = (ps: Puzzles): number =>
  ps
    .map((p) =>
      new Array(p.length)
        .fill(0)
        .map((_x, i) => reflectsAtWithSmudge(p, i))
        .indexOf(true)
    )
    .filter((x) => x >= 0)
    .reduce(sum, 0);

console.log(
  "Part 1",
  reflectionScoreWithSmudge(puzzles) * 100 +
    reflectionScoreWithSmudge(puzzles.map(transpose))
);
