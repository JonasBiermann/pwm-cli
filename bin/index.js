#! /usr/bin/env node

import UserSingleton from "./GlobalUser.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generatePassword } from "./classes/PasswordClass.js";
import {
  intro,
  text,
  select,
  confirm,
  group,
  cancel,
  isCancel,
} from "@clack/prompts";
import clipboardy from "clipboardy";
import chalk from "chalk";

import {
  isAuthenticated,
  checkUser,
  main,
  checkUserAuthAttempt,
} from "./functions/user_functions.js";
import {
  addNewPassword,
  showPasswords,
} from "./functions/password_functions.js";
import {
  getWebsites,
  getWebsiteOptions,
  checkUserCancel,
} from "./functions/util_functions.js";

intro(
  `${chalk.hex("#171717")(
    chalk.hex("#1998c2").bold("Password Manager CLI by Jonas Biermann")
  )}`
);

main();

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
            checkUserAuthAttempt(user, user_instance);
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
          checkUserCancel("User Deletion cancelled.", delete_user_check);
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
            addNewPassword(user_instance);
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
            checkUserCancel("Password Generation cancelled.", password_length);

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
            checkUserCancel("Operation cancelled.", save_password_check);

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
              if (
                isCancel(generated_password_group.website) ||
                isCancel(generated_password_group.username) ||
                isCancel(generated_password_group.starred)
              ) {
                cancel("Operation cancelled");
                process.exit(0);
              }
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
      const user_instance = UserSingleton.getInstance();
      if (user) {
        if (isAuthenticated(user)) {
          const password_objects = user_instance.getPasswords();
          let websites = getWebsites(password_objects);
          let property_map = {
            username: 0,
            password: 1,
            starred: 2,
          };
          if (Object.keys(websites).length != 0) {
            const password = await select({
              message: "What password do you want to access?",
              options: getWebsiteOptions(Object.keys(websites)),
            });
            checkUserCancel("Operation cancelled.", password);
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
            checkUserCancel("Operation cancelled.", password_options);
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
              checkUserCancel("Operation cancelled.", action);
            } else {
              const star_password = await confirm({
                message: "Do you want to star this password?",
              });
              new_entry = star_password;
            }
            if (action === "copy") {
              clipboardy.writeSync(
                websites[password][property_map[password_options]]
              );
            } else if (action === "edit") {
              if (password_options === "password") {
                const generate_password = await confirm({
                  message: "Do you want to generate a new password?",
                });
                checkUserCancel("Operation cancelled.", generate_password);
                if (generate_password) {
                  let password_length = await text({
                    message: "How long should your new password be?",
                    validate(value) {
                      if (!isFinite(value)) return "Please input a number!";
                    },
                  });
                  checkUserCancel("Operation cancelled.", password_length);

                  password_length = Number(password_length);
                  new_entry = generatePassword(password_length);
                } else {
                  new_entry = await text({
                    message: `What should your new ${password_options} be?`,
                    placeholder:
                      websites[password][property_map[password_options]],
                    validate(value) {
                      if (value.length === 0) return "Please input a value!";
                    },
                  });
                }
              } else {
                new_entry = await text({
                  message: `What should your new ${password_options} be?`,
                  placeholder:
                    websites[password][property_map[password_options]],
                  validate(value) {
                    if (value.length === 0) return "Please input a value!";
                  },
                });
                checkUserCancel("Operation canelled.", new_entry);
              }
              user_instance.editPasswords(
                password,
                password_options,
                new_entry,
                password_objects
              );
            }
          } else {
            console.log(
              chalk
                .hex("#dfe311")
                .bold("\n   You haven't added any passwords yet!\n")
            );
            console.log(
              chalk
                .hex("#0a6625")
                .bold('   You can add Passwords with the "pwm add" command!')
            );
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
    command: "search",
    describe:
      "Search for a specific password in your Password Manager by website",
    handler: async function () {
      const user = checkUser();
      const user_instance = UserSingleton.getInstance();
      if (user) {
        if (isAuthenticated(user)) {
          const password_objects = user_instance.getPasswords();
          const websites = getWebsites(password_objects);
          const keys = Object.keys(websites);
          const website = await text({
            message: "What website are you searching for?",
            validate(value) {
              if (value.length === 0) return "Please input your website name!";
              if (!keys.includes(value))
                return "Password for Website doesn't exist!";
            },
          });
          checkUserCancel("Website search was cancelled.", website);
          showPasswords(websites, website, password_objects, user_instance);
        } else {
          console.log("User is not authenticated!");
        }
      } else {
        console.log("User doesn't exist!");
      }
    },
  })
  .parse();
