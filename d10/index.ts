import { inputLines, isPresent } from "../lib/";

// Handle input
let map: Space[][] = (await inputLines()).map((l) => l.split("") as Space[]);
let xStart = 0;
let yStart = 0;
map.forEach((line, y) =>
  line.forEach((s, x) => {
    if (s === "S") {
      xStart = x;
      yStart = y;
    }
  })
);

// Representation
type Path = {
  steps: number;
  x: number;
  y: number;
  from: Dir;
  prev: Path | undefined;
};

enum Dir {
  Up = "Up",
  Right = "Right",
  Down = "Down",
  Left = "Left",
}
const ALL_DIRS: Dir[] = [Dir.Up, Dir.Right, Dir.Down, Dir.Left];

type Space = "|" | "-" | "L" | "J" | "7" | "F" | "." | "S";

let connects = (s: Space, d: Dir): boolean =>
  s === "|"
    ? d === Dir.Up || d === Dir.Down
    : s === "-"
    ? d === Dir.Left || d === Dir.Right
    : s === "L"
    ? d === Dir.Up || d === Dir.Right
    : s === "J"
    ? d === Dir.Up || d === Dir.Left
    : s === "7"
    ? d === Dir.Down || d === Dir.Left
    : s === "F"
    ? d === Dir.Right || d === Dir.Down
    : s === "S"
    ? true
    : false;

let opposite = (d: Dir): Dir =>
  d === Dir.Up
    ? Dir.Down
    : d === Dir.Down
    ? Dir.Up
    : d === Dir.Left
    ? Dir.Right
    : Dir.Left;

let step = (x: number, y: number, d: Dir): [number, number] | undefined => {
  // console.log(`Step from (${x}, ${y}) to ${d}`);
  let x2 = x + (d === Dir.Left ? -1 : d === Dir.Right ? 1 : 0);
  let y2 = y + (d === Dir.Up ? -1 : d === Dir.Down ? 1 : 0);

  if (y2 < 0 || y2 >= map.length) return;
  if (x2 < 0 || x2 > map[y2].length) return;

  return [x2, y2];
};

let nextPath = (path: Path, d: Dir): Path | undefined => {
  let next = step(path.x, path.y, d);
  if (!isPresent(next)) return;
  let [x2, y2] = next;
  // console.log(
  //   `Asking if (${x2}, ${y2} => ${map[y2][x2]}) connects via ${opposite(d)}`
  // );
  if (!connects(map[y2][x2], opposite(d))) return;
  return { steps: path.steps + 1, x: x2, y: y2, from: opposite(d), prev: path };
};

let startPaths: Path[] = ALL_DIRS.flatMap((d) =>
  [
    nextPath(
      { steps: 0, x: xStart, y: yStart, from: opposite(d), prev: undefined },
      d
    ),
  ].filter(isPresent)
);

let stepAll = (paths: Path[]): Path[] =>
  paths.flatMap((p) =>
    ALL_DIRS.filter((d) => d !== p.from)
      .filter((d) => connects(map[p.y][p.x], d))
      .map((d) => nextPath(p, d))
      .filter(isPresent)
  );

let pathDone = (path: Path): boolean => path.x === xStart && path.y === yStart;

let paths = startPaths;
let done: Path | undefined = undefined;
while (!done && paths.length > 0) {
  // console.log("Paths", paths);
  paths = stepAll(paths);
  done = paths.find(pathDone);
}
if (!done) {
  throw new Error("Didn't find a loop.");
}

console.log("Part 1", Math.ceil(done.steps / 2));

// Part 2
// Overall plan: label areas to right- and left-hand side of pipe, then connect neighboring areas

// Track map coloring
enum Color {
  Unknown = 0,
  Path = 1,
  Left = 2,
  Right = 3,
}

let coloring: Color[][] = [];
for (let i = 0; i < map.length; i++) {
  coloring.push(new Array(map[i].length).fill(Color.Unknown));
}

const color = (x: number, y: number, c: Color) => {
  if (y < 0 || y >= map.length) return;
  if (x < 0 || x > map[y].length) return;

  let currentColor = coloring[y][x];
  switch (currentColor) {
    case Color.Path:
      return;
    case Color.Left:
    case Color.Right:
      if (currentColor !== c)
        console.log(
          `Double-assigning color for (${x}, ${y}): was ${currentColor}, trying to assign ${c}`
        );
    case Color.Unknown:
      coloring[y][x] = c;
  }
};

// Color left and right of the path
let current = done;
while (current.prev) {
  current = current.prev;
  let { x, y, from } = current;
  coloring[y][x] = 1;

  switch (map[y][x]) {
    case "|":
      color(x - 1, y, from == Dir.Down ? Color.Left : Color.Right);
      color(x + 1, y, from == Dir.Up ? Color.Left : Color.Right);
      break;
    case "-":
      color(x, y - 1, from == Dir.Left ? Color.Left : Color.Right);
      color(x, y + 1, from == Dir.Right ? Color.Left : Color.Right);
      break;
    // "L" | "J" | "7" | "F"
    case "L":
      var c = from === Dir.Right ? Color.Left : Color.Right;
      color(x, y + 1, c);
      color(x - 1, y + 1, c);
      color(x - 1, y, c);
      break;
    case "J":
      var c = from === Dir.Left ? Color.Right : Color.Left;
      color(x, y + 1, c);
      color(x + 1, y + 1, c);
      color(x + 1, y, c);
      break;
    case "7":
      var c = from === Dir.Left ? Color.Left : Color.Right;
      color(x, y - 1, c);
      color(x + 1, y - 1, c);
      color(x + 1, y, c);
      break;
    case "F":
      var c = from === Dir.Down ? Color.Left : Color.Right;
      color(x, y - 1, c);
      color(x - 1, y - 1, c);
      color(x - 1, y, c);
      break;
  }
}

let colorToCopy = (c: Color) => c == Color.Left || c == Color.Right;

// Fill in the holes
for (let k = 0; k < 1000; k++) {
  for (let y = 1; y < map.length - 1; y++) {
    for (let x = 1; x < map[y].length - 1; x++) {
      if (coloring[y][x] !== 0) continue;

      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]
        .map(([dy, dx]) => [x, y, coloring[y + dy][x + dx]])
        .filter(([x, y, c]) => colorToCopy(c))
        .forEach(([x, y, c]) => color(x, y, c));
    }
  }
}

let diagram = coloring.map((l) => l.join("")).join("\n");

let insideColor = Color.Left;
let count = 0;
for (let i = 0; i < diagram.length; i++) {
  if (diagram[i] === insideColor.toString()) count++;
}

console.log("Part 2", count);
