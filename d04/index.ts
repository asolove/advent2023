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
} from "../lib/parse";

// Representation
type Card = { winning: Set<number>; present: Set<number> };

// Parse
const paddedInt: Parser<number> = map(seq(many(char(" ")), int), (r) => r[1]);
const header = seq(string("Card"), seq(paddedInt, string(": ")));
const numberSet = separatedBy(paddedInt, string(" "));
const card: Parser<Card> = map(
  seq(header, seq(numberSet, seq(string(" | "), numberSet))),
  (r) => ({ winning: new Set(r[1][0]), present: new Set(r[1][1][1]) })
);
const lines = separatedBy(card, char("\n"));

// IO
const cards = parse(lines, await input());

// Part 1
let matches = (c: Card): number => c.present.intersection(c.winning).size;

console.log(
  "Part 1",
  cards
    .map(matches)
    .map((n) => (n == 0 ? 0 : Math.pow(2, n - 1)))
    .reduce(sum)
);

// Part 2
const totalCards = (cards: Card[]): number => {
  let counts: Array<number> = new Array(cards.length).fill(1);

  for (let i = 0; i < cards.length; i++) {
    let m = matches(cards[i]);
    for (let j = i + 1; j < cards.length && j <= i + m; j++) {
      counts[j] += counts[i];
    }
  }

  return counts.reduce(sum);
};

console.log("Part 2", totalCards(cards));
