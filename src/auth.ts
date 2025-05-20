import client from "./database";

export async function createUser(
  username: string,
  email: string,
  password: string
) {
  return client.query(
    `
    INSERT INTO users(username,email,password)
    VALUES($1,$2,$3)
    RETURNING *
    `,
    [username, email, password]
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
