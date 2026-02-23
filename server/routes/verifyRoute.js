import express from "express";
import { verifyFreeAccess } from "../controller/verifyController.js";

const router = express.Router();

router.get("/verify-free-access", verifyFreeAccess);

export default router;