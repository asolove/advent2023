import { Parser, char, int, map, parse, separatedBy, seq } from "../lib/parse";
import { input, isPresent, isSubset, sum, tap, union } from "../lib";

// Representation
type Pos = { x: number; y: number; z: number };
type Axis = keyof Pos;
type Brick = Pos[];

let key = ({ x, y, z }: Pos) => `${x},${y},${z}`;
type State = { bricks: Brick[]; positions: Map<string, Brick> };

const AXES: Axis[] = ["x", "y", "z"];

let makeBrick = (start: Pos, end: Pos): Brick => {
  let axis = AXES.filter((a) => start[a] != end[a])[0] || "x";
  let b: Brick = [];
  for (let c = start[axis]; c <= end[axis]; c++) {
    b.push({ ...start, [axis]: c });
  }
  return b;
};

// Parse
let pos: Parser<Pos> = map(separatedBy(int, char(",")), (r) => ({
  x: r[0],
  y: r[1],
  z: r[2],
}));
let brick: Parser<Brick> = map(seq(pos, seq(char("~"), pos)), (r) =>
  makeBrick(r[0], r[1][1])
);
let file: Parser<Brick[]> = separatedBy(brick, char("\n"));

let bricks = parse(file, await input());

let startState: State = {
  bricks: bricks,
  positions: new Map(bricks.flatMap((b) => b.map((p) => [key(p), b]))),
};

// Part 1
let fallBrick = (b: Brick): Brick => b.map(fall);
let fall = (pos: Pos): Pos => ({ ...pos, z: pos.z - 1 });
let same = (p1: Pos, p2: Pos) => AXES.every((a) => p1[a] === p2[a]);
let overlap = (b1: Brick, b2: Brick) =>
  !b1.every((p1) => b2.every((p2) => !same(p1, p2)));

let restsOn = (a: Brick, b: Brick) => a != b && overlap(fallBrick(a), b);

let canFall = (b: Brick, state: State) =>
  b.every((p) => p.z > 1) &&
  fallBrick(b).every((p) =>
    [undefined, b].includes(state.positions.get(key(p)))
  );

let fallState = (b: Brick, state: State): State => {
  b.forEach((p) => state.positions.delete(key(p)));
  let b2 = fallBrick(b);
  b2.forEach((p) => state.positions.set(key(p), b2));

  let i = state.bricks.indexOf(b);
  if (i === -1) throw new Error("Brick not in state");
  state.bricks[i] = b2;

  return state;
};

let fallIfCan = (b: Brick, state: State): State =>
  canFall(b, state) ? fallState(b, state) : state;

let settleAll = (state: State): State => {
  let i = 0;
  while (!state.bricks.every((b) => !canFall(b, state))) {
    state = state.bricks.reduce((state, b) => fallIfCan(b, state), state);
  }
  return state;
};

// Which bricks support B, in other words, if B fell, what would it run into?
let isSupportedBy = (b: Brick, bs: Brick[]): Brick[] => {
  return bs.filter((b2) => b2 != b).filter((b2) => restsOn(b, b2));
};

// Can this brick be disintegrated? (Is it never the only one supporting another brick)
let canDisintegrate = (b: Brick, state: State): boolean =>
  state.bricks
    .map((b2) => isSupportedBy(b2, state.bricks))
    .filter((sb) => sb.length === 1 && sb[0] === b).length === 0;

let countDisintegratable = (state: State): number => {
  let candidates: Brick[] = [...state.bricks];

  state.bricks.forEach((b) => {
    let supportedBy = [
      ...new Set(
        b
          .map((p) => state.positions.get(key(fall(p))))
          .filter(isPresent)
          .filter((b2) => b2 !== b)
      ),
    ];
    if (supportedBy.length == 1) {
      let i = candidates.indexOf(supportedBy[0]);
      if (i > -1) candidates.splice(i, 1);
    }
  });

  return candidates.length;
};

let settledState = settleAll(startState);

console.log("Part 1", countDisintegratable(settledState));

// Part 2: chain reaction via graph traversal

let chainReactionSize = (state: State): number => {
  let name = (b: Brick): string =>
    String.fromCharCode(65 + state.bricks.indexOf(b));

  // Build implicit graph representation
  let supportedBy: Map<Brick, Set<Brick>> = new Map();
  state.bricks.forEach((b) => {
    let supports = new Set(
      b
        .map((p) => state.positions.get(key(fall(p))))
        .filter(isPresent)
        .filter((b2) => b2 !== b)
    );
    supportedBy.set(b, supports);
  });

  let supporting: Map<Brick, Set<Brick>> = new Map(
    state.bricks.map((b) => [b, new Set()])
  );

  supportedBy.forEach((set, b1) => {
    set.forEach((b2) => supporting.get(b2)?.add(b1));
  });

  // Traverse graph from each block
  let chainFromBrick = (b: Brick): number => {
    let toConsider = [...(supporting.get(b) || [])];
    let fallen = new Set([b]);
    while (toConsider.length > 0) {
      let item = toConsider.shift();
      if (!item) throw "you did a bad";

      let supports = supportedBy.get(item) || new Set();
      let unsupported = isSubset(supports, fallen);
      if (unsupported) {
        fallen.add(item);
        supporting.get(item)!.forEach((i2) => {
          toConsider.push(i2);
        });
      }
    }
    return fallen.size - 1;
  };
  let chainSizes = state.bricks.map(chainFromBrick);

  return state.bricks.map(chainFromBrick).reduce(sum, 0);
};

console.log("Part 2", chainReactionSize(settledState));
