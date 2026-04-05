import bcrypt from "bcrypt";

const password = "placeholder";

const hashedPassword = await bcrypt.hash(password, 10);

console.log(hashedPassword);
