export type AchievementIcon = "shield" | "flame" | "target" | "zap";

export interface TelemetryPoint {
  timestamp?: string;
  speedKph: number;
  accelerationMps2: number;
  brakingMps2: number;
  corneringG: number;
  phoneUse: boolean;
  speedLimitKph: number;
}

export interface Ride {
  id: string;
  date: string;
  duration: string;
  durationMinutes: number;
  distance: string;
  distanceKm: number;
  score: number;
  tokensEarned: number;
  route: string;
  telemetry: TelemetryPoint[];
  incidents: {
    overspeed: number;
    harshBraking: number;
    harshAcceleration: number;
    sharpCornering: number;
    phoneUse: number;
  };
}

export interface Store {
  riders: Array<{
    id: string;
    name: string;
    score: number;
    tokens: number;
    rides: number;
  }>;
  rides: Ride[];
}

export interface Dashboard {
  currentScore: number;
  stats: {
    totalRides: number;
    tokensEarned: number;
    currentStreak: number;
  };
  recentRides: Array<Pick<Ride, "id" | "date" | "duration" | "distance" | "score" | "tokensEarned" | "route">>;
  leaderboard: Array<{
    rank: number;
    rider: string;
    score: number;
    tokens: number;
    rides: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: AchievementIcon;
    unlocked: boolean;
    progress?: number;
  }>;
}
