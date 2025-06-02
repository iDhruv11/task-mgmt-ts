import pool from "./database";

export async function createTask(
  title: string,
  description: string,
  userId: number,
  teamId: number | null
) {
  return pool.query(
    `
    INSERT INTO tasks(title, description, user_id, team_id)
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,
    [title, description, userId, teamId]
  );
}

export async function getTasks(userId: string) {
  return pool.query(
    `
    SELECT *
    FROM tasks
    WHERE user_id = $1
    `,
    [userId]
  );
}

export async function completeTask(id: string) {
  return pool.query(
    `
    UPDATE tasks
    SET status = 'done' updated_at = CURRENT_TIMESTAMP
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
  return pool.query(
    `
    UPDATE tasks
    SET title = $1,
    description = $2,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
    `,
    [title, description, id]
  );
}

export async function deleteTask(id: string) {
  return pool.query(
    `
    DELETE FROM tasks
    WHERE id = $1
    `,
    [id]
  );
}

export async function getTaskById(id: string) {
  return pool.query(
    `
    SELECT *
    FROM tasks
    WHERE id = $1
    `,
    [id]
  );
}

export async function getTaskOwner(
  taskId: string
) {
  return pool.query(
    `
    SELECT user_id
    FROM tasks
    WHERE id = $1
    `,
    [taskId]
  );
}

