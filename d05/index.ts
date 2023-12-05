import { input, min, sum } from "../lib";
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
    mappings: r[1].sort((a, b) => a.sourceRangeStart - b.sourceRangeStart),
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

type Range = { start: number; len: number };

let lookupRange = (source: Range, map: Map): Range[] => {
  let sourceStart = source.start;
  let sourceLength = source.len;

  let results: Range[] = [];

  for (var i = 0; i < map.mappings.length; i++) {
    let m = map.mappings[i];

    if (sourceLength === 0) break;
    if (
      results.length === 0 &&
      m.sourceRangeStart + m.rangeLength < sourceStart
    )
      continue;

    if (sourceStart < m.sourceRangeStart) {
      let missingLen = Math.min(sourceLength, m.sourceRangeStart - sourceStart);
      results.push({ start: sourceStart, len: missingLen });
    }

    if (sourceStart + sourceLength < m.sourceRangeStart) {
      break; // we're past the mappings for our range
    }

    let overlapStart = Math.max(sourceStart, m.sourceRangeStart);
    let overlapEnd = Math.min(
      sourceStart + sourceLength,
      m.sourceRangeStart + m.rangeLength
    );
    let mappedStart =
      m.destinationRangeStart + (overlapStart - m.sourceRangeStart);
    results.push({ start: mappedStart, len: overlapEnd - overlapStart });

    sourceStart = overlapEnd;
    sourceLength -= overlapEnd - overlapStart;
  }

  if (sourceLength > 0) {
    results.push({ start: sourceStart, len: sourceLength });
  }

  return results;
};

let seedRanges: Range[] = [];
let total = 0;
for (let i = 0; i < seeds.length; i = i + 2) {
  total += seeds[i + 1];
  seedRanges.push({ start: seeds[i], len: seeds[i + 1] });
}

console.log(
  "Part 2:",
  maps
    .reduce(
      (ranges, map) => ranges.flatMap((range) => lookupRange(range, map)),
      seedRanges
    )
    .map((r) => r.start)
    .reduce(min)
);
