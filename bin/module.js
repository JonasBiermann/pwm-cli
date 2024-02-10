import crypto from "crypto";
import fs from "fs";

import { Storage } from "./classes/StorageClass.js";

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
