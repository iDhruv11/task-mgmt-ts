import express from "express";
import { connectDB } from "./database";
import client from "./database";

const app = express();

app.get("/", (req, res) => {
  res.send("Task Manager API Running");
});

const PORT = 3000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

app.get("/test-db", async (req, res) => {
  try {
    const result = await client.query("SELECT NOW()");

    res.json({
      success: true,
      time: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

startServer();
