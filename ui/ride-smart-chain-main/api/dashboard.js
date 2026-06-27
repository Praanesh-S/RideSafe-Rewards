import { buildDashboard, makeStore } from "./_ridesafe.js";

export default function handler(_req, res) {
  res.status(200).json(buildDashboard(makeStore()));
}
