import cron from "node-cron";

cron.schedule("0 */6 * * *", async () => {
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