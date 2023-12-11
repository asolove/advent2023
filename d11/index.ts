import { inputLines, pairs, sum, transpose } from "../lib/";

// Representation
type Obs = "." | "#";
type Image = Obs[][];

// IO
let image: Image = (await inputLines()).map((l) => l.split("") as Obs[]);
let showImage = (image: Image) => image.map((l) => l.join("")).join("\n");

// Part 1
let galaxyCoordinates = (image: Image): [number, number][] => {
  let r: [number, number][] = [];
  for (let i = 0; i < image.length; i++) {
    for (let j = 0; j < image[0].length; j++) {
      if (image[i][j] === "#") r.push([i, j]);
    }
  }
  return r;
};

let distance = ([[y1, x1], [y2, x2]]) => Math.abs(y2 - y1) + Math.abs(x2 - x1);

let expand = (image: Image): Image => expandCols(expandRows(image));

let expandRows = (image: Image): Image => {
  let r = clone(image);
  for (let i = 0; i < r.length; i++) {
    let row = r[i];
    let empty = true;
    for (let j = 0; j < row.length; j++) {
      if (row[j] === "#") {
        empty = false;
        break;
      }
    }

    // if we need to add a row, also have i skip it
    if (empty) {
      let emptyRow = new Array(row.length).fill(".");
      r = r.slice(0, i + 1).concat([emptyRow].concat(r.slice(i + 1)));
      i++;
    }
  }

  return r;
};

let expandCols = (image: Image): Image => {
  let r = clone(image);
  for (let j = 0; j < r[0].length; j++) {
    let empty = true;
    for (let i = 0; i < r.length; i++) {
      if (r[i][j] === "#") {
        empty = false;
        break;
      }
    }

    if (empty) {
      r.forEach((row) => row.splice(j, 0, "."));
      j++;
    }
  }

  return r;
};

let clone = (image: Image): Image => JSON.parse(JSON.stringify(image));

console.log(
  "Part 1",
  pairs(galaxyCoordinates(expand(image)))
    .map(distance)
    .reduce(sum)
);

// Part 2

let emptyRows = (image: Image): number[] =>
  image
    .map((r, i) => [i, r] as [number, Obs[]])
    .filter(([i, r]) => r.every((s) => s === "."))
    .map(([i, r]) => i);

let emptyCols = (image: Image): number[] => emptyRows(transpose(image));

const EXPANSION_FACTOR = 1000000;

let distanceWithEmpty = ([[y1, x1], [y2, x2]], rows, cols): number => {
  let dy =
    Math.abs(y2 - y1) +
    (EXPANSION_FACTOR - 1) *
      rows.filter((y) => (y2 > y && y > y1) || (y1 > y && y > y2)).length;
  let dx =
    Math.abs(x2 - x1) +
    (EXPANSION_FACTOR - 1) *
      cols.filter((x) => (x2 > x && x > x1) || (x1 > x && x > x2)).length;
  return dy + dx;
};

let rows = emptyRows(image);
let cols = emptyCols(image);

console.log(
  "Part 2",
  pairs(galaxyCoordinates(image))
    .map((cs) => distanceWithEmpty(cs, rows, cols))
    .reduce(sum)
);
