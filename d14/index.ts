import { input, inputLines } from "../lib";

type Puzzle = string[][];
let puzzle: Puzzle = (await inputLines()).map((l) => l.split(""));

let slideNorth = (p: Puzzle) => {
  for (let c = 0; c < p[0].length; c++) {
    let canRollTo = 0;
    for (let r = 0; r < p.length; r++) {
      switch (p[r][c]) {
        case ".":
          break;
        case "#":
          canRollTo = r + 1;
          break;
        case "O":
          p[r][c] = ".";
          p[canRollTo][c] = "O";
          canRollTo++;
      }
    }
  }
};

let show = (p: Puzzle) => p.map((l) => l.join("")).join("\n");

let load = (p: Puzzle): number => {
  let result = 0;

  for (let r = 0; r < p.length; r++) {
    for (let c = 0; c < p[0].length; c++) {
      if (p[r][c] != "O") continue;

      result += p.length - r;
    }
  }

  return result;
};

slideNorth(puzzle);
console.log(load(puzzle));
