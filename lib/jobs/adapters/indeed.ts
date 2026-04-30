import { JobSource } from "@/lib/domain";
import { shouldUseDemoJobs } from "@/lib/jobs/adapters/mode";
import { scrapeGenericBoard } from "@/lib/jobs/adapters/shared";
import { sampleJobs } from "@/lib/jobs/sample-jobs";
import type { JobInput } from "@/lib/types";

export async function fetchIndeedJobs(): Promise<JobInput[]> {
  if (shouldUseDemoJobs()) {
    return sampleJobs.filter((job) => job.source === JobSource.INDEED);
  }

  if (process.env.SCRAPE_MODE !== "live") {
    return [];
  }

  return scrapeGenericBoard({
    source: JobSource.INDEED,
    url:
      process.env.INDEED_QUERY_URL ||
      "https://www.indeed.com/jobs?q=growth+manager+or+product+manager&fromage=3"
  });
}
