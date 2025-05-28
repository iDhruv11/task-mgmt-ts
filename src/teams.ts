import client from "./database";

export async function getTeamById(id: string) {
  return client.query(
    `
    SELECT *
    FROM teams
    WHERE id = $1
    `,
    [id]
  );
}

export async function getTeamMembers(id: string) {
  return client.query(
    `
    SELECT users.id,
           users.username,
           users.email
    FROM team_members
    JOIN users
    ON users.id = team_members.user_id
    WHERE team_members.team_id = $1
    `,
    [id]
  );
}

export async function isTeamMember(
  teamId: string,
  userId: number
) {
  return client.query(
    `
    SELECT *
    FROM team_members
    WHERE team_id = $1
    AND user_id = $2
    `,
    [teamId, userId]
  );
}

export async function isTeamOwner(
  teamId: string,
  userId: number
) {
  return client.query(
    `
    SELECT *
    FROM teams
    WHERE id = $1
    AND owner_id = $2
    `,
    [teamId, userId]
  );
}

export async function getTeamTasks(
  teamId: string
) {
  return client.query(
    `
    SELECT *
    FROM tasks
    WHERE team_id = $1
    `,
    [teamId]
  );
}
