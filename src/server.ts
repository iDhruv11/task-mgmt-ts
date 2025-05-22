import express from "express";
import { connectDB } from "./database";
import client from "./database";
import { createUser, getUserByEmail } from "./auth";
import bcrypt from "bcrypt";
import { generateToken } from "./auth";
import { authMiddleware } from "./middleware";
import {
  createTask,
  getTasks,
  completeTask,
  updateTask,
  deleteTask
} from "./tasks";

const app = express();
app.use(express.json());

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

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields required"
    });
  }

  try {
    const existingUser = await client.query(
      `SELECT *
        FROM users
        WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    await createUser(username, email, password);

    res.json({
      success: true,
      message: "User created"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields required"
    });
  }

  try {
    const result = await getUserByEmail(email);

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email
    });

    res.json({
      success: true,
      token
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

app.get("/profile/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await client.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

app.post("/tasks", authMiddleware, async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Title and userId required"
    });
  }

  const userId = (req as any).user.id;
  try {
    const result = await createTask(
      title,
      description,
      userId
    );

    res.json({
      success: true,
      task: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

app.get("/tasks/:userId", authMiddleware, async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await getTasks(userId);

    res.json({
      success: true,
      tasks: result.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

app.put("/tasks/:id/complete", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    const result = await completeTask(id);

    res.json({
      success: true,
      task: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

app.delete("/tasks/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    const result = await deleteTask(id);

    res.json({
      success: true,
      message: "Task deleted"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

app.put("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;

  try {
    const result = await updateTask(id, title, description);

    res.json({
      success: true,
      task: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

startServer();
