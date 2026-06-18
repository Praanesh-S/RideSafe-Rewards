import type { TelemetryPoint } from "./types";

type UnknownRecord = Record<string, unknown>;

const numberFrom = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const boolFrom = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") return ["true", "1", "yes", "y"].includes(value.toLowerCase());
  return false;
};

function normalizePoint(row: UnknownRecord): TelemetryPoint {
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

function parseCsv(text: string): UnknownRecord[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return headers.reduce<UnknownRecord>((row, header, index) => {
      row[header] = values[index];
      return row;
    }, {});
  });
}

export function parseTelemetry(input: unknown): TelemetryPoint[] {
  if (Array.isArray(input)) {
    return input.map((item) => normalizePoint((item ?? {}) as UnknownRecord));
  }

  if (typeof input === "object" && input !== null) {
    const record = input as UnknownRecord;
    const nested = record.telemetry ?? record.samples ?? record.points ?? record.data;
    if (Array.isArray(nested)) {
      return nested.map((item) => normalizePoint((item ?? {}) as UnknownRecord));
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
