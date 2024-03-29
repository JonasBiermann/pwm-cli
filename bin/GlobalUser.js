import { User } from "./classes/UserClass.js";
import { createPassword } from "./classes/PasswordClass.js";

import fs from "fs";

const USER_FILE_PATH = "user.json";

class UserSingleton {
  constructor() {
    this.user = null;
  }

  static getInstance() {
    if (!UserSingleton.instance) {
      UserSingleton.instance = new UserSingleton();
    }
    return UserSingleton.instance;
  }

  createUser(username, password, user_key) {
    this.user = new User(username, password, true, user_key);
    this.writeUserDataToFile();
    fs.writeFileSync("passwordData.json", "", "utf-8");
  }

  getUser() {
    if (!this.user) {
      this.user = this.readUserDataFromFile();
    }
    return this.user;
  }

  writeUserDataToFile() {
    try {
      fs.writeFileSync(USER_FILE_PATH, JSON.stringify(this.user), "utf-8");
    } catch (error) {
      console.error("Error writing user data to file:", error.message);
    }
  }

  readUserDataFromFile() {
    try {
      const user_data = fs.readFileSync(USER_FILE_PATH, "utf-8");
      const user_data_object = JSON.parse(user_data);
      if (user_data_object) {
        return new User(
          user_data_object.username,
          user_data_object.password,
          user_data_object.session,
          user_data_object.storage.encryption_key
        );
      }
    } catch (error) {
      console.error("Error reading user data from file:", error.message);
      return null;
    }
  }

  getSession() {
    if (!this.user) {
      this.user = this.readUserDataFromFile();
    }
    return this.user.session;
  }

  logOutUser() {
    this.user.session = false;
    this.writeUserDataToFile();
  }

  authenticateUser(password) {
    return this.user.authenticateUser(password);
  }

  logInUser() {
    this.user.session = true;
    this.writeUserDataToFile();
  }

  delete() {
    this.user = null;
    this.writeUserDataToFile();
    fs.unlinkSync("passwordData.json");
  }

  addPassword(website, username, password, starred) {
    try {
      const new_password = createPassword(website, username, password, starred);
      this.user.storage.savePasswordToStorage(new_password);
    } catch (e) {
      console.error("Password couldn't be saved: ", e.message);
    }
  }

  getPasswords() {
    try {
      return this.user.storage.getPasswordsFromStorage();
    } catch (e) {
      console.error("Couldn't get Passwords from Storage: ", e.message);
    }
  }

  editPasswords(website, property, new_value, passwords) {
    try {
      return this.user.storage.editPasswordsInStorage(
        website,
        property,
        new_value,
        passwords
      );
    } catch (e) {
      console.error("Couldn't edit Passwords in Storage: ", e.message);
    }
  }
}

export default UserSingleton;
