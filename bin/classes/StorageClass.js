import crypto from "crypto";
import fs from "fs";
import { createPassword } from "./PasswordClass.js";

class Storage {
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
  savePasswordToStorage(password_object) {
    let passwords = this.getPasswordsFromStorage();
    if (passwords == null) {
      passwords = [];
    }
    passwords.push(password_object);

    const encrypted_data = this.encrypt(passwords);

    fs.writeFileSync(this.file_path, encrypted_data, "utf-8");
  }

  // getPasswords method returns all saved passwords in a decrypted way
  getPasswordsFromStorage() {
    let passwords = [];
    try {
      let data = fs.readFileSync(this.file_path, "utf-8");
      if (!JSON.parse(data) === "") {
        passwords = this.decrypt(data);
      }
    } catch (e) {
      console.error("File doesn't exist or couldn't be decrypted: ", e.message);
    }
    return passwords;
  }

  editPasswordsInStorage(website, property, new_value, passwords) {
    // console.log(passwords);
    fs.writeFileSync(this.file_path, "", "utf-8");
    passwords.forEach((password) => {
      if (password.website === website) {
        if (property === "username") {
          password.username = new_value;
        } else if (property === "password") {
          password.password = new_value;
        } else {
          password.starred = new_value;
        }
      }
      let new_password = createPassword(
        password.website,
        password.username,
        password.password,
        password.starred
      );
      this.savePasswordToStorage(new_password);
    });
  }
}

export default Storage;
