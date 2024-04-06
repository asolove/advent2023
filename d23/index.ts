import { inputLines } from "../lib";

let input = await inputLines();

enum Terrain {
  Forest = 0,
  Path,
  Up,
  Down,
  Left,
  Right,
}

type Space = { row: number; col: number };
const key = ({ row, col }: Space) => `${row}x${col}`;
const spaces: Map<string, Space> = new Map();
const makeSpace = (row: number, col: number): Space => {
  let k = key({ row, col });
  let s = spaces.get(k);
  if (s) return s;

  let space = { row, col };
  spaces.set(k, space);
  return space;
};

// Calculats shortcuts by pre-connecting spaces where there is no choice

class MapGraph {
  input: string[];
  width: number;
  height: number;

  constructor(input: string[]) {
    this.input = input;
    this.height = input.length;
    this.width = input[0].length;
  }

  isWalkable(s: Space): boolean {
    return this.terrainAt(s) != Terrain.Forest;
  }

  terrainAt({ row, col }: Space): Terrain {
    if (row < 0 || row >= this.height) return Terrain.Forest;
    if (col < 0 || col >= this.width) return Terrain.Forest;

    switch (this.input[row][col]) {
      case "#":
        return Terrain.Forest;
      case "^":
        return Terrain.Up;
      case "v":
        return Terrain.Down;
      case ">":
        return Terrain.Right;
      case "<":
        return Terrain.Left;
      default:
        return Terrain.Path;
    }
  }

  #step({ col, row }: Space, t: Terrain): Space {
    switch (t) {
      case Terrain.Up:
        return makeSpace(row - 1, col);
      case Terrain.Down:
        return makeSpace(row + 1, col);
      case Terrain.Left:
        return makeSpace(row, col - 1);
      case Terrain.Right:
        return makeSpace(row, col + 1);
      default:
        throw `Passed invalid direction ${t} to step`;
    }
  }

  nextSteps(s: Space): Space[] {
    let terrain = this.terrainAt(s);
    if (terrain === Terrain.Forest) return [];

    let candidates: Space[] = [];
    if (terrain === Terrain.Path) {
      candidates = [
        this.#step(s, Terrain.Up),
        this.#step(s, Terrain.Down),
        this.#step(s, Terrain.Left),
        this.#step(s, Terrain.Right),
      ];
    } else {
      candidates = [this.#step(s, terrain)];
    }

    return candidates.filter((c) => this.isWalkable(c));
  }

  *allSpaces(): Generator<Space> {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        yield makeSpace(row, col);
      }
    }
  }
}

// Find longest path via DFS

type Path = { length: number; location: Space; visited: Set<Space> };

function dfs<A>(start: A, nexts: (a: A) => A[]) {
  let paths: A[] = [start];
  while (paths.length > 0) {
    let considering = paths.pop();
    if (!considering) throw "dfs had empty item";

    nexts(considering).forEach((next) => paths.push(next));
  }
}

const findLongestPath = (m: MapGraph): number => {
  const start = makeSpace(0, 1);
  const end = makeSpace(m.height - 1, m.width - 2);

  let startPath: Path = {
    length: 0,
    location: start,
    visited: new Set([start]),
  };

  let longestFound = startPath;

  dfs(startPath, (currentPath: Path) => {
    if (currentPath.location == end) {
      if (currentPath.length > longestFound.length) {
        // console.log(`Found path of length ${currentPath.length}`);
        longestFound = currentPath;
      }
      return [];
    }

    return m
      .nextSteps(currentPath.location)
      .filter((s) => !currentPath!.visited.has(s))
      .map((next) => ({
        location: next,
        length: currentPath!.length + 1,
        visited: new Set([...currentPath!.visited, next]),
      }));
  });
  return longestFound.length;
};

let mg = new MapGraph(input);

console.log("Part 1", findLongestPath(mg));

// Part 2: Dry Path

class DryMapGraph extends MapGraph {
  // Same map, but treat all arrows as regular Paths

  terrainAt({ row, col }: Space): Terrain {
    if (row < 0 || row >= this.height) return Terrain.Forest;
    if (col < 0 || col >= this.width) return Terrain.Forest;

    switch (this.input[row][col]) {
      case "#":
        return Terrain.Forest;
      default:
        return Terrain.Path;
    }
  }
}

type PartialPath = {
  end: Space;
  spaces: Set<Space>;
  len: number;
};

class ShortcutMap {
  mg: MapGraph;
  intersections: Set<Space>;
  steps: Map<Space, PartialPath[]>;

  constructor(mg: MapGraph) {
    this.mg = mg;
    this.intersections = this.#calculateIntersections();
    this.steps = this.#calculateSteps();
  }

  #calculateIntersections() {
    let intersections: Space[] = [];
    for (const space of this.mg.allSpaces()) {
      if (this.mg.isWalkable(space) && this.mg.nextSteps(space).length != 2) {
        intersections.push(space);
      }
    }
    return new Set(intersections);
  }

  #calculateSteps(): Map<Space, PartialPath[]> {
    let steps: Map<Space, PartialPath[]> = new Map();

    for (const intersection of this.intersections) {
      let startPartialPath: PartialPath = {
        end: intersection,
        len: 0,
        spaces: new Set(),
      };

      let fullPartialPaths: PartialPath[] = [];

      dfs(startPartialPath, (partialPath) => {
        // console.log(" - one time through dfs");
        if (
          partialPath.end != intersection &&
          this.intersections.has(partialPath.end)
        ) {
          fullPartialPaths.push(partialPath);
          return [];
        }

        let nexts = this.mg.nextSteps(partialPath.end);
        let nextPartialPaths: PartialPath[] = [];
        for (const next of nexts) {
          if (partialPath.spaces.has(next)) continue;

          let nextPartialPath: PartialPath = {
            end: next,
            len: partialPath.len + 1,
            spaces: new Set([...partialPath.spaces, next]),
          };
          nextPartialPaths.push(nextPartialPath);
        }
        return nextPartialPaths;
      });

      steps.set(intersection, fullPartialPaths);
    }

    return steps;
  }

  nextSteps(s: Space): PartialPath[] {
    return this.steps.get(s)!;
  }
}

let dmg = new DryMapGraph(input);
let sm = new ShortcutMap(dmg);

const findLongestPath2 = (sm: ShortcutMap): number => {
  const start = makeSpace(0, 1);
  const end = makeSpace(sm.mg.height - 1, sm.mg.width - 2);

  let startPath: Path = {
    length: 0,
    location: start,
    visited: new Set([start]),
  };

  let longestFound = startPath;

  dfs(startPath, (currentPath: Path) => {
    if (currentPath.location == end) {
      if (currentPath.length > longestFound.length) {
        console.log(`Found path of length ${currentPath.length}`);
        longestFound = currentPath;
      }
      return [];
    }

    return sm
      .nextSteps(currentPath.location)
      .filter((partialPath) =>
        [...partialPath.spaces].every(
          (toVisit) => !currentPath.visited.has(toVisit)
        )
      )
      .map((partialPath) => ({
        location: partialPath.end,
        length: currentPath!.length + partialPath.len,
        visited: new Set([...currentPath!.visited, ...partialPath.spaces]),
      }));
  });
  return longestFound.length;
};

// console.log(sm.steps);
console.log("Part 2", findLongestPath2(sm));
