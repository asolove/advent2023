import { inputLines, sum } from "../lib";

type Step = [string, number];

let p1Steps: Step[] = [];
let p2Steps: Step[] = [];

let dirs = ["R", "D", "L", "U"];

(await inputLines()).forEach((l) => {
  let parts = l.split(" ");
  p1Steps.push([parts[0], parseInt(parts[1], 10)]);

  let p2Parts = parts[2].slice(2, 8);
  p2Steps.push([dirs[p2Parts[5]], parseInt(p2Parts.slice(0, 5), 16)]);
});

type State = { path: [number, number][]; circ: number };

let step = (state: State, [dir, spaces]: [string, number]): State => {
  let [r, c] = state.path[state.path.length - 1];
  switch (dir) {
    case "R":
      c += spaces;
      break;
    case "L":
      c -= spaces;
      break;
    case "U":
      r -= spaces;
      break;
    case "D":
      r += spaces;
      break;
  }

  return { path: state.path.concat([[r, c]]), circ: state.circ + spaces };
};

let startState: State = { path: [[0, 0]], circ: 0 };

let polygonArea = (coords: [number, number][]): number =>
  0.5 *
  coords
    .slice(0, -1)
    .map(([x, y], i) => x * coords[i + 1][1] - coords[i + 1][0] * y)
    .reduce(sum);

// Part 1
let p1EndState = p1Steps.reduce(step, startState);
console.log(
  "Part 1",
  Math.abs(polygonArea(p1EndState.path)) + p1EndState.circ / 2 + 1
);

// Part 2

let p2EndState = p2Steps.reduce(step, startState);
console.log(
  "Part 2",
  Math.abs(polygonArea(p2EndState.path)) + p2EndState.circ / 2 + 1
);
