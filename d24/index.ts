/*

Here's my thinking: lines f and g intersection between MIN and MAX iff:

  - f(MIN) - g(MIN) has a different sign from f(MAX) - g(MAX)
      they've swapped which is higher vertically within the range (MIN, MAX)
  - AND the same for their inverses f^-1(MIN), mutatis mutandis
      they've swapped which is leftmost at a given y within the range

So we can calculate those points for each line once and then just pairwise compare.

*/

import { inputLines } from "../lib";

// Representation

type Line = {
  x0: number;
  y0: number;
  z0: number;
  dx: number;
  dy: number;
  dz: number;
};

const fwd = (l: Line, x: number): number => (l.dy / l.dx) * (x - l.x0) + l.y0;
const inv = (l: Line, y: number): number => (l.dx / l.dy) * (y - l.y0) + l.x0;

// Parser
let parseLine = (input: string): Line => {
  let parts = input.split(" @ ");
  let digits = parts.flatMap((part) =>
    part.split(", ").map((n) => parseInt(n, 10))
  );
  return {
    x0: digits[0],
    y0: digits[1],
    z0: digits[2],
    dx: digits[3],
    dy: digits[4],
    dz: digits[5],
  };
};

// IO
let lines = (await inputLines()).map(parseLine);

// console.log(lines);

// Part 1

let MIN = 7;
let MAX = 27;

type Result = {
  line: Line;
  xAtYMin: number;
  xAtYMax: number;
  yAtXMin: number;
  yAtXMax: number;
};

let results: Result[] = lines.map((line, id) => ({
  line: line,
  xAtYMin: inv(line, MIN),
  xAtYMax: inv(line, MAX),
  yAtXMin: fwd(line, MIN),
  yAtXMax: fwd(line, MAX),
}));

let sign = (n: number): number => (n === 0 ? 0 : n > 0 ? +1 : -1);

let signDiffers = (n1: number, n2: number) => sign(n1) !== sign(n2);

let intersections = (results: Result[]): number => {
  let count = 0;

  for (let r0 of results) {
    for (let r1 of results) {
      if (r0 === r1) continue;

      // Paths intersect in abstract
      if (
        signDiffers(r0.yAtXMin - r1.yAtXMin, r0.yAtXMax - r1.yAtXMax) &&
        signDiffers(r0.xAtYMin - r1.xAtYMin, r0.xAtYMax - r1.xAtYMax)
      ) {
        // FIXME: check intersection is forward in time from input
        count++;
      }
    }
  }

  return count;
};

console.log("Part 1", intersections(results));
