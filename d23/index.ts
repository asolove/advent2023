import { inputLines } from "../lib";

let map = await inputLines();

enum Terrain {
  Forest = 0,
  Path,
  Up,
  Down,
  Left,
  Right,
}

type Space = { row: number; col: number };

const terrainAt = ({ row, col }: Space): Terrain => {
  if (row < 0 || row >= map.length) return Terrain.Forest;
  if (col < 0 || col >= map[0].length) return Terrain.Forest;

  switch (map[row][col]) {
    case ".":
      return Terrain.Path;
    case "#":
      return Terrain.Forest;
    case ">":
      return Terrain.Right;
    case "<":
      return Terrain.Left;
    case "^":
      return Terrain.Up;
    case "v":
      return Terrain.Down;
    default:
      return Terrain.Forest;
  }
};

const step = ({ col, row }: Space, t: Terrain): Space => {
  switch (t) {
    case Terrain.Up:
      return { col, row: row - 1 };
    case Terrain.Down:
      return { col, row: row + 1 };
    case Terrain.Left:
      return { col: col - 1, row };
    case Terrain.Right:
      return { col: col + 1, row };
    default:
      throw `Passed invalid direction ${t} to step`;
  }
};

const validSteps = (s: Space): Space[] => {
  let terrain = terrainAt(s);
  if (terrain === Terrain.Forest) return [];

  let candidates: Space[] = [];
  if (terrain === Terrain.Path) {
    candidates = [
      step(s, Terrain.Up),
      step(s, Terrain.Down),
      step(s, Terrain.Left),
      step(s, Terrain.Right),
    ];
  } else {
    candidates = [step(s, terrain)];
  }

  return candidates.filter(isWalkable);
};

const isWalkable = (s: Space): boolean => terrainAt(s) !== Terrain.Forest;

const key = ({ row, col }: Space) => `${row}x${col}`;

// Find longest path via DFS

type Path = { length: number; location: Space; visited: Set<string> };

const findLongestPath = (): number => {
  const start = { col: 1, row: 0 };
  const end = { row: map.length - 1, col: map[0].length - 2 };

  let startPath: Path = {
    length: 0,
    location: start,
    visited: new Set([key(start)]),
  };

  let paths = [startPath];

  let longestFound = startPath;

  while (paths.length > 0) {
    let currentPath = paths.pop();
    if (!currentPath) throw `wtf`;

    // Are we done?
    if (key(currentPath.location) == key(end)) {
      // console.log(`Found path of length ${currentPath.length}`);
      if (currentPath.length > longestFound.length) {
        longestFound = currentPath;
      }
      continue;
    }

    const nexts = validSteps(currentPath.location);
    nexts
      .filter((s) => !currentPath!.visited.has(key(s)))
      .forEach((next) =>
        paths.push({
          location: next,
          length: currentPath!.length + 1,
          visited: new Set([...currentPath!.visited, key(next)]),
        })
      );
  }

  return longestFound.length;
};

console.log("Part 1", findLongestPath());
