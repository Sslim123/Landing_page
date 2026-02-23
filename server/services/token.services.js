import crypto from "crypto";
import pool from "../config/db.js";

export const generateAccessToken = async (email) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await pool.query(
    `UPDATE users
     SET access_token_hash=$1,
         access_token_expires_at=$2
     WHERE email=$3`,
    [tokenHash, expiresAt, email]
  );

  return rawToken;
};