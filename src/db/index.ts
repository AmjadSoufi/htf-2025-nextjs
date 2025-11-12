import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database(process.env.DATABASE_URL || "./sqlite.db");
export const db = drizzle(sqlite, { schema });

// Ensure necessary tables exist at runtime for development convenience.
// This is a lightweight safety-net so the `user_progress` table exists even
// if migrations haven't been run.
try {
	// enable foreign key enforcement
	sqlite.exec("PRAGMA foreign_keys = ON;");

	sqlite.exec(
		`CREATE TABLE IF NOT EXISTS user_progress (
			userId TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
			xp INTEGER NOT NULL DEFAULT 0,
			rank TEXT NOT NULL DEFAULT 'Beginner',
			updatedAt INTEGER NOT NULL
		);`
	);
} catch (e) {
	// don't crash the app on startup; log for debugging
	// (award helper is also best-effort and will log errors)
	// eslint-disable-next-line no-console
	console.error("DB initialization warning:", e);
}
