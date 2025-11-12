CREATE TABLE `user_achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`achievementId` text NOT NULL,
	`achievementName` text NOT NULL,
	`achievementDescription` text NOT NULL,
	`achievementIcon` text NOT NULL,
	`achievementTier` text NOT NULL,
	`points` integer NOT NULL,
	`unlockedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`userId` text PRIMARY KEY NOT NULL,
	`xp` integer NOT NULL,
	`rank` text NOT NULL,
	`totalPoints` integer DEFAULT 0 NOT NULL,
	`uniqueFishSpotted` integer DEFAULT 0 NOT NULL,
	`totalSightings` integer DEFAULT 0 NOT NULL,
	`rareFishSpotted` integer DEFAULT 0 NOT NULL,
	`epicFishSpotted` integer DEFAULT 0 NOT NULL,
	`verifiedSightings` integer DEFAULT 0 NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_sightings` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`fishId` text NOT NULL,
	`fishName` text NOT NULL,
	`rarity` text NOT NULL,
	`latitude` integer,
	`longitude` integer,
	`imageUrl` text,
	`verified` integer DEFAULT false NOT NULL,
	`verificationScore` integer,
	`photoQuality` text,
	`points` integer DEFAULT 0 NOT NULL,
	`region` text,
	`timestamp` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
