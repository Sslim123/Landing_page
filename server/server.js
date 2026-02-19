import dotenv from "dotenv";
dotenv.config();
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

import express from "express";
import pkg from "pg";
import crypto from "crypto";
import cron from "node-cron";
import nodemailer from "nodemailer";
import cors from "cors";

const { Pool } = pkg;
const app = express();

/* ===================== CONFIG ===================== */

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});
console.log("DB PASSWORD:", typeof process.env.DB_PASSWORD);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.PASSWORD_USER, // Gmail App Password
  },
});

const FRONTEND_URL = "http://localhost";
const PORT = 4000;

/* ===================== APPLY ENDPOINT ===================== */

app.post("/api/apply-free-course", async (req, res) => {
  try {
    const { name, email } = req.body;

    const result = await pool.query(
      `
      INSERT INTO users (name, email, access_token)
      VALUES ($1, $2, gen_random_uuid())
      ON CONFLICT (email)
      DO UPDATE SET email = EXCLUDED.email
      RETURNING id
      `,
      [name, email]
    );

    // 📧 إرسال الإيميل
    await transporter.sendMail({
      from: `"SEB Academy" <${process.env.GMAIL_USER}>`,
      to: email,

      // Example for your backend string
 html : `
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
                        📅 خلال <strong>7 أيام</strong> ستحصل على رسالة تحتوي على رابط الدخول للكورس.
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
    });


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
// TEMP: free course access email
// TODO: move this logic to main platform backend
// take student to main web site for access to free course 
async function sendFreeCourseAccessEmail(user) {
  const link = `http://localhost:3000/free-course-entry?token=${user.access_token}`;

  await transporter.sendMail({
    from: `"SEB Academy" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: "🎉 حان وقت بدء دورتك المجانية",
    // This string is ready for your backend mailer (e.g., Nodemailer, SendGrid, Postmark)
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

  const waitDays = process.env.COURSE_WAIT_DAYS || 7;

  const result = await pool.query(`
    SELECT * FROM users
    WHERE free_course_email_sent = false
    AND applied_at <= NOW() - INTERVAL '${waitDays} days'
  `);

  for (const user of result.rows) {
    try {
      await sendFreeCourseAccessEmail(user);

      await pool.query(
        `UPDATE users
         SET free_course_email_sent = true,
             free_access_enabled = true
         WHERE id = $1`,
        [user.id]
      );

      console.log(`✅ Free course email sent to ${user.email}`);
    } catch (err) {
      console.error("❌ Email send failed:", err);
    }
  }
});

/* ===================== FREE COURSE ACCESS CHECK ===================== */

app.get("/api/verify-free-access", async (req, res) => {
  const { token } = req.query;

  const { rows } = await pool.query(
    "SELECT * FROM users WHERE access_token = $1",
    [token]
  );

  if (!rows.length || !rows[0].free_access_enabled) {
    return res.status(403).json({ access: false });
  }

  res.json({ access: true, user: rows[0].name });
});



/* ===================== START SERVER ===================== */

app.listen(PORT, () => {
  console.log(`🚀 SEB Backend running on port ${PORT}`);
});
