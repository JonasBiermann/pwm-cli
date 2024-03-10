import Storage from "./StorageClass.js";

export class User {
  constructor(username, password, session, user_key) {
    this.username = username;
    this.password = password;
    this.session = session;
    this.storage = new Storage("passwordData.json", user_key);
  }

  authenticateUser(entered_password) {
    if (entered_password === this.password) {
      console.log("User was succesfully authenticated");
      this.session = true;
      return true;
    } else {
      return false;
    }
  }

  getSession() {
    return this.session;
  }

  getUserKey() {
    return this.user_key;
  }
}
