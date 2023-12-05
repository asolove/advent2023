import { input, min } from "../lib";
import {
  Parser,
  char,
  int,
  line,
  map,
  parse,
  separatedBy,
  seq,
  string,
} from "../lib/parse";

// Representation
type Mapping = {
  destinationRangeStart: number;
  sourceRangeStart: number;
  rangeLength: number;
};
type Map = { name: string; mappings: Array<Mapping> };

// Parse
let integers = separatedBy(int, char(" "));
let seedsLine: Parser<number[]> = map(
  seq(string("seeds: "), seq(integers, string("\n\n"))),
  (r) => r[1][0]
);
let mapEntry: Parser<Mapping> = map(separatedBy(int, char(" ")), (r) => ({
  destinationRangeStart: r[0],
  sourceRangeStart: r[1],
  rangeLength: r[2],
}));
let aMap: Parser<Map> = map(
  seq(line, separatedBy(mapEntry, char("\n"))),
  (r) => ({
    name: r[0].replace(" map:\n", ""),
    mappings: r[1],
  })
);
let allMaps = separatedBy(aMap, string("\n\n"));
let file = seq(seedsLine, allMaps);

// IO
const [seeds, maps] = parse(file, await input());

// Part 1
let lookup = (source: number, map: Map): number => {
  for (let m of map.mappings) {
    if (
      source >= m.sourceRangeStart &&
      source <= m.sourceRangeStart + m.rangeLength
    ) {
      return m.destinationRangeStart + (source - m.sourceRangeStart);
    }
  }
  // if no mapping found, value stays the same
  return source;
};

console.log(
  "Part 1:",
  maps
    .reduce((values, map) => values.map((value) => lookup(value, map)), seeds)
    .reduce(min)
);

// Part 2
// There is a more principled way by tracking overlapping ranges,
// but I'm going to brute-force it.
let seedsByRange: number[] = [];
for (let i = 0; i < seeds.length; i = i + 2) {
  for (let j = seeds[i]; j < seeds[i] + seeds[i + 1]; j++) {
    seedsByRange.push(j);
  }
}

console.log(
  "Part 2:",
  maps
    .reduce(
      (values, map) => values.map((value) => lookup(value, map)),
      seedsByRange
    )
    .reduce(min)
);
