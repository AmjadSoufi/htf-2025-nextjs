export interface Fish {
  id: string;
  name: string;
  image: string;
  rarity: string;
  latestSighting: {
    latitude: number;
    longitude: number;
    timestamp: string;
    temperature?: number | null;
    temperatureTimestamp?: string | null;
    isTemperatureInPreferredRange?: boolean | null;
  };
  // Preferred temperature profile (client-friendly)
  preferredTemperatureMin?: number;
  preferredTemperatureMax?: number;
  // Optional rich metadata to support detailed card view
  species?: string;
  description?: string;
  sizeCm?: number; // typical length
  weightKg?: number; // typical weight
  speed?: number; // arbitrary 0-100
  agility?: number; // arbitrary 0-100
  habitat?: string;
  abilities?: string[];
  conservationStatus?: string; // e.g., 'LC', 'VU', 'EN'
}

export type Rarity = "COMMON" | "RARE" | "EPIC";
