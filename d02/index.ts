import {
  char,
  int,
  many,
  many1,
  map,
  Parser,
  plus,
  separatedBy,
  seq,
  string,
} from "../lib/parse";
import { input, merge, sum } from "../lib/";

type Color = "green" | "red" | "blue";

type Pull = {
  [C in Color]?: number;
};

type Game = {
  id: number;
  pulls: Pull[];
};

// Parse input

const color: Parser<Color> = plus(
  string("red"),
  plus(string("green"), string("blue"))
);
const colorCount: Parser<Pull> = map(seq(int, seq(char(" "), color)), (r) => ({
  [r[1][1]]: r[0],
}));

const pull: Parser<Pull> = map(separatedBy(colorCount, string(", ")), (pulls) =>
  pulls.reduce(merge, {})
);

const pulls = separatedBy(pull, string("; "));
const game = map(seq(string("Game "), seq(int, string(": "))), (r) => r[1][0]);

const gameLine: Parser<Game> = map(seq(game, pulls), (r) => ({
  id: r[0],
  pulls: r[1],
}));
const gameLines: Parser<Game[]> = separatedBy(gameLine, char("\n"));

const inputGames = (input: string): Game[] => {
  for (const result of gameLines(input)) {
    return result.value;
  }
  return [];
};

const games = inputGames(await input());

const completePull: Pull = {
  red: 12,
  green: 13,
  blue: 14,
};

const pullPossible = (pull: Pull): boolean => {
  for (const color in completePull) {
    if (pull[color] && pull[color] > completePull[color]) return false;
  }
  return true;
};

console.log(
  games
    .filter((game) => game.pulls.every(pullPossible))
    .map((game) => game.id)
    .reduce(sum)
);
