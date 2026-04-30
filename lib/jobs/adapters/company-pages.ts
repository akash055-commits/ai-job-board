import { JobSource } from "@/lib/domain";
import { shouldUseDemoJobs } from "@/lib/jobs/adapters/mode";
import { scrapeGenericBoard } from "@/lib/jobs/adapters/shared";
import { sampleJobs } from "@/lib/jobs/sample-jobs";
import type { JobInput } from "@/lib/types";

export async function fetchCompanyPageJobs(): Promise<JobInput[]> {
  if (shouldUseDemoJobs()) {
    return sampleJobs.filter((job) => job.source === JobSource.COMPANY_PAGE);
  }

  if (process.env.SCRAPE_MODE !== "live") {
    return [];
  }

  const urls = (process.env.COMPANY_CAREERS_URLS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const jobs = await Promise.all(
    urls.map((url) =>
      scrapeGenericBoard({
        source: JobSource.COMPANY_PAGE,
        url
      })
    )
  );

  return jobs.flat();
}
