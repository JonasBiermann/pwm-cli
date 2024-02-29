import Storage from "./StorageClass.js";

export class User {
  constructor(username, password, face_data, session, user_key) {
    this.username = username;
    this.password = password;
    this.face_data = face_data;
    this.session = session;
    this.storage = new Storage("passwordData.json", user_key);
  }

  authenticateUser(entered_password) {
    if (this.checkPassword(entered_password) && this.checkFaceData()) {
      console.log("User was succesfully authenticated");
      this.session = true;
      return true;
    } else {
      throw new Error("Couldn't authenticate user!");
    }
  }

  checkPassword(entered_password) {
    if (entered_password === this.password) {
      return true;
    } else {
      console.log("Entered Password doesn't match user password!");
      return false;
      // throw new Error("Entered password doesn't match user password");
    }
  }

  checkFaceData() {
    // run python script for face recognition with this.face_data
    return true;
  }

  logOutUser() {
    this.session = false;
    return true;
  }

  getSession() {
    return this.session;
  }

  getUserKey() {
    return this.user_key;
  }
}
