import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { registerRoutes } from "./routes";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json;
  let body: unknown;

  res.json = function jsonWithLog(value: unknown) {
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

const server = createServer(app);

registerRoutes(app);

app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

const port = Number.parseInt(process.env.PORT || "5000", 10);

server.listen(port, "0.0.0.0", () => {
  console.log(`RideSafe Rewards API listening on http://localhost:${port}`);
});
