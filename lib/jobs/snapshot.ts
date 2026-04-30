import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DashboardJob } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const JOBS_SNAPSHOT_PATH = path.join(DATA_DIR, "jobs.snapshot.json");
const METADATA_PATH = path.join(DATA_DIR, "jobs.snapshot.meta.json");

type SnapshotMetadata = {
  generatedAt: string;
  total: number;
  source: "github-repo-snapshot";
};

export async function writeJobsSnapshot(jobs: DashboardJob[]) {
  await mkdir(DATA_DIR, { recursive: true });

  const metadata: SnapshotMetadata = {
    generatedAt: new Date().toISOString(),
    total: jobs.length,
    source: "github-repo-snapshot"
  };

  await writeFile(JOBS_SNAPSHOT_PATH, JSON.stringify(jobs, null, 2));
  await writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2));
}

export async function readJobsSnapshot(): Promise<DashboardJob[]> {
  try {
    const contents = await readFile(JOBS_SNAPSHOT_PATH, "utf8");
    return JSON.parse(contents) as DashboardJob[];
  } catch {
    return [];
  }
}
