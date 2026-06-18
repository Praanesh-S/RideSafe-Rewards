import type { Express, Request, Response } from "express";
import { buildDashboard, createRideFromInput, updateRide } from "./src/rides";
import { generateSampleRide } from "./src/sampleData";
import { readStore, writeStore } from "./src/store";

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response) => {
    handler(req, res).catch((error) => {
      const status = Number.isInteger(error.status) ? error.status : 500;
      res.status(status).json({ message: error.message || "Request failed" });
    });
  };
}

export function registerRoutes(app: Express) {
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "ridesafe-rewards-api" });
  });

  app.get("/api/dashboard", asyncRoute(async (_req, res) => {
    const store = await readStore();
    res.json(buildDashboard(store));
  }));

  app.get("/api/rides", asyncRoute(async (_req, res) => {
    const store = await readStore();
    res.json({ rides: store.rides });
  }));

  app.post("/api/rides", asyncRoute(async (req, res) => {
    const store = await readStore();
    const ride = createRideFromInput(req.body);
    store.rides.unshift(ride);
    await writeStore(store);
    res.status(201).json({ ride, dashboard: buildDashboard(store) });
  }));

  app.post("/api/score", asyncRoute(async (req, res) => {
    const store = await readStore();
    const ride = createRideFromInput(req.body);
    store.rides.unshift(ride);
    await writeStore(store);
    res.status(201).json({
      safetyScore: ride.score,
      tokensEarned: ride.tokensEarned,
      ride,
      dashboard: buildDashboard(store),
    });
  }));

  app.post("/api/sample/ride", asyncRoute(async (_req, res) => {
    const store = await readStore();
    const ride = generateSampleRide();
    store.rides.unshift(ride);
    await writeStore(store);
    res.status(201).json({ ride, dashboard: buildDashboard(store) });
  }));

  app.patch("/api/rides/:id", asyncRoute(async (req, res) => {
    const store = await readStore();
    const ride = updateRide(store, req.params.id, req.body);
    await writeStore(store);
    res.json({ ride, dashboard: buildDashboard(store) });
  }));
}
