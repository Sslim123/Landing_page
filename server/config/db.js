import pkg from "pg";
const { Pool } = pkg;



const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  // This logic handles both Local and Supabase safely
  ssl: (connectionString && !connectionString.includes("localhost"))
    ? { rejectUnauthorized: false }
    : false
});
console.log("DATABASE_URL:", process.env.DATABASE_URL);
// Test the connection immediately on startup
pool.connect((err) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Connected to Supabase successfully!');
  }
});
export default pool;