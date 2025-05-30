import { Express } from "express";
import client from "./database";
import { authMiddleware } from "./middleware";
import { isTeamMember } from "./teams";

export function registerRoutes(
  app: Express
) {

  app.post("/teams", authMiddleware, async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false
      });
    }

    try {
      const result = await client.query(
        `
      INSERT INTO teams(name, owner_id)
      VALUES($1,$2)
      RETURNING *
      `,
        [name, (req as any).user.id]
      );

      res.json({
        success: true,
        team: result.rows[0]
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false
      });
    }
  });

  app.post("/teams/:id/join", authMiddleware, async (req, res) => {
    const teamId = req.params.id;

    try {
      const existingMember = await client.query(
        `
  SELECT *
  FROM team_members
  WHERE team_id = $1
  AND user_id = $2
  `,
        [teamId, (req as any).user.id]
      );

      if (existingMember.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Already joined"
        });
      }
      if (existingMember.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Already joined"
        });
      }
      await client.query(
        `
      INSERT INTO team_members(team_id, user_id)
      VALUES($1,$2)
      `,
        [teamId, (req as any).user.id]
      );

      res.json({
        success: true
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false
      });
    }
  });


  app.get("/teams/:id/members", authMiddleware, async (req, res) => {
    const teamId = req.params.id;

    try {
      const membership = await isTeamMember(
        teamId,
        (req as any).user.id
      );

      if (membership.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }
      const result = await getTeamMembers(teamId);

      res.json({
        success: true,
        members: result.rows
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false
      });
    }
  });

  app.post("/tasks", authMiddleware, async (req, res) => {
    const { title, description, teamId } = req.body;

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
        userId,
        teamId
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
    const currentUserId = String((req as any).user.id);

    if (currentUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

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


  app.get("/task/:id", authMiddleware, async (req, res) => {
    const id = req.params.id;

    try {
      const result = await getTaskById(id);

      const task = res.json(task);
      if (!task) {
        return res.status(404).json({
          success: false
        });
      }
      if (task.user_id !== (req as any).user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

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

  app.get(
    "/teams/:id/tasks",
    authMiddleware,
    async (req, res) => {
      const teamId = req.params.id;
      const membership = await isTeamMember(
        teamId,
        (req as any).user.id
      );
      if (membership.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      const result = await getTeamTasks(teamId);

      res.json({
        success: true,
        tasks: result.rows
      });
    }
  );

  app.get("/profile/:id", async (req, res) => {
    const id = req.params.id;

    try {
      const result = await getUserById(id);

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

}
