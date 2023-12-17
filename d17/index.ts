import { inputLines, isPresent } from "../lib";

type Dir = "Up" | "Down" | "Left" | "Right";
type Path = { weight: number; dir: Dir; len: number };
type Node = {
  r: number;
  c: number;
  weight: number;
  bestPaths: (Path | undefined)[];
};

let weights = (await inputLines()).map((l) =>
  l.split("").map((s) => parseInt(s, 10))
);

let grid: Node[][] = weights.map((row, r) =>
  row.map((weight, c) => ({
    r,
    c,
    weight: weight,
    bestPaths: new Array(4).fill(undefined) as (Path | undefined)[],
  }))
);

let getNode = (r: number, c: number): Node | undefined =>
  r >= 0 && c >= 0 && r < grid.length && c < grid[0].length
    ? grid[r][c]
    : undefined;

type Neighbors = { [d in Dir]: Node | undefined };
let neighbors = (n: Node): Neighbors => ({
  Up: getNode(n.r - 1, n.c),
  Down: getNode(n.r + 1, n.c + 1),
  Left: getNode(n.r, n.c - 1),
  Right: getNode(n.r, n.c + 1),
});

let extendPath = (p: Path, d: Dir, weight: number) => ({
  dir: d,
  len: d === p.dir ? p.len + 1 : 1,
  weight: p.weight + weight,
});

function partitionBy<A, B>(items: A[], key: (A) => B): Map<B, A[]> {
  let r: Map<B, A[]> = new Map();
  for (let item of items) {
    let k = key(item);
    if (r.has(k)) {
      r.get(k).push(item);
    } else {
      r.set(k, [item]);
    }
  }
  return r;
}

function minBy<A>(items: A[], score: (A) => number): A | undefined {
  let minItem: A | undefined = undefined;
  let minScore = Infinity;
  for (let item of items) {
    let s = score(item);
    if (s < minScore) {
      minScore = s;
      minItem = item;
    }
  }
  return minItem;
}

let consider = (n: Node) => {
  let ns = neighbors(n);
  let paths = Object.entries(ns)
    .flatMap(([dir, node]) =>
      node?.bestPaths
        .filter(isPresent)
        .map((p) => extendPath(p, dir as Dir, node.weight))
    )
    .filter(isPresent);
  let pathsByLen = partitionBy(paths, (p: Path) => p.len);
  for (let i = 1; i < 3; i++) {
    let candidates: Path[] = pathsByLen.get(i) || [];
    let candidatesWithCurrent = candidates
      .concat([n.bestPaths[i]])
      .filter(isPresent);
    n.bestPaths[i] = minBy(candidatesWithCurrent, (p) => p.weight);
  }
};

let target = grid[grid.length - 1][grid[0].length - 1];
target.bestPaths[0] = { weight: 0, len: 0, dir: "Up" };

let considerAll = () => {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      consider(getNode(r, c) as Node);
    }
  }
};

for (let i = 0; i < 2 * grid.length * grid[0].length; i++) considerAll();

console.log(grid[0][0]);
