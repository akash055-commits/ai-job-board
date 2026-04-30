import { enhanceJobNarrative } from "@/lib/ai/llm";
import { RoleType } from "@/lib/domain";
import { userProfile } from "@/lib/ai/profile";
import type { JobInput, ScoredJob } from "@/lib/types";

const roleKeywordMap: Record<RoleType, string[]> = {
  GROWTH: ["growth", "acquisition", "retention", "crm", "demand generation", "lifecycle"],
  PRODUCT: ["product manager", "pm", "product growth", "roadmap", "user research", "feature"],
  MARKETING: ["performance marketing", "paid media", "meta ads", "google ads", "marketing"],
  FOUNDERS_OFFICE: ["founder's office", "chief of staff", "special projects", "strategy"],
  OPERATIONS: ["operations", "business ops", "revenue ops", "go-to-market ops"],
  OTHER: []
};

const positiveSignals = [
  "startup",
  "early stage",
  "0-1",
  "ownership",
  "cross-functional",
  "experiment",
  "builder",
  "consumer",
  "marketplace",
  "saas",
  "ai"
];

const locationSignals = ["gurugram", "delhi", "ncr", "bengaluru", "bangalore", "remote", "hybrid"];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function countMatches(text: string, terms: string[]) {
  return terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);
}

function inferRoleType(text: string): RoleType {
  const scored = Object.entries(roleKeywordMap)
    .filter(([role]) => role !== "OTHER")
    .map(([role, keywords]) => ({
      role: role as RoleType,
      score: countMatches(text, keywords)
    }))
    .sort((left, right) => right.score - left.score);

  return scored[0]?.score ? scored[0].role : RoleType.OTHER;
}

function computeRoleFit(text: string, roleType: RoleType) {
  const directRoleHits = countMatches(text, userProfile.targetRoles.map((role) => role.toLowerCase()));
  const typeHits = countMatches(text, roleKeywordMap[roleType]);
  return Math.min(32, directRoleHits * 8 + typeHits * 5);
}

function computeSkillFit(text: string) {
  const skillHits = countMatches(text, userProfile.skills);
  return Math.min(26, skillHits * 3);
}

function computeEnvironmentFit(text: string) {
  const industryHits = countMatches(text, userProfile.industries);
  const positiveHits = countMatches(text, positiveSignals);
  const avoidHits = countMatches(text, userProfile.avoidSignals);
  return Math.max(0, Math.min(18, industryHits * 3 + positiveHits * 2 - avoidHits * 6));
}

function computeSeniorityFit(text: string) {
  const positive = countMatches(text, userProfile.seniorityRange);
  const juniorPenalty = countMatches(text, ["intern", "internship", "fresher", "junior", "entry level"]);
  return Math.max(0, Math.min(14, positive * 3 - juniorPenalty * 4));
}

function computeLocationFit(text: string) {
  const hits = countMatches(text, locationSignals);
  return Math.min(10, hits * 2);
}

function buildHeuristicNarrative(job: JobInput, roleType: RoleType, score: number) {
  const text = normalizeText(`${job.title} ${job.company} ${job.location ?? ""} ${job.description}`);
  const reasons: string[] = [];

  if (countMatches(text, roleKeywordMap[roleType]) > 0) {
    reasons.push(`${job.title} maps strongly to ${roleType.toLowerCase().replaceAll("_", " ")} work`);
  }

  if (countMatches(text, ["meta ads", "google ads", "performance marketing", "crm", "experimentation"]) > 0) {
    reasons.push("the job overlaps with Akash's strongest growth and MarTech skill cluster");
  }

  if (countMatches(text, ["startup", "ownership", "0-1", "builder", "cross-functional"]) > 0) {
    reasons.push("the environment signals high ownership and startup-style execution");
  }

  if (reasons.length === 0) {
    reasons.push("the title, scope, and industry are directionally aligned with Akash's growth/product trajectory");
  }

  const summary =
    score >= 85
      ? "High-fit role with clear overlap in growth ownership, product thinking, and measurable business impact."
      : score >= 70
        ? "Solid match that overlaps with Akash's growth and product toolkit, with a few softer-fit areas."
        : "Interesting but partial match; worth reviewing if the company or scope is especially attractive.";

  return {
    summary,
    reasoning: reasons.slice(0, 3).join("; ")
  };
}

export async function scoreJob(job: JobInput, dedupeKey: string): Promise<ScoredJob> {
  const text = normalizeText(`${job.title} ${job.company} ${job.location ?? ""} ${job.description}`);
  const roleType = inferRoleType(text);
  const roleFit = computeRoleFit(text, roleType);
  const skillFit = computeSkillFit(text);
  const environmentFit = computeEnvironmentFit(text);
  const seniorityFit = computeSeniorityFit(text);
  const locationFit = computeLocationFit(text);
  const baseScore = Math.max(28, Math.min(100, roleFit + skillFit + environmentFit + seniorityFit + locationFit));
  const heuristic = buildHeuristicNarrative(job, roleType, baseScore);
  const llm = await enhanceJobNarrative(job);

  return {
    ...job,
    dedupeKey,
    roleType,
    matchScore: baseScore,
    summary: llm?.summary ?? heuristic.summary,
    reasoning: llm?.reasoning ?? heuristic.reasoning,
    topMatch: baseScore >= 85,
    lowEffortHighFit:
      baseScore >= 80 &&
      countMatches(text, ["apply now", "easy apply", "quick apply", "direct apply", "1 click"]) > 0
  };
}
