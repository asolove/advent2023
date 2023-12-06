import { input, product } from "../lib";
import {
  Parser,
  char,
  int,
  many1,
  map,
  parse,
  separatedBy,
  seq,
  string,
} from "../lib/parse";

// Time:      7  15   30
// Distance:  9  40  200
// Representation
type Game = { time: number; dist: number };

// Parse
let intList = separatedBy(int, many1(char(" ")));
let timeLine = map(
  seq(string("Time:"), seq(many1(char(" ")), intList)),
  (r) => r[1][1]
);
let distLine = map(
  seq(string("Distance:"), seq(many1(char(" ")), intList)),
  (r) => r[1][1]
);
let file: Parser<Game[]> = map(seq(timeLine, seq(char("\n"), distLine)), (r) =>
  r[0].map((t, i) => ({ time: t, dist: r[1][1][i] }))
);

// IO
let games = parse(file, await input());

// Part 1

let distance = (totalTime: number, hold: number) => hold * (totalTime - hold);
let beatsRecord = (game: Game, hold: number) =>
  distance(game.time, hold) > game.dist;

let to = (n: number): number[] => {
  let r = Array(n + 1);
  for (let i = 0; i < r.length; i++) {
    r[i] = i;
  }
  return r;
};
let waysToBeatRecord = (game: Game): number =>
  to(game.time)
    .map((t) => beatsRecord(game, t))
    .filter((x) => x).length;

console.log("Part 1", games.map(waysToBeatRecord).reduce(product));

// Part 2
let game = games.reduce(
  (totals, game) => ({
    dist: totals.dist * Math.pow(10, game.dist.toString().length) + game.dist,
    time: totals.time * Math.pow(10, game.time.toString().length) + game.time,
  }),
  { dist: 0, time: 0 }
);

console.log("Part 2", waysToBeatRecord(game));
