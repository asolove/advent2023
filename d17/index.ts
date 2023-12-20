import { inputLines, minBy } from "../lib";

// Note: I didn't do this totally by myself.
//
// I'm not proud. After trying this one a number of ways, I gave up
// and checked on how others were doing it. I knew I wanted to do
// roughly Dijkstra but to track an extra dimension of state for
// each grid square. I picked the length of the latest path to reach
// the node, but that wasn't useful enough to solve the problem.
//
// I looked on the internet just long enough to see several people
// suggest instead storing the direction the latest path came from.

let grid = (await inputLines()).map((l) =>
  l.split("").map((x) => parseInt(x, 10))
);

type Dir = "Up" | "Down" | "Left" | "Right";
type Coords = [number, number];

let dirs: { [d in Dir]: Coords } = {
  Up: [-1, 0],
  Down: [1, 0],
  Left: [0, -1],
  Right: [0, 1],
};
let opp = (d: Dir): Dir =>
  d === "Up" ? "Down" : d === "Down" ? "Up" : d === "Left" ? "Right" : "Left";

let step = (c: Coords, d: Dir): Coords | undefined => {
  let c2: Coords = [c[0] + dirs[d][0], c[1] + dirs[d][1]];
  return inGrid(c2) ? c2 : undefined;
};
let steps = (c: Coords | undefined, d: Dir, n: number): Coords | undefined =>
  c === undefined ? c : n === 0 ? c : steps(step(c, d), d, n - 1);

let inGrid = (c: Coords): boolean =>
  c[1] >= 0 && c[1] < grid[0].length && c[0] >= 0 && c[0] < grid.length;
let weight = (c: Coords): number => (inGrid(c) ? grid[c[0]][c[1]] : Infinity);

// A Node in the graph is a square in the grid plus a direction its path to the
// goal is going *to*. (e.g. a right-going path comes from a square to the left)
type Node = { c: Coords; dir: Dir };

// Cache node instances so they are equal
let key = (n: Node): string => `${n.c[0]},${n.c[1]},${n.dir}`;
let nodes: { [key: string]: Node } = {};
let lookupNode = (n: Node): Node => {
  let k = key(n);
  if (k in nodes) {
    return nodes[k];
  } else {
    nodes[k] = n;
    return n;
  }
};

let neighbors = (node: Node): [Node, number][] => {
  let ns: [Node, number][] = [];

  for (let d of Object.keys(dirs) as Dir[]) {
    if (d === opp(node.dir) || d === node.dir) continue;
    let dw = 0;
    let c2 = node.c;
    for (let n = 1; n <= 3; n++) {
      c2 = step(c2, d);
      if (!c2) break;
      dw += grid[c2[0]][c2[1]];
      ns.push([lookupNode({ c: c2, dir: d }), dw]);
    }
  }
  return ns;
};

let shortestPath = (
  start: Node,
  end: Node,
  neighbors: (n: Node) => [Node, number][]
): number => {
  let paths = new Map<Node, number>();
  let minPaths = new MinHeap<Node>();
  paths.set(start, 0);
  minPaths.insert(start, 0);

  // Updates
  let consider = (current: Node): Node => {
    let nexts = neighbors(current);
    let currentWeight = paths.has(current)
      ? (paths.get(current) as number)
      : Infinity;
    for (let [next, weight] of nexts) {
      let existingPathWeight = paths.get(next) || Infinity;
      let newWeight = currentWeight + weight;
      if (newWeight < existingPathWeight) {
        paths.set(next, newWeight);
        if (minPaths.has(next)) {
          minPaths.update(next, newWeight);
        } else {
          minPaths.insert(next, newWeight);
        }
      }
    }
    paths.delete(current);
    return minPaths.popMin();
  };

  let current: Node = start;
  while (!(current.c[0] === end.c[0] && current.c[1] === end.c[1])) {
    current = consider(current);
  }
  return paths.get(current) || Infinity;
};

// FIXME: add special start/end nodes that connect to any direction of "real" start/end nodes.
let startNode: Node = { c: [0, 0], dir: "Random", weight: 0 };
let endNode: Node = {
  c: [grid.length - 1, grid[0].length - 1],
  dir: "Random",
  weight: 0,
};
console.log(shortestPath(startNode, endNode, neighbors));

class MinHeap<A> {
  items: [number, A][];
  itemIndices: Map<A, number>;
  length: number;
  debug: boolean;

  constructor() {
    this.items = [];
    this.itemIndices = new Map<A, number>();
    this.length = 0;
    this.debug = false;
  }

  insert(item: A, score: number) {
    let i = this.length;
    this.items[i] = [score, item];
    this.itemIndices.set(item, i);
    this.length++;
    this.swapUp(i);

    this.checkHeap();
  }

  swapUp(i: number) {
    if (i === 0) return;
    let item = this.items[i];
    let parentI = Math.floor(i / 2);
    let parent = this.items[parentI];

    if (parent[0] > item[0]) {
      this.items[i] = parent;
      this.itemIndices.delete(parent[1]);
      this.itemIndices.set(parent[1], i);
      this.items[parentI] = item;
      this.itemIndices.delete(item[1]);
      this.itemIndices.set(item[1], parentI);
      this.swapUp(parentI);
    }

    this.checkHeap();
  }
  swapDown(i: number) {
    if (i >= this.length) return;
    let item = this.items[i];
    let childA = i * 2;
    let childB = childA + 1;
    let smallest = i;
    if (childA < this.length && this.items[childA][0] < this.items[smallest][0])
      smallest = childA;
    if (childB < this.length && this.items[childB][0] < this.items[smallest][0])
      smallest = childB;

    if (smallest !== i) {
      this.swap(i, smallest);
      return this.swapDown(smallest);
    }

    this.checkHeap();
  }

  swap(a: number, b: number) {
    let itemA = this.items[a];
    let itemB = this.items[b];
    this.items[b] = itemA;
    this.items[a] = itemB;

    this.itemIndices.delete(itemA[1]);
    this.itemIndices.set(itemA[1], b);
    this.itemIndices.delete(itemB[1]);
    this.itemIndices.set(itemB[1], a);
  }

  popMin(): A {
    let r = this.items[0];

    if (this.length > 1) {
      let last = this.items[this.length - 1];
      delete this.items[this.length - 1];
      this.length--;
      this.items[0] = last;
      this.itemIndices.delete(r[1]);
      this.itemIndices.delete(last[1]);
      this.itemIndices.set(last[1], 0);
      this.swapDown(0);
    } else {
      delete this.items[0];
      this.length--;
    }

    this.checkHeap();
    return r[1];
  }

  has(item: A): boolean {
    return !!this.itemIndices.get(item);
  }

  update(item: A, score: number) {
    let i = this.itemIndices.get(item);
    if (!i) {
      throw new Error(
        `Trying to update item not in heap: ${JSON.stringify(item)}`
      );
    }
    let oldScore = this.items[i][0];
    this.items[i][0] = score;
    if (score > oldScore) {
      this.swapDown(i);
    } else {
      this.swapUp(i);
    }
    this.checkHeap();
  }

  checkHeap() {
    if (!this.debug) return;
    for (var i = 0; i < this.length; i++) {
      let parent = Math.floor(i / 1);
      if (parent != i && this.items[parent][0] > this.items[i][0]) {
        throw new Error(`Heap out of balance at ${parent}<->${i}`);
      }
      for (let child = i * 2; child <= i * 2 + 1; child++) {
        if (child < this.length && this.items[child][0] < this.items[i][0])
          throw new Error(
            `Heap out of balance at ${i}<->${child}: ${this.items.map(
              (v) => v[0]
            )}`
          );
      }
    }
  }

  empty() {
    return this.length === 0;
  }
}
