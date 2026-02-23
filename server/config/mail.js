import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({

  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }

});
console.log("MAIL USER:", process.env.GMAIL_USER);
console.log("MAIL PASS TYPE:", typeof process.env.GMAIL_PASS);


transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email config error:", error);
  } else {
    console.log("✅ Email server is ready");
  }

});
export default transporter;