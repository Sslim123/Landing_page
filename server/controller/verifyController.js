import { verifyFreeAccessToken } from "../services/verification.services.js";

export const verifyFreeAccess = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        access: false,
        message: "No token provided"
      });
    }

    const user = await verifyFreeAccessToken(token);

    if (!user) {
      return res.status(403).json({
        access: false,
        message: "Invalid or expired token."
      });
    }

    return res.json({
      access: true,
      user: user.name
    });

  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
};