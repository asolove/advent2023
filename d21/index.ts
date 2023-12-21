import { inputLines } from "../lib";

let grid = (await inputLines()).map((l) => l.split(""));

type Pos = { r: number; c: number };

let canStep = ({ r, c }: Pos): boolean =>
  r >= 0 &&
  r < grid.length &&
  c >= 0 &&
  c < grid[0].length &&
  [".", "S"].includes(grid[r][c]);

const DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];
let nextStep = ({ r, c }: Pos): Pos[] =>
  DIRS.map(([dr, dc]) => ({ r: r + dr, c: c + dc })).filter(canStep);

let uniq = (ps: Pos[]): Pos[] => {
  let key = ({ r, c }: Pos) => `${r}x${c}`;
  let all = new Map<string, Pos>();
  ps.forEach((p) => all.set(key(p), p));
  return [...all.values()];
};

let nextSteps = (ps: Pos[]): Pos[] => uniq(ps.flatMap(nextStep));

let STEPS = 64;
let startPositions: Pos[] = [];
for (let r = 0; r < grid.length; r++) {
  for (let c = 0; c < grid[0].length; c++) {
    if (grid[r][c] === "S") {
      startPositions.push({ r, c });
    }
  }
}

// Part 1
let positions = startPositions;
for (let i = 0; i < STEPS; i++) {
  positions = nextSteps(positions);
}

console.log("Part 1:", positions.length);
