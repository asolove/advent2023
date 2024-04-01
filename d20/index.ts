import { input, sum } from "../lib";
import {
  parse,
  plus,
  seq,
  string,
  name,
  char,
  map,
  Parser,
  separatedBy,
} from "../lib/parse";

// Parse

type ModuleDefinition =
  | { type: "broadcaster"; name: "broadcaster" }
  | { type: "flipFlop"; name: string }
  | { type: "conjunction"; name: string };

let prefix: Parser<string> = plus(char("%"), char("&"));

let broadcasterDefinition: Parser<ModuleDefinition> = map(
  string("broadcaster"),
  () => ({ type: "broadcaster", name: "broadcaster" })
);
let componentDefinition: Parser<ModuleDefinition> = map(
  seq(prefix, name),
  ([symbol, name]) => ({
    type: symbol === "%" ? "flipFlop" : "conjunction",
    name,
  })
);

let moduleDefinition = plus(broadcasterDefinition, componentDefinition);

let destinations = separatedBy(name, string(", "));

let line: Parser<{ from: ModuleDefinition; to: string[] }> = map(
  seq(moduleDefinition, seq(string(" -> "), destinations)),
  ([from, [_arrow, to]]) => ({ from, to })
);

let lines = separatedBy(line, char("\n"));

// IO

let definitions = parse(lines, await input());
// console.log(definitions);

// Representation

// Lookup a component by name
let components: Map<string, Component> = new Map();
// For a given component name, which components send it inputs
let inputs: Map<string, string[]> = new Map();
// For a given component name, which components does it send to
let outputs: Map<string, string[]> = new Map();

type PulseLevel = 0 | 1;

interface Component {
  inInitialState(): boolean;
  receive(from: string, level: PulseLevel): PulseLevel | undefined;
}

let makeComponent = (item): Component => {
  let fn =
    item.from.type === "broadcaster"
      ? makeBroadcaster
      : item.from.type === "flipFlop"
      ? makeFlipFlop
      : makeConjunction;
  let ins = inputs.get(item.from.name);
  if (!ins) throw `No inputs found for ${item.from.name}`;
  return fn(ins);
};

let makeBroadcaster = (_inputs): Component => {
  return {
    inInitialState(): boolean {
      return true;
    },
    receive(from: string, level: PulseLevel): PulseLevel {
      return level;
    },
  };
};

let makeFlipFlop = (_inputs): Component => {
  let state = false;

  return {
    inInitialState(): boolean {
      return state === false;
    },
    receive(from: string, level: PulseLevel): PulseLevel | undefined {
      if (level === 1) return;
      state = !state;
      return state ? 1 : 0;
    },
  };
};

let makeConjunction = (inputs: string[]): Component => {
  const state: Map<string, PulseLevel> = new Map(
    inputs.map((input) => [input, 0])
  );

  // console.log(`At setup, conjunction has ${[...state.entries()]}`);
  const all = (l: PulseLevel) =>
    [...state.entries()].every(([_name, level]) => level === l);

  return {
    inInitialState(): boolean {
      return all(0);
    },
    receive(from: string, level: PulseLevel): PulseLevel {
      state.set(from, level);
      // console.log(`  conjunction has ${[...state.entries()]}`);
      return all(1) ? 0 : 1;
    },
  };
};

/* Overview of approach
   - Initialize the state of each module with a name mapping
      (compile away names and just have direct references?)
   - Each turn:
     - Start a queue of pulses, initialized with the low to broadcast
     - Pull a pulse off, apply it, 
       - Component receives the pulse, updates state, and 
     - Check if we're back to initial state
       - Ask each component if it's in its initial state
   - If we found a cycle, then multiply it out and count the dangling few runs at the end.
   - Else run next turn
*/

definitions.forEach((item) => {
  inputs.set(item.from.name, []);
  outputs.set(item.from.name, item.to);
});
definitions.forEach((item) => {
  let source = item.from.name;
  item.to.forEach((destination) => {
    let current = inputs.get(destination);
    if (current) {
      inputs.set(destination, current.concat(source));
    }
  });
});
definitions.forEach((item) =>
  components.set(item.from.name, makeComponent(item))
);

type Pulse = { from: string; to: string; level: PulseLevel };

// console.log({ inputs, outputs, components });

let runTurn = (): [number, number] => {
  let queue: Array<Pulse> = [{ from: "button", to: "broadcaster", level: 0 }];
  let highs = 0;
  let lows = 0;

  while (queue.length > 0) {
    let { from, to, level } = queue.shift()!;
    // console.log(`${from} -${level ? "high" : "low"}-> ${to}`);

    if (level === 0) {
      lows++;
    } else {
      highs++;
    }

    let c = components.get(to);
    if (!c) {
      // console.log(`  Couldn't found recipient ${to}. Skipping.`);
      if (to === "rx" && level === 0) throw `Sent a ${level} pulse to 'rx'`;
      continue;
    }
    let nextLevel = c.receive(from, level);
    if (nextLevel !== undefined) {
      outputs.get(to)!.forEach((output) => {
        queue.push({ from: to, to: output, level: nextLevel });
      });
    }
  }
  return [lows, highs];
};

let atStart = (): boolean =>
  [...components.entries()].every(([_n, c]) => c.inInitialState());

let runUntilCycle = (): number => {
  let lows: number[] = [];
  let highs: number[] = [];
  let cycleFound = false;
  let i = 0;

  while (i < 1000 && !cycleFound) {
    console.log(`Running round ${i + 1}`);
    let [dl, dh] = runTurn();
    lows.push(dl);
    highs.push(dh);
    cycleFound = atStart();
    i++;
  }

  let timesThroughCycle = Math.floor(1000 / i);
  let extras = 1000 % i;

  let totalLows =
    lows.reduce(sum) * timesThroughCycle + lows.slice(0, extras).reduce(sum, 0);
  let totalHighs =
    highs.reduce(sum) * timesThroughCycle +
    highs.slice(0, extras).reduce(sum, 0);

  return totalLows * totalHighs;
};

console.log(runUntilCycle());
