const chalk = require("chalk");
const yargs = require("yargs");
const boxen = require("boxen");


const usage = chalk.keyword('violet')("\nUsage: mycli -l <language>  -s <sentence> \n"
  + boxen(chalk.green("\n" + "Translates a sentence to a specific language" + "\n"), { padding: 1, borderColor: 'green', dimBorder: true }) + "\n");
const options = yargs
  .usage(usage)
  .option("l", { alias: "language", describe: "Translate to language", type: "string", demandOption: false })
  .option("s", { alias: "sentence", describe: "Sentence to be translated", type: "string", demandOption: false })
  .help(true)
  .argv;
