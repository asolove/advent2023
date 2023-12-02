import {
  char,
  int,
  map,
  Parser,
  plus,
  separatedBy,
  seq,
  string,
} from "../lib/parse";
import { input, merge, product, sum } from "../lib/";

// Representation types

type Color = "green" | "red" | "blue";

type DieSet = {
  [C in Color]?: number;
};

type Game = {
  id: number;
  pulls: DieSet[];
};

// Parse input

const color: Parser<Color> = plus(
  string("red"),
  plus(string("green"), string("blue"))
);
const colorCount: Parser<DieSet> = map(
  seq(int, seq(char(" "), color)),
  (r) => ({
    [r[1][1]]: r[0],
  })
);

const pull: Parser<DieSet> = map(
  separatedBy(colorCount, string(", ")),
  (pulls) => pulls.reduce(merge, {})
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

// IO

const games = inputGames(await input());

// Part 1

const completePull: DieSet = {
  red: 12,
  green: 13,
  blue: 14,
};

const pullPossible = (pull: DieSet): boolean => {
  for (const color in completePull) {
    if (pull[color] && pull[color] > completePull[color]) return false;
  }
  return true;
};

console.log(
  "Part 1:",
  games
    .filter((game) => game.pulls.every(pullPossible))
    .map((game) => game.id)
    .reduce(sum)
);

// Part 2

const minSet = (game: Game): DieSet => {
  let min = { green: 0, red: 0, blue: 0 };
  game.pulls.forEach((pull) => {
    for (const color in pull) {
      if (pull[color] > min[color]) {
        min[color] = pull[color];
      }
    }
  });
  return min;
};

const power = (pull: DieSet) =>
  Object.entries(pull)
    .map((r) => r[1])
    .reduce(product, 1);

console.log("Part 2: ", games.map(minSet).map(power).reduce(sum));
