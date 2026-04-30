import { JobSource } from "@/lib/domain";
import { shouldUseDemoJobs } from "@/lib/jobs/adapters/mode";
import { scrapeGenericBoard } from "@/lib/jobs/adapters/shared";
import { sampleJobs } from "@/lib/jobs/sample-jobs";
import type { JobInput } from "@/lib/types";

export async function fetchLinkedInJobs(): Promise<JobInput[]> {
  if (shouldUseDemoJobs()) {
    return sampleJobs.filter((job) => job.source === JobSource.LINKEDIN);
  }

  if (process.env.SCRAPE_MODE !== "live") {
    return [];
  }

  return scrapeGenericBoard({
    source: JobSource.LINKEDIN,
    url:
      process.env.LINKEDIN_QUERY_URL ||
      "https://www.linkedin.com/jobs/search/?keywords=growth%20manager%20OR%20product%20manager"
  });
}
