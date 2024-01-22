#! /usr/bin/env node

const yargs = require("yargs");
const fs = require("fs");

const inputFile = "input.txt"; // File to store the input value

yargs
  .command({
    command: "input",
    describe: "Set input",
    builder: {
      input: {
        describe: "Input value",
        demandOption: true,
        type: "string",
      },
    },
    handler: function (argv) {
      const input = argv.input;
      console.log("Setting input:", input);
      fs.writeFileSync(inputFile, input);
    },
  })
  .command({
    command: "output",
    describe: "Get output",
    handler: function () {
      try {
        const input = fs.readFileSync(inputFile, "utf-8");
        console.log("Output:", input);
      } catch (error) {
        console.error("Error reading input:", error.message);
      }
    },
  })
  .help().argv;
