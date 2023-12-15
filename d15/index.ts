import { input, sum } from "../lib";

let steps = (await input()).split(",");

let hash = (s: string): number => {
  let v = 0;

  for (let i = 0; i < s.length; i++) {
    v += s.charCodeAt(i);
    v *= 17;
    v %= 256;
  }
  return v;
};

console.log("Part 1", steps.map(hash).reduce(sum));
