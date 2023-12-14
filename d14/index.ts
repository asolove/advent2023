import { inputLines } from "../lib";

type Puzzle = string[][];
let puzzle: Puzzle = (await inputLines()).map((l) => l.split(""));

const ROUND_ROCK = "O";
const SQUARE_ROCK = "#";
const EMPTY = ".";

let slideNorth = (p: Puzzle) => {
  for (let c = 0; c < p[0].length; c++) {
    let canRollTo = 0;
    for (let r = 0; r < p.length; r++) {
      switch (p[r][c]) {
        case EMPTY:
          break;
        case SQUARE_ROCK:
          canRollTo = r + 1;
          break;
        case ROUND_ROCK:
          p[r][c] = EMPTY;
          p[canRollTo][c] = ROUND_ROCK;
          canRollTo++;
      }
    }
  }
};

let rotate = (p: Puzzle): Puzzle => {
  let result = new Array(p[0].length)
    .fill(0)
    .map((_i) => new Array(p.length).fill(EMPTY));

  for (let r = 0; r < p.length; r++) {
    for (let c = 0; c < p[0].length; c++) {
      result[r][c] = p[p.length - 1 - c][r];
    }
  }

  return result;
};

let show = (p: Puzzle) => p.map((l) => l.join("")).join("\n");

let load = (p: Puzzle): number => {
  let result = 0;

  for (let r = 0; r < p.length; r++) {
    for (let c = 0; c < p[0].length; c++) {
      if (p[r][c] !== ROUND_ROCK) continue;

      result += p.length - r;
    }
  }

  return result;
};

// Part 1
// slideNorth(puzzle);
// console.log("Part 1", load(puzzle));

// Part 2
let cycle = (p: Puzzle): Puzzle => {
  for (let i = 0; i < 4; i++) {
    slideNorth(p);
    p = rotate(p);
  }
  return p;
};

let loadAfterCycles = (p: Puzzle, n: number): number => {
  for (let i = 0; i < n; i++) {
    p = cycle(p);
    if (i % 1000 === 0) console.log(i, load(p));
  }
  console.log(show(p));
  return load(p);
};

console.log(loadAfterCycles(puzzle, 100000));

// Running this and logging the scores, they immediately fall into a cycle
// and so I just projected that out with a calculator.
