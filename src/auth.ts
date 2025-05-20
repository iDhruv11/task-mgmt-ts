import client from "./database";
import bcrypt from "bcrypt";

export async function createUser(
  username: string,
  email: string,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return client.query(
    `
    INSERT INTO users(username,email,password)
    VALUES($1,$2,$3)
    RETURNING *
    `,
    [username, email, hashedPassword]
  );
}

export async function getUserByEmail(email: string) {
  return client.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    `,
    [email]
  );
}
