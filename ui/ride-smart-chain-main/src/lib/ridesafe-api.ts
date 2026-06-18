export interface DashboardData {
  currentScore: number;
  stats: {
    totalRides: number;
    tokensEarned: number;
    currentStreak: number;
  };
  recentRides: Array<{
    id: string;
    date: string;
    duration: string;
    distance: string;
    score: number;
    tokensEarned: number;
    route: string;
  }>;
  leaderboard: Array<{
    rank: number;
    rider: string;
    score: number;
    tokens: number;
    rides: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: "shield" | "flame" | "target" | "zap";
    unlocked: boolean;
    progress?: number;
  }>;
}

export const emptyDashboard: DashboardData = {
  currentScore: 0,
  stats: {
    totalRides: 0,
    tokensEarned: 0,
    currentStreak: 0,
  },
  recentRides: [],
  leaderboard: [],
  achievements: [],
};

export const apiBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchDashboard() {
  return apiFetch<DashboardData>("/api/dashboard");
}

export async function uploadRideFile(file: File) {
  const rawText = await file.text();
  return apiFetch<{
    safetyScore: number;
    tokensEarned: number;
    dashboard: DashboardData;
  }>("/api/score", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      rawText,
      route: file.name.replace(/\.[^.]+$/, "") || "Uploaded Ride",
    }),
  });
}
