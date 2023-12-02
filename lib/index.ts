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

export let sum = (a, b) => a + b;

export let merge = (a, b) => ({ ...a, ...b });
