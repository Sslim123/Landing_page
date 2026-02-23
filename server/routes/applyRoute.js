import express from "express";
import { body } from "express-validator";
import { FreeCourse } from "../controller/applyController.js";
import { applyLimiter } from "../middleware/security.middleware.js";
const router = express.Router();

router.post(
  "/apply-free-course",applyLimiter, FreeCourse,
  body("email").isEmail(),
  body("name").isLength({ min: 2 }),

  
);

export default router;