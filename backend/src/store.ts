import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import type { Store } from "./types";
import { createSeedStore } from "./sampleData";

const dataFile = resolve(process.cwd(), "data", "ridesafe-store.json");

export async function readStore(): Promise<Store> {
  try {
    const raw = await readFile(dataFile, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    const seed = createSeedStore();
    await writeStore(seed);
    return seed;
  }
}

export async function writeStore(store: Store) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(store, null, 2));
}
