import type { DashboardData } from "./ridesafe-api";

export interface TelemetryPoint {
  timestamp?: string;
  speedKph: number;
  accelerationMps2: number;
  brakingMps2: number;
  corneringG: number;
  phoneUse: boolean;
  speedLimitKph: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function numberFrom(value: any, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolFrom(value: any): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") return ["true", "1", "yes", "y"].includes(value.toLowerCase());
  return false;
}

function normalizePoint(row: Record<string, any>): TelemetryPoint {
  const speedKph = numberFrom(row.speedKph ?? row.speed_kph ?? row.speed ?? row.velocity, 42);
  return {
    timestamp: typeof row.timestamp === "string" ? row.timestamp : undefined,
    speedKph,
    accelerationMps2: numberFrom(row.accelerationMps2 ?? row.acceleration_mps2 ?? row.acceleration ?? row.accel, 0.8),
    brakingMps2: numberFrom(row.brakingMps2 ?? row.braking_mps2 ?? row.braking ?? row.brake, -1.2),
    corneringG: numberFrom(row.corneringG ?? row.cornering_g ?? row.cornering ?? row.lateralG ?? row.lateral_g, 0.12),
    phoneUse: boolFrom(row.phoneUse ?? row.phone_use ?? row.phone ?? row.distracted),
    speedLimitKph: numberFrom(row.speedLimitKph ?? row.speed_limit_kph ?? row.speedLimit ?? row.limit, Math.max(45, speedKph + 10)),
  };
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {} as Record<string, string>);
  });
}

export function parseTelemetry(input: any): TelemetryPoint[] {
  if (Array.isArray(input)) return input.map((item) => normalizePoint(item ?? {}));

  if (typeof input === "object" && input !== null) {
    const nested = input.telemetry ?? input.samples ?? input.points ?? input.data;
    if (Array.isArray(nested)) return nested.map((item) => normalizePoint(item ?? {}));
  }

  if (typeof input === "string") {
    try {
      return parseTelemetry(JSON.parse(input));
    } catch {
      return parseCsv(input).map(normalizePoint);
    }
  }

  return [];
}

export function calculateSafetyScore(points: TelemetryPoint[], distanceKm: number) {
  const incidents = {
    overspeed: 0,
    harshBraking: 0,
    harshAcceleration: 0,
    sharpCornering: 0,
    phoneUse: 0,
  };

  for (const point of points) {
    if (point.speedKph > point.speedLimitKph + 8) incidents.overspeed += 1;
    if (point.brakingMps2 <= -4.2) incidents.harshBraking += 1;
    if (point.accelerationMps2 >= 3.6) incidents.harshAcceleration += 1;
    if (point.corneringG >= 0.42) incidents.sharpCornering += 1;
    if (point.phoneUse) incidents.phoneUse += 1;
  }

  const sampleCount = Math.max(points.length, 1);
  const normalizedDistance = Math.max(distanceKm, 1);
  const penalty =
    (incidents.overspeed / sampleCount) * 32 +
    (incidents.phoneUse / sampleCount) * 28 +
    (incidents.harshBraking / normalizedDistance) * 4 +
    (incidents.harshAcceleration / normalizedDistance) * 3 +
    (incidents.sharpCornering / normalizedDistance) * 3;

  const score = Math.round(clamp(100 - penalty, 35, 100));
  const distanceBonus = Math.round(distanceKm * 1.4);
  const safetyBonus = Math.round(score * 0.8);
  const tokensEarned = Math.max(5, Math.round((distanceBonus + safetyBonus) * (score / 100)));

  return { score, tokensEarned, incidents };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function streakFromRides(rides: Array<{ score: number }>): number {
  return Math.min(rides.length, rides.filter((ride) => ride.score >= 75).length);
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateLocalDashboard(
  currentDashboard: DashboardData,
  fileName: string,
  rawText: string
): { safetyScore: number; tokensEarned: number; dashboard: DashboardData } {
  const telemetry = parseTelemetry(rawText);
  
  // If telemetry parsing yielded nothing, use a dummy point to prevent division by zero
  const activeTelemetry = telemetry.length > 0 ? telemetry : [
    { speedKph: 45, accelerationMps2: 0.5, brakingMps2: -0.5, corneringG: 0.1, phoneUse: false, speedLimitKph: 50 }
  ];

  const distanceKm = Math.max(3, activeTelemetry.length * 0.35);
  const durationMinutes = Math.max(12, activeTelemetry.length * 2);
  
  const result = calculateSafetyScore(activeTelemetry, distanceKm);
  
  const newRide = {
    id: `ride-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    duration: `${Math.round(durationMinutes)} min`,
    distance: `${Number(distanceKm.toFixed(1))} km`,
    score: result.score,
    tokensEarned: result.tokensEarned,
    route: fileName.replace(/\.[^.]+$/, "") || "Uploaded Ride",
  };

  // Rebuild the dashboard list of rides
  const updatedRides = [newRide, ...currentDashboard.recentRides];
  const totalRides = updatedRides.length;
  const tokensEarned = currentDashboard.stats.tokensEarned + result.tokensEarned;
  
  // Calculate average of up to the last 5 rides
  const currentScore = average(updatedRides.slice(0, 5).map((ride) => ride.score));
  const currentStreak = streakFromRides(updatedRides);

  // Recalculate Achievements
  const bestScore = Math.max(0, ...updatedRides.map((ride) => ride.score));
  const achievements = [
    {
      id: "first-safe-ride",
      title: "First Safe Ride",
      description: "Complete one scored ride",
      icon: "shield" as const,
      unlocked: totalRides >= 1,
      progress: clampPercent(totalRides * 100),
    },
    {
      id: "five-ride-streak",
      title: "Streak Builder",
      description: "Score 75+ on five rides",
      icon: "flame" as const,
      unlocked: currentStreak >= 5,
      progress: clampPercent((currentStreak / 5) * 100),
    },
    {
      id: "precision-rider",
      title: "Precision Rider",
      description: "Reach a 95 safety score",
      icon: "target" as const,
      unlocked: bestScore >= 95,
      progress: clampPercent((bestScore / 95) * 100),
    },
    {
      id: "token-surge",
      title: "Token Surge",
      description: "Earn 500 SRT",
      icon: "zap" as const,
      unlocked: tokensEarned >= 500,
      progress: clampPercent((tokensEarned / 500) * 100),
    },
  ];

  // Recalculate Leaderboard
  // We need to update the "You" entry in the leaderboard, or add it if not present
  const ridersList = currentDashboard.leaderboard.filter((entry) => entry.rider !== "You");
  const youEntry = {
    rank: 0, // temporary, will sort and rank
    rider: "You",
    score: currentScore,
    tokens: tokensEarned,
    rides: totalRides,
  };

  const leaderboard = [...ridersList, youEntry]
    .sort((a, b) => b.score - a.score || b.tokens - a.tokens)
    .map((entry, index) => ({
      rank: index + 1,
      rider: entry.rider,
      score: entry.score,
      tokens: entry.tokens,
      rides: entry.rides,
    }));

  return {
    safetyScore: result.score,
    tokensEarned: result.tokensEarned,
    dashboard: {
      currentScore,
      stats: {
        totalRides,
        tokensEarned,
        currentStreak,
      },
      recentRides: updatedRides.slice(0, 6), // Keep top 6 in UI recent rides
      leaderboard,
      achievements,
    },
  };
}
