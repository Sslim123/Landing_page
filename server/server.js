import dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "pg";
import crypto from "crypto";
import cron from "node-cron";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import cors from "cors";
import { body, validationResult } from "express-validator";
import { fileURLToPath } from "url";
import path from "path";
const { Pool } = pkg;
const app = express();
const PORT = process.env.SERVER_PORT || 4000;
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});
dotenv.config({ path: path.join(__dirname, "../.env") });
app.use("/apply", limiter);
app.use("/verify", limiter);

// const connectionString = process.env.DATABASE_URL;

// if (!connectionString) {
//   console.error("❌ CRITICAL ERROR: DATABASE_URL is not defined in Environment Variables!");
// }

// const pool = new Pool({
//   connectionString: connectionString,
//   ssl: connectionString && connectionString.includes("localhost")
//     ? false
//     : { rejectUnauthorized: false }
// });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Use port 6543 in your DATABASE_URL for pooling!
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false }
});
/* ===================== CONFIG ===================== */
app.use(cors({
  origin: ["http://localhost:5173",
    "https://nyala-academy-live.onrender.com"], // YOUR NEW RENDER URL],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  })
);
app.use(express.static(path.join(__dirname, "../client/dist")));
app.use(express.static(path.join(__dirname, "../client/public")));
/* ===================== HEALTH CHECK ===================== */
app.get("/api/health", async (req, res) => {
  try {
    // 1. Check Database Variable
    const dbCheck = await pool.query("SELECT NOW()");

    // 2. Check Environment Variables (Do NOT leak passwords!)
    const envCheck = {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.SERVER_PORT || process.env.PORT,
      dbConnected: !!dbCheck.rows[0],
    };

    res.json({
      status: "✅ Server is healthy",
      timestamp: dbCheck.rows[0].now,
      details: envCheck
    });
  } catch (err) {
    console.error("Health Check Failed:", err.message);
    res.status(500).json({
      status: "❌ Server Unhealthy",
      error: err.message
    });
  }
});
/* ===================== APPLY ENDPOINT ===================== */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.PASSWORD_USER, // Gmail App Password
  },
});
app.post("/api/apply-free-course",
  body("email").isEmail(),
  body("name").isLength({ min: 2 }),

  async (req, res) => {
    console.log("📥 Request Received!", req.body); // ADD THIS LINE

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email } = req.body;
      const result = await pool.query(
        `
      INSERT INTO users (name, email)
      VALUES ($1, $2)
      ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name
      RETURNING id
      `,
        [name, email]
      );
      const rawToken = crypto.randomBytes(32).toString("hex");

      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await pool.query(
        `UPDATE users 
        SET access_token_hash = $1,
        access_token_expires_at = $2
        WHERE email = $3`,
        [tokenHash, expiresAt, email]
      );
      try {
        // 📧 إرسال الإيميل

        const info = await transporter.sendMail({
          from: `"Nyala Academy" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: "تم استلام طلبك بنجاح - Nyala Academy",

          // Example for your backend string
          html: `
<div dir="rtl" style="background-color: #f9f9f9; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: right;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 8px; overflow: hidden;">
        <tr>
            <td style="padding: 40px;">
                <h2 style="color: #222222; font-size: 24px; margin-top: 0; margin-bottom: 20px;">
                    مرحبًا ${name} 👋
                </h2>

                <p style="color: #444444; font-size: 16px; line-height: 1.6; margin-bottom: 10px;">
                    تم استلام طلبك بنجاح للدورة المجانية:
                </p>
                <p style="color: #1a73e8; font-size: 20px; font-weight: bold; margin-bottom: 25px;">
                    أساسيات لينكس وويندوز
                </p>

                <div style="background-color: #f0f7ff; border-right: 4px solid #1a73e8; padding: 20px; border-radius: 4px; margin-bottom: 25px;">
                    <p style="color: #2c3e50; font-size: 16px; margin: 0; line-height: 1.5;">
                        📅 خلال <strong> أيام</strong> ستحصل على رسالة تحتوي على رابط الدخول للكورس.
                    </p>
                </div>

                <p style="color: #777777; font-size: 14px; margin-bottom: 40px;">
                    📌 لا تحتاج لفعل أي شيء الآن. سنقوم بتجهيز حسابك قريباً.
                </p>

                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #eeeeee; padding-top: 20px;">
                    <tr>
                        <td style="vertical-align: middle;">
                            <p style="margin: 0; color: #333333; font-weight: bold; font-size: 16px;">فريق Nyala Digital Academy</p>
                        </td>
                        <td style="text-align: left;">
                            <img src="https://res.cloudinary.com/dndvxb9hk/image/upload/v1770707447/nyala-academy-logo_tudtwu.png" 
                                 alt="Nyala logo" 
                                 height="60" 
                                 style="display: block; margin-left: 0; margin-right: auto;">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
`
        })
        console.log("📬 Email Sent ID:", info.messageId);
      }
      catch (error) {
        console.error("🔥 NODEMAILER ERROR:", error.message);
        console.error("Error Code:", error.code); // Look for EAUTH or ETIMEDOUT
      }


      transporter.verify((error, success) => {
        if (error) {
          console.error("❌ Email config error:", error);
        } else {
          console.log("✅ Email server is ready", success);
        }
      });
      res.json({ success: true });
    } catch (err) {
      console.error("SERVER ERROR:", err);
      // تأكّد أننا لم نرسل ردًّا سابقًا
      if (!res.headersSent) {
        return res.status(500).json({ error: "server_error" });
      }
    }
  });

// TODO: move this logic to main platform backend
async function sendFreeCourseAccessEmail(user) {
  const link = `http://localhost:3000/free-course-entry?token=${user.access_token}`;
  //https://yourdomain.com/verify?token=RAW_TOKEN
  await transporter.sendMail({
    from: `"Nyala Academy" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: "🎉 حان وقت بدء دورتك المجانية",
    html: `
<div dir="rtl" style="background-color: #f4f7f9; padding: 30px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: right;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 40px;">
                
                <h2 style="color: #1e293b; font-size: 24px; margin-top: 0;">مرحبًا ${user.name} 👋</h2>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.8;">
                    كما وعدناك، أصبح بإمكانك الآن البدء في <br>
                    <strong style="color: #2563eb; font-size: 18px;">الدورة المجانية: أساسيات لينكس وويندوز</strong>
                </p>

                <p style="color: #64748b; font-size: 15px; margin: 25px 0 10px 0;">
                    لإنشاء كلمة المرور والدخول إلى لوحة التعليم الخاصة بك:
                </p>

                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                    <tr>
                        <td align="center">
                            <a href="${link}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 18px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                                ابدأ الكورس الآن
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 10px;">
                    ⚠️ هذا الرابط مخصص لك فقط لضمان أمان حسابك.
                </p>

                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 40px 0 30px 0;">

                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="vertical-align: middle;">
                            <p style="margin: 0; color: #1e293b; font-weight: bold; font-size: 16px;">فريق Nyala Digital Academy</p>
                            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">نحن هنا لدعم رحلتك التقنية</p>
                        </td>
                        <td style="text-align: left;">
                            <img src="https://res.cloudinary.com/dndvxb9hk/image/upload/v1770707447/nyala-academy-logo_tudtwu.png" 
                                 alt="Nyala logo" 
                                 height="60" 
                                 style="display: block; margin-left: 0; margin-right: auto;">
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</div>
`


  });
}

/* ===================== CRON JOB (RUNS DAILY) ===================== */

cron.schedule("*/1 * * * *", async () => {
  console.log("⏰ Checking users for free course email...");

  const waitDays = parseInt(process.env.COURSE_WAIT_DAYS) || 7;

  const result = await pool.query(
    `
  SELECT *
  FROM users
  WHERE email_sent_at IS NULL
  AND applied_at <= NOW() - ($1 || ' days')::interval
  `
    ,
    [waitDays]

  );

  for (const user of result.rows) {
    try {
      await sendFreeCourseAccessEmail(user);

      await pool.query(
        `
         UPDATE users
  SET email_sent_at = NOW(),
      free_access_enabled = true
  WHERE id = $1

         `,
        [user.id]
      );

    } catch (err) {
      console.error("❌ Email send failed:", err);
    }
  }
});

/* ===================== FREE COURSE ACCESS CHECK ===================== */

app.get("/api/verify-free-access", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ access: false, message: "No token provided" });
    }

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

    if (!user) {
      return res.status(403).json({
        access: false,
        message: "Invalid or expired token."
      });
    }

    // ✅ Enable access and clear token
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

    res.json({
      access: true,
      user: user.name
    });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.use(express.static(path.join(__dirname, "../client/dist")));

/* 3. The Catch-All: Only runs if the request didn't match an API or Static file */
app.get("/{*any}", (req, res) => {
  // If it's an API call that doesn't exist, don't send the HTML, send a 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  // Otherwise, send the frontend app
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});
/* ===================== START SERVER ===================== */
app.listen(PORT, '0.0.0.0', () => {

  console.log(`🚀 SEB Backend running on port ${PORT}`);
});
