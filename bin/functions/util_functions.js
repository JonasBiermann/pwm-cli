import { isCancel, cancel } from "@clack/prompts";

export function checkUserCancel(message, value) {
  if (isCancel(value)) {
    cancel(`${message}`);
    process.exit(0);
  }
}

export function compareStrings(string1, pivot) {
  let range = Math.min(string1.length, pivot.length);
  for (let i = 0; i < range; i++) {
    if (string1.charCodeAt(i) < pivot.charCodeAt(i)) {
      return true;
    } else if (string1.charCodeAt(i) > pivot.charCodeAt(i)) {
      return false;
    }
  }
  return string1.length <= pivot.length;
}

export const quickSort = (arr) => {
  if (arr.length <= 1) {
    return arr;
  }

  let pivot = arr[0];
  let left_arr = [];
  let right_arr = [];

  for (let i = 1; i < arr.length; i++) {
    if (compareStrings(arr[i].website, pivot.website)) {
      left_arr.push(arr[i]);
    } else {
      right_arr.push(arr[i]);
    }
  }

  return [...quickSort(left_arr), pivot, ...quickSort(right_arr)];
};

export function getWebsites(password_objects) {
  let passwords = quickSort(Object.values(password_objects));
  let websites = {};
  // console.log(quickSort(passwords));
  passwords.forEach((password) => {
    websites[password.website] = [
      password.username,
      password.password,
      password.starred,
    ];
  });
  return websites;
}

export function getWebsiteOptions(websites) {
  let website_options = [];
  for (let i = 0; i < websites.length; i++) {
    let dict = {
      value: websites[i],
      label: websites[i],
    };
    website_options.push(dict);
  }
  return website_options;
}
