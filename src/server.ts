import express from "express";
import { connectDB } from "./database";
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

startServer();
