import * as helpers from "./src/helpers/index.js";

let password = "admin123";
const encryptedPassword = helpers.hashPassword(password);
console.log(encryptedPassword);
