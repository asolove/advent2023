// IO

export let input = async function () {
  let r: string = "";
  for await (const chunk of Bun.stdin.stream()) {
    r += Buffer.from(chunk).toString();
  }
  return r;
};

export let inputLines = async function () {
  return (await input()).split("\n");
};

// Helpers

export let sum = (a, b) => a + b;
export let product = (a, b) => a * b;

export let merge = (a, b) => ({ ...a, ...b });

export function isPresent<A>(a: A | undefined): a is A {
  return a !== undefined;
}

export let isDigit = (c) => c >= "0" && c <= "9";

export let min = (a, b) => Math.min(a, b);

export let tap = (name, value) => {
  console.log(name, value);
  return value;
};

export let max = (a, b) => Math.max(a, b);

export function counts<A>(items: A[]): Map<A, number> {
  let r = new Map();
  for (let item of items) {
    if (r.has(item)) {
      r.set(item, r.get(item) + 1);
    } else {
      r.set(item, 1);
    }
  }
  return r;
}

export function pairs<A>(items: A[]): [A, A][] {
  let r: [A, A][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j != i && j < items.length; j++) {
      r.push([items[i], items[j]]);
    }
  }
  return r;
}

export function transpose<A>(items: A[][]): A[][] {
  let r: A[][] = [];

  for (let j = 0; j < items[0].length; j++) {
    r[j] = [];
    for (let i = 0; i < items.length; i++) {
      r[j][i] = items[i][j];
    }
  }

  return r;
}
