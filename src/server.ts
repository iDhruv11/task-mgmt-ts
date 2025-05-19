import express from "express";
import { connectDB } from "./database";
import client from "./database";

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

    await client.query(
      `
      INSERT INTO users(username,email,password)
      VALUES($1,$2,$3)
      `,
      [username, email, password]
    );

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
    const result = await client.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    res.json({
      success: true,
      user
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

app.post("/tasks", async (req, res) => {
  const { title, description, userId } = req.body;

  if (!title || !userId) {
    return res.status(400).json({
      success: false,
      message: "Title and userId required"
    });
  }

  try {
    const result = await client.query(
      `
      INSERT INTO tasks(title, description, user_id)
      VALUES($1,$2,$3)
      RETURNING *
      `,
      [title, description, userId]
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

app.get("/tasks/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await client.query(
      `
      SELECT *
      FROM tasks
      WHERE user_id = $1
      `,
      [userId]
    );

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

app.put("/tasks/:id/complete", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await client.query(
      `
      UPDATE tasks
      SET completed = true
      WHERE id = $1
      RETURNING *
      `,
      [id]
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

app.delete("/tasks/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await client.query(
      `
      DELETE FROM tasks
      WHERE id = $1
      `,
      [id]
    );

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


startServer();
