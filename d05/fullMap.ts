import { separatedBy, seq } from "../lib/parse";

let fullMap = seq(line, separatedBy());
