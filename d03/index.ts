import { input, inputLines } from "../lib";
import { char, int, many1, Parser, plus, sat, separatedBy } from "../lib/parse";

type Item = "." | string | number;
const symbolChar = (c) => c != "." && !(c >= "0" && c <= "9");

// Parse input
let symbol: Parser<Item> = sat(symbolChar);
let item: Parser<Item> = plus(int, plus(char("."), symbol));
let line = many1(item);

const parseLine = (input: string): Item[] => {
  for (const result of line(input)) {
    return result.value;
  }
  return [];
};

// IO
const inp = await input();
const grid = inp.split("\n");
const items = grid.map(parseLine);

// Part 1
const isSymbol = (r: number, c: number, debug: boolean = false): boolean => {
  let row = grid[r];
  if (!row) {
    if (debug) console.log(`isSymbol: invalid row ${r}`);
    return false;
  }

  let char = row[c];
  if (!char) {
    if (debug) console.log(`isSymbol: invalid column ${r}, ${c}`);
    return false;
  }

  let res = symbolChar(char);
  if (debug) {
    console.log(`isSymbol: ${res} for ${char} at ${r}, ${c}`);
  }
  return res;
};

const nearSymbol = (
  row: number,
  colMin: number,
  colMax: number,
  debug: boolean = false
): boolean => {
  // left
  if (isSymbol(row, colMin - 1, debug)) {
    if (debug) console.log("Near symbol to the left");
    return true;
  }
  // right
  if (isSymbol(row, colMax + 1, debug)) {
    if (debug) console.log("Near symbol to the right");
    return true;
  }
  // top
  for (let c = colMin - 1; c <= colMax + 1; c++) {
    if (isSymbol(row - 1, c, debug)) {
      if (debug) console.log("Near symbol above at", c);
      return true;
    }
  }
  // bottom
  for (let c = colMin - 1; c <= colMax + 1; c++) {
    if (isSymbol(row + 1, c, debug)) {
      if (debug) console.log("Near symbol below at", c);
      return true;
    }
  }
  return false;
};

let result = 0;

for (let r = 0; r < items.length; r++) {
  let row = items[r];
  let c = 0;
  for (let i in row) {
    let item = row[i];
    if (typeof item === "number") {
      let len = item.toString().length;
      if (nearSymbol(r, c, c + len - 1, item === 000)) {
        result += item;
      } else {
        // console.log("Not near a symbol", item);
      }
      c += len;
    } else {
      c++;
    }
  }
}

console.log("Part 1", result);
