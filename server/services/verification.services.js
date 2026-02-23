import crypto from "crypto";
import pool from "../config/db.js";

export const verifyFreeAccessToken = async (token) => {
  const hash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const { rows } = await pool.query(
    `
    SELECT id, name 
    FROM users
    WHERE access_token_hash = $1
    AND access_token_expires_at > NOW()
    `,
    [hash]
  );

  const user = rows[0];
  if (!user) return null;

  await pool.query(
    `
    UPDATE users
    SET free_access_enabled = TRUE,
        access_token_hash = NULL,
        access_token_expires_at = NULL
    WHERE id = $1
    `,
    [user.id]
  );

  return user;
};