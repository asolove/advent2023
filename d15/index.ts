import { input, sum } from "../lib";
import {
  seq,
  string,
  int,
  separatedBy,
  map,
  Parser,
  parse,
  char,
  many,
  plus,
  digit,
  many1,
  alpha,
} from "../lib/parse";

// Part 1
let hash = (s: string): number => {
  let v = 0;

  for (let i = 0; i < s.length; i++) {
    v += s.charCodeAt(i);
    v *= 17;
    v %= 256;
  }
  return v;
};

// let steps = (await input()).split(",");
// console.log("Part 1", steps.map(hash).reduce(sum));

// Part 2

// Represenation
type Instruction =
  | { op: "remove"; box: number; label: string }
  | { op: "add"; box: number; label: string; power: number };

type LabeledLens = { power: number; label: string };
type Box = LabeledLens[];
type Boxes = Box[];

// Parse
let removeOp: Parser<[string, number]> = map(char("-"), (c) => [c, 0]);
let addOp: Parser<[string, number]> = seq(char("="), int);
let operation = plus(removeOp, addOp);
let label: Parser<string> = map(many1(alpha), (cs) => cs.join(""));
let instruction: Parser<Instruction> = map(
  seq(label, operation),
  ([label, [op, power]]) => ({
    op: op === "-" ? "remove" : "add",
    box: hash(label),
    label: label,
    power: power,
  })
);

// IO
let instructions: Instruction[] = (await input())
  .split(",")
  .map((s) => parse(instruction, s));

let boxes: Boxes = new Array(256).fill([] as Box).map((_x) => [] as Box);

let showLens = (l) => `[${l.label} ${l.power}]`;
let show = (boxes) => {
  boxes.forEach((box, i) => {
    if (box.length > 0) console.log(`Box ${i}: ${box.map(showLens).join(" ")}`);
  });
};

let execute = (boxes: Boxes, instruction: Instruction): Boxes => {
  let box = boxes[instruction.box];
  let i = box.findIndex((v) => v.label === instruction.label);

  if (instruction.op === "remove") {
    if (i >= 0) {
      box.splice(i, 1);
    }
  } else {
    if (i >= 0) {
      box[i].power = instruction.power;
    } else {
      box.push({ label: instruction.label, power: instruction.power });
    }
  }
  return boxes;
};

let focusingPower = (boxes: Boxes): number =>
  boxes
    .map((box, boxNumber) =>
      box
        .map((lens, slot) => lens.power * (slot + 1) * (boxNumber + 1))
        .reduce(sum, 0)
    )
    .reduce(sum);

instructions.reduce(execute, boxes);

console.log("Part 2", focusingPower(boxes));
