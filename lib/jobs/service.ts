import { prisma } from "@/lib/db";
import { scoreJob } from "@/lib/ai/scoring";
import { ApplicationStatus, asApplicationStatus, asJobSource, asRoleType } from "@/lib/domain";
import { fetchAllJobs } from "@/lib/jobs/adapters";
import { verifyJobLink } from "@/lib/jobs/adapters/shared";
import { readJobsSnapshot, writeJobsSnapshot } from "@/lib/jobs/snapshot";
import type { DashboardJob, JobInput, ScoredJob } from "@/lib/types";

function createDedupeKey(job: JobInput) {
  const base = `${job.source}|${job.externalId || ""}|${job.title}|${job.company}|${job.applyLink}`
    .toLowerCase()
    .trim();
  return Buffer.from(base).toString("base64url").slice(0, 64);
}

async function normalizeAndScoreJobs(rawJobs: JobInput[]) {
  const uniqueJobs = new Map<string, JobInput>();

  for (const job of rawJobs) {
    const dedupeKey = createDedupeKey(job);
    if (!uniqueJobs.has(dedupeKey) && (await verifyJobLink(job.applyLink))) {
      uniqueJobs.set(dedupeKey, job);
    }
  }

  const scoredJobs: ScoredJob[] = [];
  for (const [dedupeKey, job] of uniqueJobs.entries()) {
    scoredJobs.push(await scoreJob(job, dedupeKey));
  }

  return scoredJobs.sort((left, right) => right.matchScore - left.matchScore);
}

export async function refreshJobs() {
  const rawJobs = await fetchAllJobs();
  const scoredJobs = await normalizeAndScoreJobs(rawJobs);

  let inserted = 0;
  let updated = 0;

  for (const job of scoredJobs) {
    const existing = await prisma.job.findUnique({
      where: {
        dedupeKey: job.dedupeKey
      },
      include: {
        action: true
      }
    });

    await prisma.job.upsert({
      where: {
        dedupeKey: job.dedupeKey
      },
      create: {
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        applyLink: job.applyLink,
        source: job.source,
        sourceLink: job.sourceLink,
        datePosted: job.datePosted,
        matchScore: job.matchScore,
        reasoning: job.reasoning,
        summary: job.summary,
        roleType: job.roleType,
        topMatch: job.topMatch,
        lowEffortHighFit: job.lowEffortHighFit,
        dedupeKey: job.dedupeKey,
        action: {
          create: {
            status: ApplicationStatus.NOT_APPLIED,
            saved: false
          }
        }
      },
      update: {
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        applyLink: job.applyLink,
        source: job.source,
        sourceLink: job.sourceLink,
        datePosted: job.datePosted,
        matchScore: job.matchScore,
        reasoning: job.reasoning,
        summary: job.summary,
        roleType: job.roleType,
        topMatch: job.topMatch,
        lowEffortHighFit: job.lowEffortHighFit
      }
    });

    if (existing) {
      updated += 1;
    } else {
      inserted += 1;
    }
  }

  const latestJobs = await getDashboardJobs();
  await writeJobsSnapshot(latestJobs);

  return {
    inserted,
    updated,
    total: scoredJobs.length
  };
}

export async function getDashboardJobs(): Promise<DashboardJob[]> {
  const jobs = await prisma.job.findMany({
    include: {
      action: true
    },
    orderBy: [{ matchScore: "desc" }, { datePosted: "desc" }]
  });

  const mappedJobs = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    applyLink: job.applyLink,
    source: asJobSource(job.source),
    datePosted: job.datePosted?.toISOString() ?? null,
    matchScore: job.matchScore,
    reasoning: job.reasoning,
    summary: job.summary,
    roleType: asRoleType(job.roleType),
    topMatch: job.topMatch,
    lowEffortHighFit: job.lowEffortHighFit,
    status: job.action?.status
      ? asApplicationStatus(job.action.status)
      : ApplicationStatus.NOT_APPLIED,
    saved: job.action?.saved ?? false
  }));

  if (mappedJobs.length > 0) {
    return mappedJobs;
  }

  return readJobsSnapshot();
}

export async function upsertDemoDataIfEmpty() {
  const count = await prisma.job.count();
  if (count === 0) {
    await refreshJobs();
  }
}
