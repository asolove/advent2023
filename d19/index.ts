import { input } from "../lib";
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

type Instruction = {
  key: string;
  op: "<" | ">";
  val: number;
  outcome: string;
};

type Rule =
  | { type: "test"; key: string; value: number; op: ">" | "<"; dest: string }
  | { type: "jump"; dest: string };

type Workflow = {
  name: string;
  instructions: Rule[];
  else: string; // name of a rule
};

type Item = { x: number; m: number; a: number; s: number };

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
let workflow = seq(name, rules);
let workflows = separatedBy(workflow, char("\n"));

let entry = seq(alpha, seq(char("="), int));
let item = map(
  surroundedBy(separatedBy(entry, char(",")), char("{"), char("}")),
  (r) => ({ x: r[0][1][1], m: r[1][1][1], a: r[2][1][1], s: r[3][1][1] })
);
let items = separatedBy(item, char("\n"));

let file = map(seq(workflows, seq(string("\n\n"), items)), (r) => ({
  rules: r[0],
  items: r[1][1],
}));

let parsedFile = parse(file, await input());

console.log(parsedFile);

/* 
Need it to be faster? 
Ok so here's what I'm thinking: there are a lot of rules and a lot of items.
So a way to make it fast is, instead of following each rule, to just track 
the 4-dimensional state space, dividing it along each dimension, so that we
can just do four lookups to 

*/
