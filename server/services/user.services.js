import pool from "../config/db.js";

export const createOrUpdateUser = async (name, email) => {
  const result = await pool.query(
    `INSERT INTO users (name, email)
     VALUES ($1, $2)
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name, email]
  );

  return result.rows[0];
};