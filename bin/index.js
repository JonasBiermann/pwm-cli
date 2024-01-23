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
  .command({
    command: "add-password",
    describe: "Add a new password",
    builder: {
      website: {
        describe: "Website URL",
        demandOption: true,
        type: "string",
      },
      username: {
        describe: "Username",
        demandOption: true,
        type: "string",
      },
      password: {
        describe: "Password",
        demandOption: true,
        type: "string",
      },
      star: {
        describe: "Star Password?",
        demandOption: false,
        type: "string",
      }
    },
    handler: function(argv) {
      try {
        console.log("Success?")
        console.log(argv)
        const input = argv.input;
        console.log("Setting input:", input);
      fs.writeFileSync(inputFile, input);
      } catch (error) {
        console.error("Error:", error.message)
      }
    }
  })
  .help().argv;
