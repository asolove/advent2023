
let inputLines = async function() {
    let full: string = "";
    for await (const chunk of Bun.stdin.stream()) {
        full += Buffer.from(chunk).toString();
    }
    return full.split("\n");
}

let digits = (s: string): string => s.replace(/[^0-9]/g, '')
let firstAndLast = (s: string): number => parseInt(s[0] + s[s.length-1], 10)

let lines = await inputLines();
let lineDigits = lines.map(digits);
let lineFirstAndLast = lineDigits.map(firstAndLast);
console.log(lineFirstAndLast.reduce((a,b) => a+b));
