// src/utils/logWithColor.ts

/**
 * Supported log colors using ANSI escape codes for Node.js.
 * Usage examples:
 *   logWithColor({ foo: "bar" }, "blue");
 *   logWithColor("Error!", "brightRed");
 *   logWithColor([1,2,3]); // no color, normal console
 */
export type LogColor =
  | "black"
  | "red"
  | "orange"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "reset"
  | "purple"
  | "brightRed"
  | "brightGreen"
  | "brightYellow"
  | "brightBlue"
  | "brightMagenta"
  | "brightCyan"
  | "brightWhite"
  | "bgRed"
  | "bgGreen"
  | "bgYellow"
  | "bgBlue"
  | "bgPurple"
  | "bgMagenta"
  | "bgCyan"
  | "bgWhite"
  | "bgBrightRed"
  | "bgBrightGreen"
  | "bgBrightYellow"
  | "bgBrightBlue"
  | "bgBrightMagenta"
  | "bgBrightCyan"
  | "bgOrange"
  | "bgBrightWhite";

const colorCodes: Record<LogColor, string> & { default: string } = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  orange: "\x1b[38;5;208m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  reset: "\x1b[0m",
  purple: "\x1b[35m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
  bgBrightRed: "\x1b[101m",
  bgBrightGreen: "\x1b[102m",
  bgBrightYellow: "\x1b[103m",
  bgBrightBlue: "\x1b[104m",
  bgBrightMagenta: "\x1b[105m",
  bgBrightCyan: "\x1b[106m",
  bgBrightWhite: "\x1b[107m",
  bgOrange: "\x1b[48;5;208m",
  bgPurple: "\x1b[48;5;129m",
  default: "", // normal console color
};

/**
 * Print colored output to Node.js console, pretty-printing objects, with optional color.
 * @param data - Anything to print, will be JSON.stringified if not a string.
 * @param color - (Optional) One of the supported color names. If not provided, uses normal console color.
 */
export function logWithColor(data: unknown, color?: LogColor): void {
  const msg = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  if (!color) {
    console.log(msg);
    return;
  }
  const code = colorCodes[color] ?? colorCodes.default;
  // Only apply color if not default/empty
  if (!code) {
    console.log(msg);
    return;
  }
  // Always reset color afterwards
  console.log(code + msg + colorCodes.reset);
}
