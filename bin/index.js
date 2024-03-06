#! /usr/bin/env node

import UserSingleton from "./GlobalUser.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import readline from "readline";
import crypto from "crypto";
import { generatePassword } from "./classes/PasswordClass.js";
import Storage from "./classes/StorageClass.js";
import { intro, text, select, confirm, group, password } from "@clack/prompts";
import clipboardy from "clipboardy";
import chalk from "chalk";

intro(
  `${chalk.hex("#171717")(
    chalk.hex("#1998c2").bold("Password Manager CLI by Jonas Biermann")
  )}`
);

// Function to check if user is authenticated
function isAuthenticated(user) {
  return user.getSession();
}

function checkUser() {
  const user = UserSingleton.getInstance().getUser();
  if (user) {
    return user;
  }
  return null;
}

function getWebsiteOptions(websites) {
  let website_options = [];
  for (let i = 0; i < websites.length; i++) {
    let dict = {
      value: websites[i],
      label: websites[i],
    };
    website_options.push(dict);
  }
  return website_options;
}

async function createUser() {
  const create_user = await group({
    username: () =>
      text({
        message: "Please set your Username!",
        validate(value) {
          if (value.length === 0) return "Please enter your Username!";
        },
      }),
    password: () =>
      text({
        message: "Please set your Password!",
        validate(value) {
          if (value.length === 0) return "Please enter your Password!";
          if (value.length < 4)
            return "Please make your password at least 4 characters long!";
        },
      }),
  });
  let user_key = crypto.randomBytes(32).toString("hex");
  UserSingleton.getInstance().createUser(
    create_user.username,
    create_user.password,
    "",
    user_key
  );
}

let user = checkUser();
if (!user) {
  createUser();
}

yargs(hideBin(process.argv))
  .command({
    command: "logout",
    describe: "Logout User",
    handler: async function () {
      const user = checkUser();
      const user_instance = UserSingleton.getInstance();
      if (user) {
        if (isAuthenticated(user)) {
          try {
            user_instance.logOutUser();
          } catch (e) {
            console.error("Error reading input: ", e.message);
          }
        } else {
          console.log("User not authenticated!");
        }
      } else {
        console.log("User doesn't exist!");
      }
    },
  })
  .command({
    command: "auth",
    describe: "Authenticate User",
    handler: async function () {
      const user = checkUser();
      const user_instance = UserSingleton.getInstance();
      if (user) {
        if (!isAuthenticated(user)) {
          try {
            let password = "";
            let try_again = true;
            while (try_again && !isAuthenticated(user)) {
              password = await text({
                message: "What is your password?",
                validate(value) {
                  if (value.length === 0) return "Please enter your Password!";
                },
              });
              if (user && user_instance.authenticateUser(password)) {
                user_instance.logInUser();
                try_again = false;
              } else {
                try_again = await confirm({
                  message: "Do you want to try again?",
                });
              }
            }
          } catch (e) {
            console.error("Error reading input: ", error.message);
          }
        } else {
          console.log("User is already authenticated");
        }
      } else {
        console.log("User doesn't exist!");
      }
    },
  })
  .command({
    command: "status",
    description: "Check the User status",
    handler: function () {
      const user = checkUser();
      if (user) {
        console.log(user);
      } else {
        console.log("User doenst exist!");
      }
    },
  })
  .command({
    command: "delete-user",
    description: "Delete the current User and all Passwords",
    handler: async function () {
      const user = checkUser();
      const user_instance = UserSingleton.getInstance();
      if (user) {
        try {
          const delete_user_check = await confirm({
            message: "Do you want to delete the currently active user?",
          });
          if (delete_user_check) {
            user_instance.delete();
          }
        } catch (e) {
          console.log("Error: ", e.message);
        }
      } else {
        console.log("User doesn't exist!");
      }
    },
  })
  .command({
    command: "add",
    describe: "Add a new password",
    handler: async function () {
      const user = checkUser();
      const user_instance = UserSingleton.getInstance();
      if (user) {
        if (isAuthenticated(user)) {
          try {
            const new_password = await group({
              website: () =>
                text({
                  message: "What is the website?",
                  validate(value) {
                    if (value.length === 0) return "Please enter your Website!";
                  },
                }),
              username: () =>
                text({
                  message: "What is your username?",
                  validate(value) {
                    if (value.length === 0)
                      return "Please enter your Username!";
                  },
                }),
              // check_generate: () =>
              //   confirm({ message: "Do you want to generate the Password?" }),
              password: () =>
                text({
                  message: "What is your password?",
                  validate(value) {
                    if (value.length === 0)
                      return "Please enter your Password!";
                    if (value.length < 4)
                      return "Please make your password at least 4 characters long!";
                  },
                }),
              starred: () =>
                confirm({ message: "Do you want to star this password?" }),
            });
            user_instance.addPassword(
              new_password.website,
              new_password.username,
              new_password.password,
              new_password.starred
            );
          } catch (error) {
            console.error("Error:", error.message);
          }
        } else {
          console.log("User is not authenticated!");
        }
      } else {
        console.log("User doesn't exist!");
      }
    },
  })
  .command({
    command: "generate",
    describe: "Generates a secure password",
    handler: async function () {
      const user = checkUser();
      const user_instance = UserSingleton.getInstance();
      if (user) {
        if (isAuthenticated(user)) {
          try {
            let password_length = await text({
              message: "How long should your new password be?",
              validate(value) {
                if (!isFinite(value)) return "Please input a number!";
                if (Number(value) > 32)
                  return "Your Passwords length must be smaller than 32 characters!";
              },
            });

            password_length = Number(password_length);
            let secure_password = generatePassword(password_length);

            // console.log(secure_password);

            const save_password_check = await select({
              message: "Do you want to save or copy this password?",
              options: [
                { value: "save", label: "Save" },
                { value: "copy", label: "Copy" },
              ],
            });

            if (save_password_check === "save") {
              const generated_password_group = await group({
                website: () =>
                  text({
                    message: "What is the website?",
                    validate(value) {
                      if (value.length === 0)
                        return "Please enter your Website!";
                    },
                  }),
                username: () =>
                  text({
                    message: "What is your username?",
                    validate(value) {
                      if (value.length === 0)
                        return "Please enter your Username!";
                    },
                  }),
                starred: () =>
                  confirm({ message: "Do you want to star this password?" }),
              });
              user_instance.addPassword(
                generated_password_group.website,
                generated_password_group.username,
                secure_password,
                generated_password_group.starred
              );
            } else {
              clipboardy.writeSync(secure_password);
            }
          } catch (e) {
            console.log("Error:", e.message);
          }
        } else {
          console.log("User is not authentiacted!");
        }
      } else {
        console.log("User doesn't exist!");
      }
    },
  })
  .command({
    command: "show-all",
    describe: "Show list of stored passwords for websites.",
    handler: async function () {
      const user = checkUser();
      if (user) {
        if (isAuthenticated(user)) {
          const user_instance = UserSingleton.getInstance();
          const password_objects = user_instance.getPasswords();
          let passwords = Object.values(password_objects);
          let websites = {};
          // console.log(passwords);
          let property_map = {
            username: 0,
            password: 1,
            starred: 2,
          };
          passwords.forEach((password) => {
            // console.log(typeof password.password);
            // websites.push(password.website);
            websites[password.website] = [
              password.username,
              password.password,
              password.starred,
            ];
          });
          const password = await select({
            message: "What password do you want to access?",
            options: getWebsiteOptions(Object.keys(websites)),
          });
          const password_options = await select({
            message: "Choose Password property to edit/copy.",
            options: [
              {
                value: "username",
                label: `Username: ${
                  websites[password][property_map["username"]]
                }`,
              },
              {
                value: "password",
                label: `Password: ${
                  websites[password][property_map["password"]]
                }`,
              },
              {
                value: "starred",
                label: `Starred: ${
                  websites[password][property_map["starred"]]
                }`,
              },
            ],
          });
          let action = "";
          let new_entry = "";
          if (password_options != "starred") {
            action = await select({
              message: "Choose what to do with this property.",
              options: [
                { value: "copy", label: "Copy Property" },
                { value: "edit", label: "Edit Property" },
              ],
            });
          } else {
            const star_password = await confirm({
              message: "Do you want to star this password?",
            });
            new_entry = star_password;
          }
          console.log(action);
          if (action === "copy") {
            clipboardy.writeSync(
              websites[password][property_map[password_options]]
            );
          } else if (action === "edit") {
            const generate_password = await confirm({
              message: "Do you want to generate a new password?",
            });
            if (generate_password) {
              let password_length = await text({
                message: "How long should your new password be?",
                validate(value) {
                  if (!isFinite(value)) return "Please input a number!";
                },
              });

              password_length = Number(password_length);
              new_entry = generatePassword(password_length);
            } else {
              new_entry = await text({
                message: `What should your new ${password_options} be?`,
                placeholder: websites[password][property_map[password_options]],
                validate(value) {
                  if (value.length === 0) return "Please input a value!";
                },
              });
            }
          }
          user_instance.editPasswords(
            password,
            password_options,
            new_entry,
            password_objects
          );
        } else {
          console.log("User not authenticated!");
        }
      } else {
        console.log("User doesn't exist!");
      }
    },
  })
  .parse();
