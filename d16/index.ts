import { inputLines } from "../lib";

// Representation
type Space = "." | "/" | "\\" | "|" | "-";
type Dir = "Up" | "Down" | "Left" | "Right";
type Position = { r: number; c: number };
type Beam = { dir: Dir; pos: Position };

let nextPos = (pos: Position, d: Dir): Position => {
  let { r, c } = pos;
  switch (d) {
    case "Up":
      return { r: r - 1, c };
    case "Down":
      return { r: r + 1, c };
    case "Left":
      return { r, c: c - 1 };
    case "Right":
      return { r, c: c + 1 };
  }
};

// IO
let grid = (await inputLines()).map((l) => l.split("")) as Space[][];

// Part 1

let onGrid = (b: Beam): boolean =>
  b.pos.r >= 0 &&
  b.pos.r < grid.length &&
  b.pos.c >= 0 &&
  b.pos.c < grid[0].length;

let step = (b: Beam): Beam[] => {
  let s = grid[b.pos.r][b.pos.c];
  switch (s) {
    case ".": {
      return [{ ...b, pos: nextPos(b.pos, b.dir) }];
    }
    case "/": {
      let newDir: Dir =
        b.dir === "Up"
          ? "Right"
          : b.dir === "Right"
          ? "Up"
          : b.dir === "Left"
          ? "Down"
          : "Left";
      return [{ dir: newDir, pos: nextPos(b.pos, newDir) }];
    }
    case "\\": {
      let newDir: Dir =
        b.dir === "Up"
          ? "Left"
          : b.dir === "Right"
          ? "Down"
          : b.dir === "Left"
          ? "Up"
          : "Right";
      return [{ dir: newDir, pos: nextPos(b.pos, newDir) }];
    }
    case "|": {
      if (b.dir == "Up" || b.dir === "Down") {
        return [{ ...b, pos: nextPos(b.pos, b.dir) }];
      }
      return [
        { dir: "Up", pos: nextPos(b.pos, "Up") },
        {
          dir: "Down",
          pos: nextPos(b.pos, "Down"),
        },
      ];
    }
    case "-": {
      if (b.dir == "Left" || b.dir === "Right") {
        return [{ ...b, pos: nextPos(b.pos, b.dir) }];
      }
      return [
        { dir: "Left", pos: nextPos(b.pos, "Left") },
        {
          dir: "Right",
          pos: nextPos(b.pos, "Right"),
        },
      ];
    }
  }
};

let simulate = (beams: Beam[]): number => {
  // Track activated spaces
  let activated = {};
  let key = (b: Beam): string => `${b.pos.r},${b.pos.c}`;

  // Track cycles
  let allBeams = {};
  let unseen = (b: Beam): boolean => {
    let key = `${b.pos.r},${b.pos.c},${b.dir}`;
    if (allBeams[key]) return false;
    allBeams[key] = true;
    return true;
  };

  let i = 0;
  while (beams.length > 0) {
    beams.forEach((b) => {
      activated[key(b)] = true;
    });
    beams = beams.flatMap(step).filter(onGrid).filter(unseen);
    i++;
  }

  return Object.keys(activated).length;
};

let startBeam: Beam = { dir: "Right", pos: { r: 0, c: 0 } };

console.log("Part 1", simulate([startBeam]));

// Part 2
let borderBeams: Beam[] = [];
for (let c = 0; c < grid[0].length; c++) {
  borderBeams.push({ dir: "Down", pos: { r: 0, c: c } });
}
for (let c = 0; c < grid[0].length; c++) {
  borderBeams.push({ dir: "Up", pos: { r: grid.length - 1, c: c } });
}
for (let r = 0; r < grid.length; r++) {
  borderBeams.push({ dir: "Right", pos: { r: r, c: 0 } });
}
for (let r = 0; r < grid.length; r++) {
  borderBeams.push({ dir: "Left", pos: { r: r, c: grid[0].length - 1 } });
}
borderBeams.push(startBeam);

function maximize<A>(inputs: A[], fn: (A) => number): [A, number] {
  let max = fn(inputs[0]);
  let maxInput: A = inputs[0];

  inputs.forEach((input) => {
    let r = fn(input);
    if (r > max) {
      max = r;
      maxInput = input;
    }
  });

  return [maxInput, max];
}

console.log("Part 2", maximize(borderBeams, (x) => simulate([x]))[1]);
