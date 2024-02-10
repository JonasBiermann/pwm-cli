export class Password {
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

export function create_password(website, username, password, starred) {
  let entry = new Password(website, username, password, starred);
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
