import client from "./database";

export async function createTask(
  title: string,
  description: string,
  userId: number,
  teamId: number | null
) {
  return client.query(
    `
    INSERT INTO tasks(title, description, user_id, team_id)
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,
    [title, description, userId, teamId]
  );
}

export async function getTasks(userId: string) {
  return client.query(
    `
    SELECT *
    FROM tasks
    WHERE user_id = $1
    `,
    [userId]
  );
}

export async function completeTask(id: string) {
  return client.query(
    `
    UPDATE tasks
    SET completed = true
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );
}

export async function updateTask(
  id: string,
  title: string,
  description: string
) {
  return client.query(
    `
    UPDATE tasks
    SET title = $1,
        description = $2
    WHERE id = $3
    RETURNING *
    `,
    [title, description, id]
  );
}

export async function deleteTask(id: string) {
  return client.query(
    `
    DELETE FROM tasks
    WHERE id = $1
    `,
    [id]
  );
}

export async function getTaskById(id: string) {
  return client.query(
    `
    SELECT *
    FROM tasks
    WHERE id = $1
    `,
    [id]
  );
}
