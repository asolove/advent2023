import { counts, input, sum, tap } from "../lib";
import {
  Parser,
  alphanumeric,
  char,
  int,
  many1,
  map,
  parse,
  separatedBy,
  seq,
} from "../lib/parse";

// Representation
type Hand = { bid: number; cards: string[] };
enum HandType {
  HighCard = 0,
  OnePair = 1,
  TwoPair = 2,
  Three = 3,
  FullHouse = 4,
  Four = 5,
  Five = 6,
}
let cardRank = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

// Parse
let hand = many1(alphanumeric);
let line: Parser<Hand> = map(seq(hand, seq(char(" "), int)), (r) => ({
  bid: r[1][1],
  cards: r[0],
}));
let lines = separatedBy(line, char("\n"));

// IO
let hands = parse(lines, await input());

// Part 1
let handType = (h: Hand): HandType => {
  let cardCounts = counts(h.cards);
  let cardCount = counts(
    [...cardCounts.entries()].map(([card, count]) => count)
  );
  if (cardCount.has(5)) return HandType.Five;
  if (cardCount.has(4)) return HandType.Four;
  if (cardCount.has(3) && cardCount.has(2)) return HandType.FullHouse;
  if (cardCount.has(3)) return HandType.Three;
  if (cardCount.has(2) && cardCount.get(2) == 2) return HandType.TwoPair;
  if (cardCount.has(2)) return HandType.OnePair;
  return HandType.HighCard;
};

let compareCards = (c1: string[], c2: string[]): number => {
  let r = cardRank[c1[0]] - cardRank[c2[0]];
  if (r !== 0) return r;
  return compareCards(c1.slice(1), c2.slice(1));
};
let compareHands = (h1: Hand, h2: Hand): number => {
  let compareType = handType(h1) - handType(h2);
  return compareType != 0 ? compareType : compareCards(h1.cards, h2.cards);
};

console.log(
  "Part 1",
  hands
    .sort(compareHands)
    .map((h, i) => [h.bid, i + 1])
    .map(([a, b]) => a * b)
    .reduce(sum)
);
