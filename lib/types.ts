import type { ApplicationStatus, JobSource, RoleType } from "@/lib/domain";

export type JobInput = {
  title: string;
  company: string;
  location?: string | null;
  description: string;
  applyLink: string;
  source: JobSource;
  sourceLink?: string | null;
  externalId?: string | null;
  datePosted?: Date | null;
};

export type ScoredJob = JobInput & {
  dedupeKey: string;
  matchScore: number;
  reasoning: string;
  summary: string;
  roleType: RoleType;
  topMatch: boolean;
  lowEffortHighFit: boolean;
};

export type DashboardJob = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string;
  applyLink: string;
  source: JobSource;
  datePosted: string | null;
  matchScore: number;
  reasoning: string;
  summary: string | null;
  roleType: RoleType;
  topMatch: boolean;
  lowEffortHighFit: boolean;
  status: ApplicationStatus;
  saved: boolean;
};
