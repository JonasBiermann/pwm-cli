#! /usr/bin/env node

import UserSingleton from "./GlobalUser.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import readline from "readline";
import crypto from "crypto";
import { create_password, generate_password } from "./classes/PasswordClass.js";
import { User } from "./classes/UserClass.js";

// Function to check if user is authenticated
function isAuthenticated() {
  const user = UserSingleton.getInstance().getUser();
  console.log(user);
  return user && user.getSession();
}

yargs(hideBin(process.argv))
  .command({
    command: "create-user",
    describe: "Create User",
    handler: async function () {
      const user = UserSingleton.getInstance();
      if (!user){
        try {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });
  
          rl.question("Username: ", (username) => {
            rl.question("Password: ", (password) => {
              let user_key = crypto.randomBytes(32).toString("hex");
  
              // Use the singleton instance to create the user
              UserSingleton.getInstance().createUser(
                username,
                password,
                "",
                user_key
              );
              console.log("User created successfully.");
              rl.close();
            });
          });
        } catch (e) {
          console.error("Error creating user: ", e.message);
        }
      }
      else {
        console.log("user already exists!")
      }
    },
  })
  .command({
    command: "logout",
    describe: "Logout User",
    handler: function () {
      if (isAuthenticated()) {
        try {
          const user_instance = UserSingleton.getInstance();
          user_instance.logOutUser();
          console.log("Successfully logged out User");
          console.log(user_instance.getUser());
        } catch (e) {
          console.error("Error reading input: ", e.message);
        }
      } else {
        console.log("User not authenticated!");
      }
    },
  })
  .command({
    command: "authenticate",
    describe: "Authenticate User",
    handler: function () {
      if (!isAuthenticated) {
        try {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          rl.question("Enter your Password: ", (password) => {
            const user = GlobalUser.getUser();
            if (user && user.authenticateUser(password)) {
              user.session = true;
              console.log("User authenticated successfully.");
            } else {
              console.log("Authentication failed. User not found.");
            }
            rl.close();
          });
        } catch (e) {
          console.error("Error reading input: ", error.message);
        }
      }
      else {
        console.log("User is already authenticated");
      }
    },
  })
  .command({
    command: "add",
    describe: "Add a new password",
    handler: async function () {
      if (!isAuthenticated()) {
        console.log("User not authenticated");
        return;
      } else {
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
                  let user_password_data = new Storage(
                    "userData.json",
                    user.user_key
                  );
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
      }
    },
  })
  .command({
    command: "generate",
    describe: "Generates a secure password",
    handler: function (argv) {
      if (!isAuthenticated()) {
        console.log("User not authenticated");
        return;
      } else {
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
            rl.question(
              "Do you want to save this password? (y/n): ",
              (save) => {
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
                        let user_password_data = new Storage(
                          "userData.json",
                          user.user_key
                        );
                        console.log("New Password:", new_password);
                        user_password_data.savePassword(new_password);
                        rl.close();
                      });
                    });
                  });
                } else {
                  rl.close();
                }
              }
            );
          });
        } catch (e) {
          console.log("Error:", e.message);
        }
      }
    },
  })
  .parse();
