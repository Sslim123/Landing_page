import transporter from "../config/mail.js";

export const sendFreeCourseAccessEmail = async (user) => {
  const link = `${process.env.BASE_URL}/free-course-entry?token=${user.access_token}`;

  await transporter.sendMail({
    from: `"Nyala Academy" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: "🎉 حان وقت بدء دورتك المجانية",
    html: `
      <div dir="rtl" style="font-family: Arial;">
        <h2>مرحباً ${user.name}</h2>
        <p>يمكنك الآن بدء دورتك المجانية عبر الرابط التالي:</p>
        <a href="${link}" 
           style="background:#2563eb;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
           الدخول إلى الدورة
        </a>
        <p>الرابط صالح لمدة ساعة واحدة.</p>
      </div>
    `
  });
};