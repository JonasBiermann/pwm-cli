import UserSingleton from "../GlobalUser.js";
import crypto from "crypto";
import { text, confirm, group } from "@clack/prompts";
import { checkUserCancel } from "./util_functions.js";

// Function to check if user is authenticated
export function isAuthenticated(user) {
  return user.getSession();
}

export function checkUser() {
  const user = UserSingleton.getInstance().getUser();
  if (user) {
    return user;
  }
  return null;
}

export function main() {
  let user = checkUser();
  if (!user) {
    createUser();
  }
}

export async function checkUserAuthAttempt(user, user_instance) {
  let password = "";
  let try_again = true;
  while (try_again && !isAuthenticated(user)) {
    password = await text({
      message: "What is your password?",
      validate(value) {
        if (value.length === 0) return "Please enter your Password!";
      },
    });
    checkUserCancel("User Authentication cancelled.", password);
    if (user && user_instance.authenticateUser(password)) {
      user_instance.logInUser();
      try_again = false;
    } else {
      try_again = await confirm({
        message: "Do you want to try again?",
      });
      checkUserCancel("User Authentication cancelled.", try_again);
    }
  }
}

export async function createUser() {
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
  checkUserCancel("User creation cancelled.", create_user);
  let user_key = crypto.randomBytes(32).toString("hex");
  UserSingleton.getInstance().createUser(
    create_user.username,
    create_user.password,
    user_key
  );
}
