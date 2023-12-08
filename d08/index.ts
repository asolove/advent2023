import { input } from "../lib/";
import {
  Parser,
  alpha,
  char,
  many1,
  map,
  parse,
  plus,
  separatedBy,
  seq,
  string,
  surroundedBy,
} from "../lib/parse";

// Representation
type Instruction = "L" | "R";
type Instructions = Instruction[];
type NodeName = string;

type Directions = { left: NodeName; right: NodeName };

type State = {
  steps: number;
  instructions: Instructions;
  nodes: Map<NodeName, Directions>;
  currentNode: NodeName;
};

const START_NODE = "AAA";
const GOAL_NODE = "ZZZ";

// Parse
let instructions: Parser<Instructions> = many1(plus(char("R"), char("L")));
let nodeName = map(many1(alpha), (r) => r.join(""));
let directions: Parser<Directions> = map(
  surroundedBy(separatedBy(nodeName, string(", ")), char("("), char(")")),
  (r) => ({ left: r[0], right: r[1] })
);
let mapLine: Parser<[NodeName, Directions]> = map(
  seq(nodeName, seq(string(" = "), directions)),
  (r) => [r[0], r[1][1]]
);
let mapLines = separatedBy(mapLine, char("\n"));
let file: Parser<State> = map(
  seq(instructions, seq(string("\n\n"), mapLines)),
  (r) => ({
    steps: 0,
    instructions: r[0],
    nodes: new Map(r[1][1]),
    currentNode: START_NODE,
  })
);

// IO
let startState = parse(file, await input());

// Part 1

let step = (state: State): State => {
  let ins = state.instructions[state.steps % state.instructions.length];
  let nextNode = state.nodes.get(state.currentNode)[
    ins === "R" ? "right" : "left"
  ];
  return {
    ...state,
    steps: state.steps + 1,
    currentNode: nextNode,
  };
};

let driver = (state: State): number => {
  while (state.currentNode !== GOAL_NODE) {
    state = step(state);
  }
  return state.steps;
};

console.log("Part 1", driver(startState));

// Part 2

// Ok, here's the idea in my head: brute-forcing this is going to take too long.
// So instead, we do each start state until we find its cycle, and we calculate at which
// steps in its cycle it is in the goal state.
// Then we do that for all of them, and figure out how long until all their cycles align.

let isStartNode = (name: NodeName) => name.endsWith("A");
let isEndNode = (name: NodeName) => name.endsWith("Z");

let startNodes = [...startState.nodes.keys()].filter(isStartNode);

// Then we keep track of cycles of where they are at the goal and when they get back to the initial state.
type Cycle = {
  len: number;
  atGoal: number[];
};

let findCycle = (state: State): Cycle => {
  let cycle: Cycle = { len: 0, atGoal: [] };
  let start = state.currentNode;

  while (true) {
    state = step(state);
    if (isEndNode(state.currentNode)) {
      cycle.atGoal.push(state.steps);
    }
    if (
      state.currentNode === start &&
      state.steps % state.instructions.length === 0
    ) {
      cycle.len = state.steps;
      return cycle;
    }
    if (state.steps % 10000 === 0) {
      console.log(state.steps, cycle);
    }
  }
};

// Ok, so after watching this run for a while, I noticed: they are all pure cycles,
// where they come back to goal nodes at even multiples of the same number each time.
// It seems like this doesn't _have_ to be the case given the problems' terms.
// (You could construct maps and instructions with more complex cycles.)

// But for these inputs it's pure cycles.
// So we can just do some easy math.

// Find the loop periods of each start positoon:

let driver2 = (state: State): number => {
  while (!isEndNode(state.currentNode)) {
    state = step(state);
  }
  return state.steps;
};

let gcd = (a, b) => (a === 0 ? b : b === 0 ? a : gcd(b, a % b));
let lcm = (a, b) => (a * b) / gcd(a, b);

let cycles = startNodes
  .map((currentNode) => ({ ...startState, currentNode }))
  .map(driver2);

console.log("Part 2", cycles.reduce(lcm));
