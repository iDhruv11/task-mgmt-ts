import { Client } from "pg";

const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "task_mgmt"
});

export async function connectDB() {
  try {
    await client.connect();
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed");
    console.error(error);
  }
}

export default client;
