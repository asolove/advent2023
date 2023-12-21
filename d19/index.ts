import { input, product, sum } from "../lib";
import {
  Parser,
  alpha,
  char,
  int,
  many1,
  map,
  parse,
  plus,
  separatedBy,
  seq,
  string,
  surroundedBy,
} from "../lib/parse";

type Outcome = "R" | "A";
type Op = ">" | "<";

let isFinal = (s: string): s is Outcome => s === "R" || s === "A";

type TestRule = {
  type: "test";
  key: string;
  value: number;
  op: Op;
  dest: string;
};
type JumpRule = { type: "jump"; dest: string };
type Rule = TestRule | JumpRule;

type Workflow = {
  name: string;
  rules: Rule[];
};

type Workflows = { [name: string]: Workflow };

type Item = { x: number; m: number; a: number; s: number };

type File = {
  workflows: Workflows;
  items: Item[];
};

let name = map(many1(alpha), (rs) => rs.join(""));
let jumpRule: Parser<Rule> = map(name, (c) => ({
  type: "jump",
  dest: c,
}));
let key = plus(plus(char("x"), char("m")), plus(char("a"), char("s")));
let comp = plus(char(">"), char("<"));
let test = seq(key, seq(comp, int));
let testRule: Parser<Rule> = map(seq(test, seq(char(":"), name)), (r) => ({
  type: "test",
  key: r[0][0],
  value: r[0][1][1],
  op: r[0][1][0],
  dest: r[1][1],
}));
let rule = plus(testRule, jumpRule);
let rules = surroundedBy(separatedBy(rule, char(",")), char("{"), char("}"));
let workflow: Parser<Workflow> = map(seq(name, rules), (r) => ({
  name: r[0],
  rules: r[1],
}));
let workflows = separatedBy(workflow, char("\n"));

let entry = seq(alpha, seq(char("="), int));
let item = map(
  surroundedBy(separatedBy(entry, char(",")), char("{"), char("}")),
  (r) => ({ x: r[0][1][1], m: r[1][1][1], a: r[2][1][1], s: r[3][1][1] })
);
let items = separatedBy(item, char("\n"));

let file: Parser<File> = map(
  seq(workflows, seq(string("\n\n"), items)),
  (r) => ({
    workflows: r[0].reduce((r, w) => ({ ...r, [w.name]: w }), {}),
    items: r[1][1],
  })
);

let parsedFile = parse(file, await input());

let passTestRule = (r: TestRule, i: Item): boolean =>
  r.op === ">" ? i[r.key] > r.value : i[r.key] < r.value;

let naiveEval = (item: Item, workflows: Workflows): Outcome => {
  let goto = (name: string): Outcome => {
    if (isFinal(name)) return name;
    return evalWorkflow(workflows[name]);
  };
  let evalRule = (r: Rule, rs: Rule[]): Outcome => {
    if (r.type === "jump") {
      return goto(r.dest);
    } else {
      if (passTestRule(r, item)) {
        return goto(r.dest);
      } else {
        let [r2, ...rest] = rs;
        return evalRule(r2, rest);
      }
    }
  };
  let evalWorkflow = (w: Workflow): Outcome => {
    return evalRule(w.rules[0], w.rules.slice(1));
  };
  return goto("in");
};

let itemScore = (i: Item): number => i.x + i.m + i.a + i.s;

console.log(
  "Part 1",
  parsedFile.items
    .map((item) => naiveEval(item, parsedFile.workflows))
    .map((r, i) => (r === "A" ? itemScore(parsedFile.items[i]) : 0))
    .reduce(sum)
);

// Part 2

type Range = [number, number]; // [min, max]
type State = { x: Range; m: Range; a: Range; s: Range; next: string };

let startState: State = {
  next: "in",
  x: [1, 4000],
  m: [1, 4000],
  a: [1, 4000],
  s: [1, 4000],
};

let acceptedStates: State[] = [];

let opposite = (r: TestRule): TestRule => ({
  ...r,
  op: r.op === ">" ? "<" : ">",
  value: r.op === ">" ? r.value + 1 : r.value - 1,
});

let constrainRange = (r: Range, op: Op, value: number): Range => {
  if (op === "<") {
    if (value < r[1]) return [r[0], value];
  } else {
    if (value > r[0]) return [value, r[1]];
  }
  return r;
};

let constrain = (state: State, rule: TestRule): State => {
  let key = rule.key;
  let newRange = constrainRange(state[key], rule.op, rule.value);
  return { ...state, [key]: newRange };
};

let nextStates = (state: State): State[] => {
  if (isFinal(state.next)) {
    if (state.next === "A") acceptedStates.push(state);
    return [];
  }

  let nexts: State[] = [];
  let workflow = parsedFile.workflows[state.next];
  let current = state;

  workflow.rules.forEach((rule) => {
    if (rule.type === "jump") {
      nexts.push({ ...current, next: rule.dest });
    } else {
      // if rule is true
      nexts.push({ ...constrain(current, rule), next: rule.dest });
      // if rule is false, keep traversing rules
      current = constrain(current, opposite(rule));
    }
  });

  return nexts;
};

let states: State[] = [startState];

while (states.length > 0) {
  states = states.flatMap(nextStates);
}

let stateSize = (s: State) =>
  ["x", "m", "a", "s"].map((k) => s[k][1] - s[k][0] + 1).reduce(product);

let rangeOverlap = (r1: Range, r2: Range): number => {
  let oMin = Math.max(r1[0], r2[0]);
  let oMax = Math.min(r1[1], r2[1]);
  if (oMin <= oMax) {
    return oMax - oMin + 1;
  } else {
    return 0;
  }
};

let stateOverlap = (s1: State, s2: State): number =>
  ["x", "m", "a", "s"].map((k) => rangeOverlap(s1[k], s2[k])).reduce(product);

let totalArea = acceptedStates.map(stateSize).reduce(sum);

let overlapArea =
  acceptedStates
    .map((s1) =>
      acceptedStates
        .filter((s2) => s2 !== s1)
        .map((s2) => stateOverlap(s1, s2))
        .reduce(sum)
    )
    .reduce(sum) / 2;

console.log("Part 2", totalArea, overlapArea, totalArea - overlapArea);
