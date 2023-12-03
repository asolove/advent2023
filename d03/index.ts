import { inputLines, isDigit, isPresent, sum } from "../lib";

// IO

const lines = await inputLines();

// Representation

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

const allItems: Item[] = [];
const itemGrid: Item[][] = [];

// Parse items

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

// Helpers for representation

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
  return res.filter((x, i) => res.indexOf(x) === i).filter(isPresent);
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

function isNumber(i: Item): i is NumberItem {
  return i.type === "number";
}

function isSymbol(i: Item): i is SymbolItem {
  return i.type === "symbol";
}

function isGear(i: Item): i is SymbolItem {
  return isSymbol(i) && i.gear;
}

// Part 1

console.log(
  "Part 1",
  allItems
    .filter(isNumber)
    .filter((n) => neighborItems(n).filter(isSymbol).length > 0)
    .map((n) => n.value)
    .reduce(sum)
);

// Part 2

console.log(
  "Part 2",
  allItems
    .filter(isGear)
    .map((g) => neighborItems(g).filter(isNumber))
    .filter((ns) => ns.length === 2)
    .map((ns) => ns[0].value * ns[1].value)
    .reduce(sum)
);
