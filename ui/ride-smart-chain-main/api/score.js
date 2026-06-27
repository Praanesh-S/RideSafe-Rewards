import { buildDashboard, createRideFromInput, makeStore } from "./_ridesafe.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const ride = createRideFromInput(req.body);
  const dashboard = buildDashboard(makeStore([ride]));

  res.status(201).json({
    safetyScore: ride.score,
    tokensEarned: ride.tokensEarned,
    ride,
    dashboard,
  });
}
