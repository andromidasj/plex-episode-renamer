import chalk from "chalk";

export function logDivider(char) {
  char = char || "-";
  const divider = new Array(process.stdout.columns).fill(char).join("");
  console.log(chalk.blue("\n" + divider + "\n"));
}
