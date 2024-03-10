import clipboardy from "clipboardy";
import chalk from "chalk";

import { generatePassword } from "../classes/PasswordClass.js";
import { text, select, confirm, group, isCancel, cancel } from "@clack/prompts";
import { checkUserCancel } from "./util_functions.js";

export async function addNewPassword(user_instance) {
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
          if (value.length === 0) return "Please enter your Username!";
        },
      }),
    password: () =>
      text({
        message: "What is your password?",
        validate(value) {
          if (value.length === 0) return "Please enter your Password!";
          if (value.length < 4)
            return "Please make your password at least 4 characters long!";
        },
      }),
    starred: () => confirm({ message: "Do you want to star this password?" }),
  });
  if (
    (isCancel(new_password.website) || isCancel(new_password.username),
    isCancel(new_password.password),
    isCancel(new_password.starred))
  ) {
    cancel("Password was not added!");
    process.exit(0);
  }
  user_instance.addPassword(
    new_password.website,
    new_password.username,
    new_password.password,
    new_password.starred
  );
}

export async function showPasswords(
  websites,
  website,
  password_objects,
  user_instance
) {
  let property_map = {
    username: 0,
    password: 1,
    starred: 2,
  };
  const password = website;
  const password_options = await select({
    message: "Choose Password property to edit/copy.",
    options: [
      {
        value: "username",
        label: `Username: ${websites[password][property_map["username"]]}`,
      },
      {
        value: "password",
        label: `Password: ${websites[password][property_map["password"]]}`,
      },
      {
        value: "starred",
        label: `Starred: ${websites[password][property_map["starred"]]}`,
      },
    ],
  });
  checkUserCancel("Operation cancelled.", password_options);
  if (Object.keys([websites]).length != 0) {
    editPassword(
      property_map,
      password_options,
      websites,
      password,
      password_objects,
      user_instance
    );
  } else {
    console.log(
      chalk.hex("#dfe311").bold("\n   You haven't added any passwords yet!\n")
    );
    console.log(
      chalk
        .hex("#0a6625")
        .bold('   You can add Passwords with the "pwm add" command!')
    );
  }
}

export async function editPassword(
  property_map,
  password_options,
  websites,
  password,
  password_objects,
  user_instance
) {
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
    checkUserCancel("Operation cancelled.", action);
    new_entry = star_password;
  }

  if (action === "copy") {
    clipboardy.writeSync(websites[password][property_map[password_options]]);
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
        checkUserCancel("Password generation cancelled..", password_length);

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
        checkUserCancel("Operation cancelled.", new_entry);
      }
    } else {
      new_entry = await text({
        message: `What should your new ${password_options} be?`,
        placeholder: websites[password][property_map[password_options]],
        validate(value) {
          if (value.length === 0) return "Please input a value!";
        },
      });
      checkUserCancel("Operation cancelled.", new_entry);
    }

    user_instance.editPasswords(
      password,
      password_options,
      new_entry,
      password_objects
    );
  }
}
