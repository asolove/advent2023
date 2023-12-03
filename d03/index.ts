import { input, inputLines, sum } from "../lib";
import { char, int, many1, Parser, plus, sat, separatedBy } from "../lib/parse";

// type Item = "." | string | number;
// const symbolChar = (c) => c != "." && !(c >= "0" && c <= "9");

// // Parse input
// let symbol: Parser<Item> = sat(symbolChar);
// let item: Parser<Item> = plus(int, plus(char("."), symbol));
// let line = many1(item);

// const parseLine = (input: string): Item[] => {
//   for (const result of line(input)) {
//     return result.value;
//   }
//   return [];
// };

// // IO
// const inp = await input();
// const grid = inp.split("\n");
// const items = grid.map(parseLine);

// // Part 1
// const isSymbol = (r: number, c: number, debug: boolean = false): boolean => {
//   let row = grid[r];
//   if (!row) {
//     if (debug) console.log(`isSymbol: invalid row ${r}`);
//     return false;
//   }

//   let char = row[c];
//   if (!char) {
//     if (debug) console.log(`isSymbol: invalid column ${r}, ${c}`);
//     return false;
//   }

//   let res = symbolChar(char);
//   if (debug) {
//     console.log(`isSymbol: ${res} for ${char} at ${r}, ${c}`);
//   }
//   return res;
// };

// const nearSymbol = (
//   row: number,
//   colMin: number,
//   colMax: number,
//   debug: boolean = false
// ): boolean => {
//   // left
//   if (isSymbol(row, colMin - 1, debug)) {
//     if (debug) console.log("Near symbol to the left");
//     return true;
//   }
//   // right
//   if (isSymbol(row, colMax + 1, debug)) {
//     if (debug) console.log("Near symbol to the right");
//     return true;
//   }
//   // top
//   for (let c = colMin - 1; c <= colMax + 1; c++) {
//     if (isSymbol(row - 1, c, debug)) {
//       if (debug) console.log("Near symbol above at", c);
//       return true;
//     }
//   }
//   // bottom
//   for (let c = colMin - 1; c <= colMax + 1; c++) {
//     if (isSymbol(row + 1, c, debug)) {
//       if (debug) console.log("Near symbol below at", c);
//       return true;
//     }
//   }
//   return false;
// };

// let result = 0;

// for (let r = 0; r < items.length; r++) {
//   let row = items[r];
//   let c = 0;
//   for (let i in row) {
//     let item = row[i];
//     if (typeof item === "number") {
//       let len = item.toString().length;
//       if (nearSymbol(r, c, c + len - 1, item === 000)) {
//         result += item;
//       } else {
//         // console.log("Not near a symbol", item);
//       }
//       c += len;
//     } else {
//       c++;
//     }
//   }
// }

// console.log("Part 1", result);

const lines = await inputLines();

type SymbolItem = {
  type: "symbol";
  gear: boolean;
  r: number;
  cMin: number;
  cMax: number;
};
type NumberItem = {
  type: "number";
  value: number;
  r: number;
  cMin: number;
  cMax: number;
};
type Item = SymbolItem | NumberItem;

const isDigit = (c) => c >= "0" && c <= "9";

const allItems: Item[] = [];
const itemGrid: Item[][] = [];

for (let r = 0; r < lines.length; r++) {
  let row = lines[r];
  itemGrid[r] = [];
  let currentNumber: NumberItem | undefined = undefined;
  for (let c = 0; c < row.length; c++) {
    let char = row[c];
    let item: Item;
    if (char == ".") {
      currentNumber = undefined;
      continue;
    } else if (isDigit(char)) {
      if (currentNumber) {
        currentNumber.value = currentNumber.value * 10 + parseInt(char, 10);
        currentNumber.cMax = c;
        itemGrid[r][c] = currentNumber;
      } else {
        currentNumber = {
          type: "number",
          value: parseInt(char, 10),
          r: r,
          cMin: c,
          cMax: c,
        };
        allItems.push(currentNumber);
        itemGrid[r][c] = currentNumber;
      }
    } else {
      currentNumber = undefined;
      item = { type: "symbol", gear: char === "*", r: r, cMin: c, cMax: c };
      allItems.push(item);
      itemGrid[r][c] = item;
    }
  }
}

const neighborItems = (item: Item): Item[] => {
  let res: (Item | undefined)[] = [];
  let { r, cMin, cMax } = item;

  res.push(itemAt(r, cMin - 1));
  res.push(itemAt(r, cMax + 1));
  for (let c = cMin - 1; c <= cMax + 1; c++) {
    res.push(itemAt(r - 1, c));
    res.push(itemAt(r + 1, c));
  }

  // strip missing values and enforce uniqueness
  return res.filter((x, i) => x !== undefined && res.indexOf(x) === i);
};

const itemAt = (r, c): Item | undefined => {
  let row = lines[r];
  if (!row) {
    return undefined;
  }

  let char = row[c];
  if (!char) {
    return undefined;
  }
  return itemGrid[r][c];
};

const isGear = (i) => i.type === "symbol" && i.gear;
function isNumberItem(i: Item): i is NumberItem {
  return i.type === "number";
}
function numberNeighbors(i: Item): NumberItem[] {
  return neighborItems(i).filter(isNumberItem);
}

console.log(
  "Part 2",
  allItems
    .filter(isGear)
    .map(numberNeighbors)
    .filter((ns) => ns.length === 2)
    .map((ns) => ns[0].value * ns[1].value)
    .reduce(sum)
);
