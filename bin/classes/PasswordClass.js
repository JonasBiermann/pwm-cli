export class Password {
  constructor(website, username, password, starred) {
    this.website = website;
    this.username = username;
    this.password = password;
    this.starred = starred;
  }
}

export function createPassword(website, username, password, starred) {
  let entry = new Password(website, username, password, starred);
  return entry;
}

export function generatePassword(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:',.<>/?.,";
  let password = "";
  for (let i = 0; i < length; i++) {
    const random_index = Math.floor(Math.random() * charset.length);
    password += charset.charAt(random_index);
  }
  return password;
}
