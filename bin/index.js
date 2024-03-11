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
  showSelectedPasswords,
} from "./functions/password_functions.js";
import {
  getWebsites,
  checkUserCancel,
  getStarredWebsites,
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
                if (Number(value) > 32 && Number(value) != 42)
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
          showSelectedPasswords(
            user,
            user_instance,
            password_objects,
            websites
          );
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
  .command({
    command: "starred",
    describe: "Show your starred Passwords.",
    handler: async function () {
      const user = checkUser();
      const user_instance = UserSingleton.getInstance();
      if (user) {
        if (isAuthenticated(user)) {
          const password_objects = user_instance.getPasswords();
          const websites = getStarredWebsites(password_objects);
          showSelectedPasswords(
            user,
            user_instance,
            password_objects,
            websites
          );
        } else {
          console.log(
            "User is not authenticated! Run 'pwm authenticate' to authenticate user!"
          );
        }
      } else {
        console.log("User is not authenticated!");
      }
    },
  })
  .parse();
