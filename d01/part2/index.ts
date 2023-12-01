import { inputLines, sum } from "../../lib";

let wordDigits = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

let lineDigits = (s: string): number[] => {
  let digits: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (char >= "0" && char <= "9") {
      digits.push(parseInt(char, 10));
    } else {
      for (const word in wordDigits) {
        if (s.substring(i).startsWith(word)) {
          digits.push(wordDigits[word]);
        }
      }
    }
  }
  return digits;
};

let firstAndLast = (digits: number[]): number =>
  digits[0] * 10 + digits[digits.length - 1];

console.log((await inputLines()).map(lineDigits).map(firstAndLast).reduce(sum));
