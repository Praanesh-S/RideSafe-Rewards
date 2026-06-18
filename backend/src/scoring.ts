import type { TelemetryPoint } from "./types";

export interface ScoreResult {
  score: number;
  tokensEarned: number;
  incidents: {
    overspeed: number;
    harshBraking: number;
    harshAcceleration: number;
    sharpCornering: number;
    phoneUse: number;
  };
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function calculateSafetyScore(points: TelemetryPoint[], distanceKm: number): ScoreResult {
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
