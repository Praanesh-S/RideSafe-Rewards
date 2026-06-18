import type { Dashboard, Ride, Store } from "./types";
import { calculateSafetyScore } from "./scoring";
import { parseTelemetry } from "./parser";
import { generateSampleRide } from "./sampleData";

type RideInput = Record<string, unknown>;

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function streakFromRides(rides: Ride[]) {
  return Math.min(rides.length, rides.filter((ride) => ride.score >= 75).length);
}

function dashboardAchievements(rides: Ride[]) {
  const totalRides = rides.length;
  const bestScore = Math.max(0, ...rides.map((ride) => ride.score));
  const streak = streakFromRides(rides);
  const tokens = rides.reduce((sum, ride) => sum + ride.tokensEarned, 0);

  return [
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
      unlocked: streak >= 5,
      progress: clampPercent((streak / 5) * 100),
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
      unlocked: tokens >= 500,
      progress: clampPercent((tokens / 500) * 100),
    },
  ];
}

export function buildDashboard(store: Store): Dashboard {
  const rides = [...store.rides].sort((a, b) => b.id.localeCompare(a.id));
  const tokensEarned = rides.reduce((sum, ride) => sum + ride.tokensEarned, 0);
  const currentScore = average(rides.slice(0, 5).map((ride) => ride.score));
  const userEntry = {
    rider: "You",
    score: currentScore,
    tokens: tokensEarned,
    rides: rides.length,
  };

  const leaderboard = [...store.riders.map((rider) => ({
    rider: rider.name,
    score: rider.score,
    tokens: rider.tokens,
    rides: rider.rides,
  })), userEntry]
    .sort((a, b) => b.score - a.score || b.tokens - a.tokens)
    .map((entry, index) => ({ rank: index + 1, ...entry }));

  return {
    currentScore,
    stats: {
      totalRides: rides.length,
      tokensEarned,
      currentStreak: streakFromRides(rides),
    },
    recentRides: rides.slice(0, 6).map(({ id, date, duration, distance, score, tokensEarned: rideTokens, route }) => ({
      id,
      date,
      duration,
      distance,
      score,
      tokensEarned: rideTokens,
      route,
    })),
    leaderboard,
    achievements: dashboardAchievements(rides),
  };
}

export function createRideFromInput(input: unknown): Ride {
  const body = (typeof input === "object" && input !== null ? input : {}) as RideInput;
  const rawTelemetry = body.telemetry ?? body.rideData ?? body.rawText ?? body.data ?? input;
  const telemetry = parseTelemetry(rawTelemetry);

  if (telemetry.length === 0 && Object.keys(body).length === 0) {
    return generateSampleRide();
  }

  const distanceKm = Number(body.distanceKm ?? body.distance_km ?? body.distance ?? Math.max(3, telemetry.length * 0.35));
  const durationMinutes = Number(body.durationMinutes ?? body.duration_minutes ?? body.duration ?? Math.max(12, telemetry.length * 2));
  const result = calculateSafetyScore(telemetry.length > 0 ? telemetry : generateSampleRide().telemetry, distanceKm);
  const date = body.date ? new Date(String(body.date)) : new Date();

  return {
    id: `ride-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: Number.isNaN(date.getTime())
      ? new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
      : date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    duration: `${Math.round(durationMinutes)} min`,
    durationMinutes: Math.round(durationMinutes),
    distance: `${Number(distanceKm.toFixed(1))} km`,
    distanceKm: Number(distanceKm.toFixed(1)),
    score: result.score,
    tokensEarned: result.tokensEarned,
    route: String(body.route ?? "Uploaded Ride"),
    telemetry: telemetry.length > 0 ? telemetry : generateSampleRide().telemetry,
    incidents: result.incidents,
  };
}

export function updateRide(store: Store, id: string, changes: RideInput) {
  const index = store.rides.findIndex((ride) => ride.id === id);
  if (index === -1) {
    const error = new Error("Ride not found") as Error & { status: number };
    error.status = 404;
    throw error;
  }

  store.rides[index] = {
    ...store.rides[index],
    route: typeof changes.route === "string" ? changes.route : store.rides[index].route,
    date: typeof changes.date === "string" ? changes.date : store.rides[index].date,
  };

  return store.rides[index];
}
