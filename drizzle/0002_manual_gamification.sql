-- Add new columns to existing user_progress table
ALTER TABLE `user_progress` ADD COLUMN `totalPoints` integer DEFAULT 0 NOT NULL;
ALTER TABLE `user_progress` ADD COLUMN `uniqueFishSpotted` integer DEFAULT 0 NOT NULL;
ALTER TABLE `user_progress` ADD COLUMN `totalSightings` integer DEFAULT 0 NOT NULL;
ALTER TABLE `user_progress` ADD COLUMN `rareFishSpotted` integer DEFAULT 0 NOT NULL;
ALTER TABLE `user_progress` ADD COLUMN `epicFishSpotted` integer DEFAULT 0 NOT NULL;
ALTER TABLE `user_progress` ADD COLUMN `verifiedSightings` integer DEFAULT 0 NOT NULL;

-- Create user_sightings table
CREATE TABLE IF NOT EXISTS `user_sightings` (
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

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS `user_achievements` (
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
