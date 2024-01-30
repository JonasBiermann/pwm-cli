import crypto from "crypto";
import fs from "fs";

class Password {
  constructor(website, username, password, starred) {
    this.webiste = website;
    this.username = username;
    this.password = password;
    this.starred = starred;
  }

  getPassword() {
    return this.password;
  }

  editUsername(new_username) {
    if (new_username != this.username) {
      this.username = new_username;
    } else {
      throw new Error("Choose a different Username or E-Mail!");
    }
  }

  editPassword(new_password) {
    if (new_password != this.password) {
      this.password = new_password;
    } else {
      throw new Error("Password needs to be different!");
    }
  }

  starPassword() {
    this.starred = !this.starPassword;
  }

  checkIsStarred() {
    return this.starred;
  }
}

class User {
  constructor(username, password, face_data, session, user_key) {
    this.username = username;
    this.password = password;
    this.face_data = face_data;
    this.session = session;
    this.user_key = user_key;
  }

  authenticateUser(entered_password) {
    if (this.checkPassword(entered_password) && this.checkFaceData()) {
      console.log("User was succesfully authenticated");
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
}

export class Storage {
  constructor(file_path, encryption_key) {
    this.file_path = file_path;
    this.encryption_key = Buffer.from(encryption_key, "hex");
  }

  // generateRandomIV method returns a random initialization vector of length a length of 16 bytes
  // 16 bytes (128 bits) because we're using "aes-256-cbc" which requires 16 bytes IV
  // later slicing with 32 bytes because the encryption is done in hex which is 4 bits so twice the length therefore 32
  generateRandomIV() {
    return crypto.randomBytes(16);
  }

  // encrypt method takes a data argument an returns an encrypted version of the data
  // encrypted with "aes-256-cbc", user-own encryption key and iv
  // encryption done by conversion from utf-8 to hex + prepending of iv
  encrypt(data) {
    const iv = this.generateRandomIV();
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      this.encryption_key,
      iv
    );

    let encrypted_data = cipher.update(JSON.stringify(data), "utf-8", "hex");
    encrypted_data += cipher.final("hex");
    const encrypted_with_iv = iv.toString("hex") + encrypted_data;

    return encrypted_with_iv;
  }

  // decrypt method takes data argument and returns a JSON parse of the data
  // decipher from hex to utf-8
  decrypt(data) {
    try {
      const iv = Buffer.from(data.slice(0, 32), "hex");
      const encrypted_data = data.slice(32);

      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        this.encryption_key,
        iv
      );

      let decrypted_data = decipher.update(encrypted_data, "hex", "utf-8");
      decrypted_data += decipher.final("utf-8");

      return JSON.parse(decrypted_data);
    } catch (e) {
      console.error("Error reading or decrypting data: ", e.message);
    }
  }

  // savePassword method takes password_object (created by user in CLI) as argument and adds password to password list by getting -> decrypting -> appending -> encrypting and writing passwords
  savePassword(password_object) {
    let passwords = this.getPasswords();
    if (passwords == null) {
      passwords = [];
    }
    passwords.push(password_object);

    const encrypted_data = this.encrypt(passwords);

    fs.writeFileSync(this.file_path, encrypted_data, "utf-8");
  }

  // getPasswords method returns all saved passwords in a decrypted way
  getPasswords() {
    let passwords = [];
    try {
      let data = fs.readFileSync(this.file_path, "utf-8");
      if (data.toString() != "") {
        passwords = this.decrypt(data);
      }
    } catch (e) {
      console.error("File doesn't exist or couldn't be decrypted: ", e.message);
    }
    return passwords;
  }
}

// Example usage:
const randomKey = crypto.randomBytes(32).toString("hex"); // key probably gonna be an attribute of the user
const secureStorage = new Storage("encryptedData.json", randomKey);

// Encrypt data
const dataToEncrypt = {
  website: "example.com",
  username: "john_doe",
  password: "securePassword",
  starred: false,
};
const dataToEncrypt2 = {
  website: "github.com",
  username: "john_doe",
  password: "1234",
  starred: false,
};
const dataToEncrypt3 = {
  website: "spotify.com",
  username: "john_doe",
  password: "afsdf",
  starred: true,
};

secureStorage.savePassword(dataToEncrypt);
secureStorage.savePassword(dataToEncrypt2);
secureStorage.savePassword(dataToEncrypt3);
console.log(secureStorage.getPasswords());

export function create_password(website, username, password, starred) {
  let entry = new Password(website, username, password, starred);
  return entry;
}

export function create_user(username, password, face_data, user_key) {
  let entry = new User(username, password, face_data, true, user_key);
  return entry;
}

export function generate_password(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:',.<>/?.,";
  let password = "";
  for (let i = 0; i < length; i++) {
    const random_index = Math.floor(Math.random() * charset.length);
    password += charset.charAt(random_index);
  }
  return password;
}
