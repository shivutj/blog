import postgres from "postgres";

// Use DATABASE_URL from environment or default to local
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/quickai";

// Parse connection string to handle SSL properly
const sql = postgres(connectionString, {
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

export default sql;
