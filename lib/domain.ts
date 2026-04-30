export const JOB_SOURCES = [
  "SERPAPI",
  "LINKEDIN",
  "INDEED",
  "NAUKRI",
  "INSTAHYRE",
  "WELLFOUND",
  "COMPANY_PAGE"
] as const;

export const ROLE_TYPES = [
  "GROWTH",
  "PRODUCT",
  "MARKETING",
  "FOUNDERS_OFFICE",
  "OPERATIONS",
  "OTHER"
] as const;

export const APPLICATION_STATUSES = [
  "NOT_APPLIED",
  "APPLIED",
  "REJECTED",
  "SAVED"
] as const;

export type JobSource = (typeof JOB_SOURCES)[number];
export type RoleType = (typeof ROLE_TYPES)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const JobSource = Object.freeze(
  JOB_SOURCES.reduce(
    (accumulator, value) => ({ ...accumulator, [value]: value }),
    {} as Record<JobSource, JobSource>
  )
);

export const RoleType = Object.freeze(
  ROLE_TYPES.reduce(
    (accumulator, value) => ({ ...accumulator, [value]: value }),
    {} as Record<RoleType, RoleType>
  )
);

export const ApplicationStatus = Object.freeze(
  APPLICATION_STATUSES.reduce(
    (accumulator, value) => ({ ...accumulator, [value]: value }),
    {} as Record<ApplicationStatus, ApplicationStatus>
  )
);

export function asJobSource(value: string): JobSource {
  return JOB_SOURCES.includes(value as JobSource) ? (value as JobSource) : JobSource.COMPANY_PAGE;
}

export function asRoleType(value: string): RoleType {
  return ROLE_TYPES.includes(value as RoleType) ? (value as RoleType) : RoleType.OTHER;
}

export function asApplicationStatus(value: string): ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : ApplicationStatus.NOT_APPLIED;
}
