import type { Ride, Store, TelemetryPoint } from "./types";
import { calculateSafetyScore } from "./scoring";

const routes = ["Koramangala Loop", "Indiranagar Sprint", "MG Road Commute", "Cubbon Park Cruise", "HSR Evening Ride"];

const riders = [
  { id: "rider-ava", name: "Ava", score: 96, tokens: 3240, rides: 44 },
  { id: "rider-dev", name: "Dev", score: 92, tokens: 2870, rides: 38 },
  { id: "rider-maya", name: "Maya", score: 89, tokens: 2425, rides: 35 },
  { id: "rider-neo", name: "Neo", score: 84, tokens: 1950, rides: 27 },
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function makeTelemetry(samples: number, risk: number): TelemetryPoint[] {
  return Array.from({ length: samples }, (_, index) => {
    const speedLimitKph = index % 3 === 0 ? 50 : 60;
    const risky = Math.random() < risk;

    return {
      timestamp: new Date(Date.now() - (samples - index) * 30_000).toISOString(),
      speedKph: Math.round(risky ? rand(speedLimitKph + 9, speedLimitKph + 24) : rand(28, speedLimitKph + 4)),
      accelerationMps2: Number((risky ? rand(2.8, 4.6) : rand(0.1, 2.2)).toFixed(2)),
      brakingMps2: Number((risky ? rand(-5.4, -3.2) : rand(-2.8, -0.2)).toFixed(2)),
      corneringG: Number((risky ? rand(0.34, 0.58) : rand(0.04, 0.24)).toFixed(2)),
      phoneUse: Math.random() < risk / 2,
      speedLimitKph,
    };
  });
}

export function generateSampleRide(offsetDays = 0): Ride {
  const distanceKm = Number(rand(4, 26).toFixed(1));
  const durationMinutes = Math.round(distanceKm * rand(2.5, 4.8));
  const telemetry = makeTelemetry(Math.max(12, Math.round(durationMinutes / 2)), rand(0.02, 0.16));
  const result = calculateSafetyScore(telemetry, distanceKm);
  const date = new Date(Date.now() - offsetDays * 86_400_000);

  return {
    id: `ride-${date.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    duration: `${durationMinutes} min`,
    durationMinutes,
    distance: `${distanceKm} km`,
    distanceKm,
    score: result.score,
    tokensEarned: result.tokensEarned,
    route: routes[Math.floor(Math.random() * routes.length)],
    telemetry,
    incidents: result.incidents,
  };
}

export function createSeedStore(): Store {
  return {
    riders,
    rides: [generateSampleRide(0), generateSampleRide(1), generateSampleRide(3), generateSampleRide(6)],
  };
}
