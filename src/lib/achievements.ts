export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  points: number;
  requirement: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalSightings: number;
  uniqueFishSpotted: number;
  rareFishSpotted: number;
  epicFishSpotted: number;
  verifiedSightings: number;
  totalPoints: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // First Steps
  {
    id: "FIRST_SIGHTING",
    name: "First Catch",
    description: "Record your first fish sighting",
    icon: "🎣",
    tier: "BRONZE",
    points: 10,
    requirement: (stats) => stats.totalSightings >= 1,
  },
  {
    id: "VERIFIED_SIGHTER",
    name: "Verified Sighter",
    description: "Get your first verified sighting",
    icon: "✓",
    tier: "BRONZE",
    points: 15,
    requirement: (stats) => stats.verifiedSightings >= 1,
  },

  // Fish Count Milestones
  {
    id: "FISH_COLLECTOR_5",
    name: "Fish Collector",
    description: "Spot 5 unique fish species",
    icon: "🐠",
    tier: "BRONZE",
    points: 25,
    requirement: (stats) => stats.uniqueFishSpotted >= 5,
  },
  {
    id: "FISH_COLLECTOR_10",
    name: "Fish Expert",
    description: "Spot 10 unique fish species",
    icon: "🐡",
    tier: "SILVER",
    points: 50,
    requirement: (stats) => stats.uniqueFishSpotted >= 10,
  },
  {
    id: "FISH_COLLECTOR_25",
    name: "Fish Master",
    description: "Spot 25 unique fish species",
    icon: "🦈",
    tier: "GOLD",
    points: 100,
    requirement: (stats) => stats.uniqueFishSpotted >= 25,
  },
  {
    id: "FISH_COLLECTOR_50",
    name: "Marine Biologist",
    description: "Spot 50 unique fish species",
    icon: "🐋",
    tier: "PLATINUM",
    points: 250,
    requirement: (stats) => stats.uniqueFishSpotted >= 50,
  },

  // Rare Species
  {
    id: "RARE_HUNTER",
    name: "Rare Hunter",
    description: "Spot your first rare fish",
    icon: "⭐",
    tier: "SILVER",
    points: 30,
    requirement: (stats) => stats.rareFishSpotted >= 1,
  },
  {
    id: "RARE_COLLECTOR",
    name: "Rare Collector",
    description: "Spot 5 rare fish",
    icon: "🌟",
    tier: "GOLD",
    points: 75,
    requirement: (stats) => stats.rareFishSpotted >= 5,
  },
  {
    id: "EPIC_HUNTER",
    name: "Epic Hunter",
    description: "Spot your first epic fish",
    icon: "💎",
    tier: "GOLD",
    points: 100,
    requirement: (stats) => stats.epicFishSpotted >= 1,
  },
  {
    id: "EPIC_COLLECTOR",
    name: "Epic Collector",
    description: "Spot 3 epic fish",
    icon: "👑",
    tier: "PLATINUM",
    points: 300,
    requirement: (stats) => stats.epicFishSpotted >= 3,
  },

  // Total Sightings
  {
    id: "DEDICATED_SPOTTER",
    name: "Dedicated Spotter",
    description: "Record 25 total sightings",
    icon: "📸",
    tier: "BRONZE",
    points: 30,
    requirement: (stats) => stats.totalSightings >= 25,
  },
  {
    id: "KEEN_OBSERVER",
    name: "Keen Observer",
    description: "Record 50 total sightings",
    icon: "📷",
    tier: "SILVER",
    points: 60,
    requirement: (stats) => stats.totalSightings >= 50,
  },
  {
    id: "MASTER_TRACKER",
    name: "Master Tracker",
    description: "Record 100 total sightings",
    icon: "🎯",
    tier: "GOLD",
    points: 150,
    requirement: (stats) => stats.totalSightings >= 100,
  },

  // Verification
  {
    id: "TRUSTED_SPOTTER",
    name: "Trusted Spotter",
    description: "Get 10 verified sightings",
    icon: "✅",
    tier: "SILVER",
    points: 50,
    requirement: (stats) => stats.verifiedSightings >= 10,
  },
  {
    id: "VERIFICATION_MASTER",
    name: "Verification Master",
    description: "Get 25 verified sightings",
    icon: "🏆",
    tier: "GOLD",
    points: 125,
    requirement: (stats) => stats.verifiedSightings >= 25,
  },

  // Points Milestones
  {
    id: "POINTS_500",
    name: "Rising Star",
    description: "Earn 500 total points",
    icon: "🌠",
    tier: "SILVER",
    points: 50,
    requirement: (stats) => stats.totalPoints >= 500,
  },
  {
    id: "POINTS_1000",
    name: "Point Master",
    description: "Earn 1,000 total points",
    icon: "💫",
    tier: "GOLD",
    points: 100,
    requirement: (stats) => stats.totalPoints >= 1000,
  },
  {
    id: "POINTS_2500",
    name: "Legend",
    description: "Earn 2,500 total points",
    icon: "🔱",
    tier: "PLATINUM",
    points: 250,
    requirement: (stats) => stats.totalPoints >= 2500,
  },
];

export function calculatePoints(
  rarity: string,
  verified: boolean,
  photoQuality?: string
): number {
  let points = 0;

  // Base points by rarity
  switch (rarity.toUpperCase()) {
    case "EPIC":
      points = 100;
      break;
    case "RARE":
      points = 50;
      break;
    case "UNCOMMON":
      points = 25;
      break;
    case "COMMON":
    default:
      points = 10;
      break;
  }

  // Verification bonus (50% more points)
  if (verified) {
    points = Math.floor(points * 1.5);
  }

  // Photo quality bonus
  if (photoQuality) {
    switch (photoQuality.toUpperCase()) {
      case "HIGH":
        points += 20;
        break;
      case "MEDIUM":
        points += 10;
        break;
      case "LOW":
        points += 5;
        break;
    }
  }

  return points;
}

export function checkNewAchievements(
  stats: UserStats,
  currentAchievements: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (achievement) =>
      !currentAchievements.includes(achievement.id) &&
      achievement.requirement(stats)
  );
}
