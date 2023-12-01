
export let inputLines = async function() {
    let full: string = "";
    for await (const chunk of Bun.stdin.stream()) {
        full += Buffer.from(chunk).toString();
    }
    return full.split("\n");
}

export let sum = (a, b) => a + b;