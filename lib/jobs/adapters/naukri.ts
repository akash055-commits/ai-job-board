import { JobSource } from "@/lib/domain";
import { shouldUseDemoJobs } from "@/lib/jobs/adapters/mode";
import { scrapeGenericBoard } from "@/lib/jobs/adapters/shared";
import { sampleJobs } from "@/lib/jobs/sample-jobs";
import type { JobInput } from "@/lib/types";

export async function fetchNaukriJobs(): Promise<JobInput[]> {
  if (shouldUseDemoJobs()) {
    return sampleJobs.filter((job) => job.source === JobSource.NAUKRI);
  }

  if (process.env.SCRAPE_MODE !== "live") {
    return [];
  }

  return scrapeGenericBoard({
    source: JobSource.NAUKRI,
    url:
      process.env.NAUKRI_QUERY_URL ||
      "https://www.naukri.com/growth-manager-jobs?k=growth%20manager"
  });
}
