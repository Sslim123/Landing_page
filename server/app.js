import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import applyRoutes from "./routes/applyRoute.js";
import { securityMiddleware } from "./middleware/security.middleware.js";
import verifyRoutes from "./routes/verifyRoute.js";
const app = express();

app.use(cors({
    origin: ["http://localhost:5173",
        "https://nyala-academy-live.onrender.com"], // YOUR NEW RENDER URL],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());
app.use(securityMiddleware);
app.use("/api", verifyRoutes);
app.use("/api", applyRoutes);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../client/dist")));
app.use(express.static(path.join(__dirname, "../client/public")));
console.log("Security middleware loaded");
app.get("/{*any}", (req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(404).json({ error: "API endpoint not found" });
    }

    res.sendFile(
        path.join(__dirname, "../client/dist", "index.html")
    );
});
export default app;