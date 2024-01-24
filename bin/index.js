#! /usr/bin/env node

import { create_password, create_user, generate_password } from "./module.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import readline from "readline";
import fs from "fs";
// const yargs = require("yargs");
// const fs = require("fs");

const inputFile = "input.txt"; // File to store the input value

yargs(hideBin(process.argv))
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
    command: "add",
    describe: "Add a new password",
    handler: function () {
      try {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        rl.question("Website URL: ", (website) => {
          rl.question("Username: ", (username) => {
            rl.question("Password: ", (password) => {
              rl.question("Starred (y/n): ", (starred) => {
                // Create password object
                const newPassword = create_password(
                  website,
                  username,
                  password,
                  starred.toLowerCase() === "y"
                );

                // Do something with the new password object (e.g., save it)
                console.log("New Password:", newPassword);

                // Close the readline interface
                rl.close();
              });
            });
          });
        });
      } catch (error) {
        console.error("Error:", error.message);
      }
    },
  })
  .command({
    command: "generate",
    describe: "Generates a secure password",
    handler: function (argv) {
      try {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        rl.question("Password Length: ", (length) => {
          console.log(length);
          length = Number(length);
          let secure_password = generate_password(length);

          console.log(secure_password);

          rl.close();
        });
      } catch (e) {
        console.log("Error:", e.message);
      }
    },
  })
  .parse();
