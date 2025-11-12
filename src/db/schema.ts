import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// User table
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// Session table
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// Account table
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// Verification table
export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

// Per-user progress (XP + rank). Kept separate to avoid altering the main user table.
export const userProgress = sqliteTable("user_progress", {
  userId: text("userId")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  xp: integer("xp").notNull(),
  rank: text("rank").notNull(),
  totalPoints: integer("totalPoints").notNull().default(0),
  uniqueFishSpotted: integer("uniqueFishSpotted").notNull().default(0),
  totalSightings: integer("totalSightings").notNull().default(0),
  rareFishSpotted: integer("rareFishSpotted").notNull().default(0),
  epicFishSpotted: integer("epicFishSpotted").notNull().default(0),
  verifiedSightings: integer("verifiedSightings").notNull().default(0),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// User fish sightings - track individual sightings
export const userSightings = sqliteTable("user_sightings", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fishId: text("fishId").notNull(),
  fishName: text("fishName").notNull(),
  rarity: text("rarity").notNull(), // COMMON, RARE, EPIC
  latitude: integer("latitude", { mode: "number" }),
  longitude: integer("longitude", { mode: "number" }),
  imageUrl: text("imageUrl"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  verificationScore: integer("verificationScore", { mode: "number" }),
  photoQuality: text("photoQuality"), // LOW, MEDIUM, HIGH
  points: integer("points").notNull().default(0),
  region: text("region"), // e.g., "North Atlantic", "Pacific", etc.
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

// User achievements
export const userAchievements = sqliteTable("user_achievements", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  achievementId: text("achievementId").notNull(), // e.g., "FIRST_SIGHTING", "10_FISH", etc.
  achievementName: text("achievementName").notNull(),
  achievementDescription: text("achievementDescription").notNull(),
  achievementIcon: text("achievementIcon").notNull(),
  achievementTier: text("achievementTier").notNull(), // BRONZE, SILVER, GOLD, PLATINUM
  points: integer("points").notNull(),
  unlockedAt: integer("unlockedAt", { mode: "timestamp" }).notNull(),
});
