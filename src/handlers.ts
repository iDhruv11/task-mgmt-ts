import { Express } from "express";
import client from "./database";
import { authMiddleware } from "./middleware";
import { isTeamMember } from "./teams";

export function registerTeamRoutes(
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
}
