#! /usr/bin/env node

import { create_password, create_user, generate_password, Storage} from "./module.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import readline from "readline";
import fs from "fs";
import { userInfo } from "os";
// const yargs = require("yargs");
// const fs = require("fs");

const inputFile = "input.txt"; // File to store the input value

yargs(hideBin(process.argv))
  .command({
    command: "logout",
    describe: "Logout User",
    handler: function () {
      let user = create_user("JonasBiermann", "1234", "");
      try {
        if (user.logOutUser()) {
          console.log("Sucessfully logged out!");
        } else {
          throw new Error("Couldn't Logout User");
        }
      } catch (e) {
        console.error("Error reading input: ", e.message);
      }
    },
  })
  .command({
    command: "create-user",
    describe: "Create User",
    handler: function () {
      try {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        rl.question("Username: ", (username) => {
          rl.question("Password: ", (password) => {
            let user_key = crypto.randomBytes(32).toString("hex");
            let user = create_user(username, password, "", user_key);
            console.log(user);
            rl.close();
          });
        });
      } catch (e) {
        console.error("Error reading input: ", e.message);
      }
    },
  })
  .command({
    command: "authenticate",
    describe: "Authenticate User",
    handler: function () {
      try {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        let user = create_user("JonasBiermann", "1234", "");
        rl.question("Enter your Password: ", (password) => {
          if (user.checkPassword(password)) {
            user.session = false;
            console.log(user);
          }
          rl.close();
        });
      } catch (e) {
        console.error("Error reading input: ", error.message);
      }
    },
  })
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
                const new_password = create_password(
                  website,
                  username,
                  password,
                  starred.toLowerCase() === "y"
                );

                // Do something with the new password object (e.g., save it)
                let user_password_data = new Storage("userData.json", user.user_key);
                console.log("New Password:", new_password);
                user_password_data.savePassword(new_password);

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
          rl.question("Do you want to save this password? (y/n): ", (save) => {
            if (save === "y") {
              rl.question("Website: ", (website) => {
                rl.question("Username: ", (username) => {
                  rl.question("Starred (y/n): ", (starred) => {
                    // Create password object
                    const new_password = create_password(
                      website,
                      username,
                      secure_password,
                      starred.toLowerCase() === "y"
                    );

                    // Do something with the new password object (e.g., save it)
                    let user_password_data = new Storage("userData.json", user.user_key);
                    console.log("New Password:", new_password);
                    user_password_data.savePassword(new_password);
                    rl.close();
                  });
                });
              });
            } else {
              rl.close();
            }
          });
        });
      } catch (e) {
        console.log("Error:", e.message);
      }
    },
  })
  .parse();
