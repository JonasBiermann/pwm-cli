import { User } from "./classes/UserClass.js";

// export const GlobalUser = (() => {
//   let user_instance = null;

//   function createUser(username, password, face_data, user_key) {
//     if (!user_instance) {
//       console.log("test");
//       user_instance = new User(username, password, face_data, user_key);
//     }
//     return user_instance;
//   }

//   function getUser() {
//     console.log("test", user_instance);
//     return user_instance;
//   }

//   return { createUser, getUser };
// })();

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

  createUser(username, password, face_data, user_key) {
    this.user = new User(username, password, face_data, user_key);
    this.writeUserDataToFile();
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
      const userData = fs.readFileSync(USER_FILE_PATH, "utf-8");
      const userDataObject = JSON.parse(userData);
      if (userDataObject) {
        return new User(
          userDataObject.username,
          userDataObject.password,
          userDataObject.face_data,
          userDataObject.user_key
        );
      return null; 
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

  delete() {
    this.user = null;
    this.writeUserDataToFile();
  }
}

export default UserSingleton;
