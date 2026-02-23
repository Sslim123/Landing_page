import transporter from "../config/mail.js";

export const sendApplicationEmail = async (email, name, token) => {
  await transporter.sendMail({
    from: `"Nyala Academy" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "تم استلام طلبك بنجاح - Nyala Academy",
    // html: `<div>Access link: ${process.env.BASE_URL}/access?token=${token}</div>`

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
  });
};