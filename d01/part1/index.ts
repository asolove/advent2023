import { inputLines } from "../../lib";

let digits = (s: string): string => s.replace(/[^0-9]/g, "");
let firstAndLast = (s: string): number => parseInt(s[0] + s[s.length - 1], 10);

let lines = await inputLines();
let lineDigits = lines.map(digits);
let lineFirstAndLast = lineDigits.map(firstAndLast);
console.log(lineFirstAndLast.reduce((a, b) => a + b));
