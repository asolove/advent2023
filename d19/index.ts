import { input, sum } from "../lib";
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

let isFinal = (s: string): s is Outcome => s === "R" || s === "A";

type TestRule = {
  type: "test";
  key: string;
  value: number;
  op: ">" | "<";
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
  parsedFile.items
    .map((item) => naiveEval(item, parsedFile.workflows))
    .map((r, i) => (r === "A" ? itemScore(parsedFile.items[i]) : 0))
    .reduce(sum)
);

/* 
Need it to be faster? 
Ok so here's what I'm thinking: there are a lot of rules and a lot of items.
So a way to make it fast is, instead of following each rule, to just track 
the 4-dimensional state space, dividing it along each dimension, so that we
can just do four lookups to 

*/
