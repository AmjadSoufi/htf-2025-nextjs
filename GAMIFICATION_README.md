# Gamification & Leaderboard System

## Overview

A comprehensive gamification system has been implemented with achievements, leaderboards, and a points-based ranking system.

## Features Implemented

### 1. **Database Schema** (`src/db/schema.ts`)

- **user_progress**: Enhanced with new columns:

  - `totalPoints`: Total points earned
  - `uniqueFishSpotted`: Count of unique fish species
  - `totalSightings`: Total number of sightings
  - `rareFishSpotted`: Count of rare fish
  - `epicFishSpotted`: Count of epic fish
  - `verifiedSightings`: Count of AI-verified sightings

- **user_sightings**: New table tracking individual sightings

  - Stores fish details, location, verification status
  - Calculates points per sighting based on rarity, verification, and photo quality
  - Supports regional filtering

- **user_achievements**: New table for unlocked achievements
  - Achievement metadata (name, description, icon, tier)
  - Points awarded per achievement
  - Unlock timestamp

### 2. **Points System** (`src/lib/achievements.ts`)

Points are calculated based on multiple factors:

**Base Points by Rarity:**

- Epic: 100 points
- Rare: 50 points
- Uncommon: 25 points
- Common: 10 points

**Bonuses:**

- Verified sighting: +50% points
- Photo quality:
  - High: +20 points
  - Medium: +10 points
  - Low: +5 points

### 3. **Achievement System**

18+ achievements across 4 tiers:

**Bronze Tier:**

- First Catch (1 sighting)
- Verified Sighter (1 verified)
- Fish Collector (5 unique fish)
- Dedicated Spotter (25 sightings)

**Silver Tier:**

- Fish Expert (10 unique fish)
- Rare Hunter (1 rare fish)
- Keen Observer (50 sightings)
- Trusted Spotter (10 verified)
- Rising Star (500 points)

**Gold Tier:**

- Fish Master (25 unique fish)
- Rare Collector (5 rare fish)
- Epic Hunter (1 epic fish)
- Master Tracker (100 sightings)
- Verification Master (25 verified)
- Point Master (1,000 points)

**Platinum Tier:**

- Marine Biologist (50 unique fish)
- Epic Collector (3 epic fish)
- Legend (2,500 points)

### 4. **Leaderboard** (`/leaderboard`)

- **Multiple time periods**: Weekly, Monthly, All-Time
- **Regional filtering**: Filter by region
- **Top 3 podium display**: Special visual treatment for top performers
- **Detailed stats**: Shows points, unique fish, sightings, rare/epic counts
- **User highlighting**: Current user highlighted in the list

### 5. **Achievements Page** (`/achievements`)

- **Visual achievement cards**: Shows all achievements with unlock status
- **Tier filtering**: Filter by Bronze, Silver, Gold, Platinum
- **Progress tracking**: Shows when achievements were unlocked
- **Stats dashboard**: Displays user's current progress
- **Locked/Unlocked states**: Visual distinction between earned and locked achievements

### 6. **API Endpoints**

**`/api/leaderboard`**

- `GET` with query params:
  - `period`: weekly | monthly | all-time
  - `region`: optional region filter
  - `limit`: max number of entries (default 100)

**`/api/achievements`**

- `GET`: Returns user's achievements and progress stats

**`/api/sightings`** (Updated)

- Enhanced `POST` to:
  - Calculate points based on rarity + verification + photo quality
  - Track sightings in database
  - Update user progress
  - Check and award new achievements automatically

**`/api/user/progress`** (Updated)

- Returns comprehensive user stats including points and fish counts

### 7. **UI Components**

**Navigation**

- Added Leaderboard and Achievements links to main header
- Color-coded buttons (Leaderboard: gold, Achievements: purple)

**User Info Display** (Updated)

- Shows total points, XP, and rank
- Real-time updates when achievements are unlocked

## How It Works

1. **User reports a fish sighting** with optional photo
2. **Points are calculated** based on fish rarity, verification status, and photo quality
3. **Sighting is saved** to `user_sightings` table
4. **User progress is updated**:
   - Total points increased
   - Fish counts updated
   - XP and rank recalculated
5. **Achievement check runs**:
   - Compares current stats against achievement requirements
   - Unlocks any newly earned achievements
   - Awards achievement points
6. **Leaderboard updates** automatically with new points
7. **User can view**:
   - Their position on leaderboards (weekly/monthly/all-time)
   - Unlocked and locked achievements
   - Detailed stats and progress

## Next Steps (Optional Enhancements)

- Add achievement notifications/toasts when unlocked
- Implement badges on user profiles
- Add seasonal/event-based achievements
- Create regional leaderboards
- Add social features (share achievements)
- Implement streak tracking (consecutive days)
- Add team/group competitions
- Create achievement progress bars for locked achievements
