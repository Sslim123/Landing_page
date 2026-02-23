import { validationResult } from "express-validator";
import { createOrUpdateUser } from "../services/user.services.js";
import { generateAccessToken } from "../services/token.services.js";
import { sendApplicationEmail } from "../services/mail.services.js";

export const FreeCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email } = req.body;

    const user = await createOrUpdateUser(name, email);
    const token = await generateAccessToken(email);

    res.json({ success: true });

    // Non-blocking email
    sendApplicationEmail(email,name, token)
      .catch(err => console.error("Email failed:", err));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};