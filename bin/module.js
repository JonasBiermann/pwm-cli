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
  constructor(username, password, face_data, is_logged_in) {
    this.username = username;
    this.password = password;
    this.face_data = face_data;
    this.is_logged_in = is_logged_in;
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
      throw new Error("Entered password doesn't match user password");
    }
  }

  checkFaceData() {
    // run python script for face recognition with this.face_data
    return true;
  }
}

export function create_password(website, username, password, starred) {
  let entry = new Password(website, username, password, starred);
  return entry;
}

export function create_user(username, password, face_data) {
  let entry = new User(username, password, face_data, true);
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
