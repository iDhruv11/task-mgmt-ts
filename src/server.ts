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
  deleteTask,
  getTaskById,
  getUserById
} from "./tasks";
import { getTeamMembers, getTeamTasks, isTeamMember } from "./teams";
import { isTeamOwner, isTeamMember, getTeamMembers } from "./teams";
import { registerRoutes } from "./handlers";

const app = express();
app.use(express.json());
registerRoutes(app);

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



app.post(
  "/teams/:id/members",
  authMiddleware,
  async (req, res) => {
    const teamId = req.params.id;
    const { userId } = req.body;

    const ownerCheck = await isTeamOwner(
      teamId,
      (req as any).user.id
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({
        success: false
      });
    }

    const existingMember = await client.query(
      `
       SELECT *
       FROM team_members
       WHERE team_id = $1
       AND user_id = $2
      `,
      [teamId, userId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already in team"
      });
    }
    await client.query(
      `
      INSERT INTO team_members(team_id,user_id)
      VALUES($1,$2)
      `,
      [teamId, userId]
    );

    res.json({
      success: true
    });
  }
);


startServer();
