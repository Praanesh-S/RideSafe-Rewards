// index.ts
import express from "express";
import cors from "cors";
import { createServer } from "http";

// src/scoring.ts
var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function calculateSafetyScore(points, distanceKm) {
  const incidents = {
    overspeed: 0,
    harshBraking: 0,
    harshAcceleration: 0,
    sharpCornering: 0,
    phoneUse: 0
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
  const penalty = incidents.overspeed / sampleCount * 32 + incidents.phoneUse / sampleCount * 28 + incidents.harshBraking / normalizedDistance * 4 + incidents.harshAcceleration / normalizedDistance * 3 + incidents.sharpCornering / normalizedDistance * 3;
  const score = Math.round(clamp(100 - penalty, 35, 100));
  const distanceBonus = Math.round(distanceKm * 1.4);
  const safetyBonus = Math.round(score * 0.8);
  const tokensEarned = Math.max(5, Math.round((distanceBonus + safetyBonus) * (score / 100)));
  return { score, tokensEarned, incidents };
}

// src/parser.ts
var numberFrom = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
var boolFrom = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") return ["true", "1", "yes", "y"].includes(value.toLowerCase());
  return false;
};
function normalizePoint(row) {
  const speedKph = numberFrom(row.speedKph ?? row.speed_kph ?? row.speed ?? row.velocity, 42);
  return {
    timestamp: typeof row.timestamp === "string" ? row.timestamp : void 0,
    speedKph,
    accelerationMps2: numberFrom(row.accelerationMps2 ?? row.acceleration_mps2 ?? row.acceleration ?? row.accel, 0.8),
    brakingMps2: numberFrom(row.brakingMps2 ?? row.braking_mps2 ?? row.braking ?? row.brake, -1.2),
    corneringG: numberFrom(row.corneringG ?? row.cornering_g ?? row.cornering ?? row.lateralG ?? row.lateral_g, 0.12),
    phoneUse: boolFrom(row.phoneUse ?? row.phone_use ?? row.phone ?? row.distracted),
    speedLimitKph: numberFrom(row.speedLimitKph ?? row.speed_limit_kph ?? row.speedLimit ?? row.limit, Math.max(45, speedKph + 10))
  };
}
function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return headers.reduce((row, header, index) => {
      row[header] = values[index];
      return row;
    }, {});
  });
}
function parseTelemetry(input) {
  if (Array.isArray(input)) {
    return input.map((item) => normalizePoint(item ?? {}));
  }
  if (typeof input === "object" && input !== null) {
    const record = input;
    const nested = record.telemetry ?? record.samples ?? record.points ?? record.data;
    if (Array.isArray(nested)) {
      return nested.map((item) => normalizePoint(item ?? {}));
    }
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

// src/sampleData.ts
var routes = ["Koramangala Loop", "Indiranagar Sprint", "MG Road Commute", "Cubbon Park Cruise", "HSR Evening Ride"];
var riders = [
  { id: "rider-ava", name: "Ava", score: 96, tokens: 3240, rides: 44 },
  { id: "rider-dev", name: "Dev", score: 92, tokens: 2870, rides: 38 },
  { id: "rider-maya", name: "Maya", score: 89, tokens: 2425, rides: 35 },
  { id: "rider-neo", name: "Neo", score: 84, tokens: 1950, rides: 27 }
];
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function makeTelemetry(samples, risk) {
  return Array.from({ length: samples }, (_, index) => {
    const speedLimitKph = index % 3 === 0 ? 50 : 60;
    const risky = Math.random() < risk;
    return {
      timestamp: new Date(Date.now() - (samples - index) * 3e4).toISOString(),
      speedKph: Math.round(risky ? rand(speedLimitKph + 9, speedLimitKph + 24) : rand(28, speedLimitKph + 4)),
      accelerationMps2: Number((risky ? rand(2.8, 4.6) : rand(0.1, 2.2)).toFixed(2)),
      brakingMps2: Number((risky ? rand(-5.4, -3.2) : rand(-2.8, -0.2)).toFixed(2)),
      corneringG: Number((risky ? rand(0.34, 0.58) : rand(0.04, 0.24)).toFixed(2)),
      phoneUse: Math.random() < risk / 2,
      speedLimitKph
    };
  });
}
function generateSampleRide(offsetDays = 0) {
  const distanceKm = Number(rand(4, 26).toFixed(1));
  const durationMinutes = Math.round(distanceKm * rand(2.5, 4.8));
  const telemetry = makeTelemetry(Math.max(12, Math.round(durationMinutes / 2)), rand(0.02, 0.16));
  const result = calculateSafetyScore(telemetry, distanceKm);
  const date = new Date(Date.now() - offsetDays * 864e5);
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
    incidents: result.incidents
  };
}
function createSeedStore() {
  return {
    riders,
    rides: [generateSampleRide(0), generateSampleRide(1), generateSampleRide(3), generateSampleRide(6)]
  };
}

// src/rides.ts
var clampPercent = (value) => Math.max(0, Math.min(100, Math.round(value)));
function average(values) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
function streakFromRides(rides) {
  return Math.min(rides.length, rides.filter((ride) => ride.score >= 75).length);
}
function dashboardAchievements(rides) {
  const totalRides = rides.length;
  const bestScore = Math.max(0, ...rides.map((ride) => ride.score));
  const streak = streakFromRides(rides);
  const tokens = rides.reduce((sum, ride) => sum + ride.tokensEarned, 0);
  return [
    {
      id: "first-safe-ride",
      title: "First Safe Ride",
      description: "Complete one scored ride",
      icon: "shield",
      unlocked: totalRides >= 1,
      progress: clampPercent(totalRides * 100)
    },
    {
      id: "five-ride-streak",
      title: "Streak Builder",
      description: "Score 75+ on five rides",
      icon: "flame",
      unlocked: streak >= 5,
      progress: clampPercent(streak / 5 * 100)
    },
    {
      id: "precision-rider",
      title: "Precision Rider",
      description: "Reach a 95 safety score",
      icon: "target",
      unlocked: bestScore >= 95,
      progress: clampPercent(bestScore / 95 * 100)
    },
    {
      id: "token-surge",
      title: "Token Surge",
      description: "Earn 500 SRT",
      icon: "zap",
      unlocked: tokens >= 500,
      progress: clampPercent(tokens / 500 * 100)
    }
  ];
}
function buildDashboard(store) {
  const rides = [...store.rides].sort((a, b) => b.id.localeCompare(a.id));
  const tokensEarned = rides.reduce((sum, ride) => sum + ride.tokensEarned, 0);
  const currentScore = average(rides.slice(0, 5).map((ride) => ride.score));
  const userEntry = {
    rider: "You",
    score: currentScore,
    tokens: tokensEarned,
    rides: rides.length
  };
  const leaderboard = [...store.riders.map((rider) => ({
    rider: rider.name,
    score: rider.score,
    tokens: rider.tokens,
    rides: rider.rides
  })), userEntry].sort((a, b) => b.score - a.score || b.tokens - a.tokens).map((entry, index) => ({ rank: index + 1, ...entry }));
  return {
    currentScore,
    stats: {
      totalRides: rides.length,
      tokensEarned,
      currentStreak: streakFromRides(rides)
    },
    recentRides: rides.slice(0, 6).map(({ id, date, duration, distance, score, tokensEarned: rideTokens, route }) => ({
      id,
      date,
      duration,
      distance,
      score,
      tokensEarned: rideTokens,
      route
    })),
    leaderboard,
    achievements: dashboardAchievements(rides)
  };
}
function createRideFromInput(input) {
  const body = typeof input === "object" && input !== null ? input : {};
  const rawTelemetry = body.telemetry ?? body.rideData ?? body.rawText ?? body.data ?? input;
  const telemetry = parseTelemetry(rawTelemetry);
  if (telemetry.length === 0 && Object.keys(body).length === 0) {
    return generateSampleRide();
  }
  const distanceKm = Number(body.distanceKm ?? body.distance_km ?? body.distance ?? Math.max(3, telemetry.length * 0.35));
  const durationMinutes = Number(body.durationMinutes ?? body.duration_minutes ?? body.duration ?? Math.max(12, telemetry.length * 2));
  const result = calculateSafetyScore(telemetry.length > 0 ? telemetry : generateSampleRide().telemetry, distanceKm);
  const date = body.date ? new Date(String(body.date)) : /* @__PURE__ */ new Date();
  return {
    id: `ride-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: Number.isNaN(date.getTime()) ? (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    duration: `${Math.round(durationMinutes)} min`,
    durationMinutes: Math.round(durationMinutes),
    distance: `${Number(distanceKm.toFixed(1))} km`,
    distanceKm: Number(distanceKm.toFixed(1)),
    score: result.score,
    tokensEarned: result.tokensEarned,
    route: String(body.route ?? "Uploaded Ride"),
    telemetry: telemetry.length > 0 ? telemetry : generateSampleRide().telemetry,
    incidents: result.incidents
  };
}
function updateRide(store, id, changes) {
  const index = store.rides.findIndex((ride) => ride.id === id);
  if (index === -1) {
    const error = new Error("Ride not found");
    error.status = 404;
    throw error;
  }
  store.rides[index] = {
    ...store.rides[index],
    route: typeof changes.route === "string" ? changes.route : store.rides[index].route,
    date: typeof changes.date === "string" ? changes.date : store.rides[index].date
  };
  return store.rides[index];
}

// src/store.ts
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
var dataFile = resolve(process.cwd(), "data", "ridesafe-store.json");
async function readStore() {
  try {
    const raw = await readFile(dataFile, "utf8");
    return JSON.parse(raw);
  } catch {
    const seed = createSeedStore();
    await writeStore(seed);
    return seed;
  }
}
async function writeStore(store) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(store, null, 2));
}

// routes.ts
function asyncRoute(handler) {
  return (req, res) => {
    handler(req, res).catch((error) => {
      const status = Number.isInteger(error.status) ? error.status : 500;
      res.status(status).json({ message: error.message || "Request failed" });
    });
  };
}
function registerRoutes(app2) {
  app2.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "ridesafe-rewards-api" });
  });
  app2.get("/api/dashboard", asyncRoute(async (_req, res) => {
    const store = await readStore();
    res.json(buildDashboard(store));
  }));
  app2.get("/api/rides", asyncRoute(async (_req, res) => {
    const store = await readStore();
    res.json({ rides: store.rides });
  }));
  app2.post("/api/rides", asyncRoute(async (req, res) => {
    const store = await readStore();
    const ride = createRideFromInput(req.body);
    store.rides.unshift(ride);
    await writeStore(store);
    res.status(201).json({ ride, dashboard: buildDashboard(store) });
  }));
  app2.post("/api/score", asyncRoute(async (req, res) => {
    const store = await readStore();
    const ride = createRideFromInput(req.body);
    store.rides.unshift(ride);
    await writeStore(store);
    res.status(201).json({
      safetyScore: ride.score,
      tokensEarned: ride.tokensEarned,
      ride,
      dashboard: buildDashboard(store)
    });
  }));
  app2.post("/api/sample/ride", asyncRoute(async (_req, res) => {
    const store = await readStore();
    const ride = generateSampleRide();
    store.rides.unshift(ride);
    await writeStore(store);
    res.status(201).json({ ride, dashboard: buildDashboard(store) });
  }));
  app2.patch("/api/rides/:id", asyncRoute(async (req, res) => {
    const store = await readStore();
    const ride = updateRide(store, req.params.id, req.body);
    await writeStore(store);
    res.json({ ride, dashboard: buildDashboard(store) });
  }));
}

// index.ts
var app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json;
  let body;
  res.json = function jsonWithLog(value) {
    body = value;
    return originalJson.call(res, value);
  };
  res.on("finish", () => {
    if (!req.path.startsWith("/api")) return;
    const duration = Date.now() - start;
    const preview = body ? ` :: ${JSON.stringify(body)}` : "";
    const line = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms${preview}`;
    console.log(line.length > 180 ? `${line.slice(0, 179)}...` : line);
  });
  next();
});
var server = createServer(app);
registerRoutes(app);
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});
var port = Number.parseInt(process.env.PORT || "5000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`RideSafe Rewards API listening on http://localhost:${port}`);
});
