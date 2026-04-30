import { JobSource } from "@/lib/domain";
import { shouldUseDemoJobs } from "@/lib/jobs/adapters/mode";
import { scrapeGenericBoard } from "@/lib/jobs/adapters/shared";
import { sampleJobs } from "@/lib/jobs/sample-jobs";
import type { JobInput } from "@/lib/types";

export async function fetchWellfoundJobs(): Promise<JobInput[]> {
  if (shouldUseDemoJobs()) {
    return sampleJobs.filter((job) => job.source === JobSource.WELLFOUND);
  }

  if (process.env.SCRAPE_MODE !== "live") {
    return [];
  }

  return scrapeGenericBoard({
    source: JobSource.WELLFOUND,
    url:
      process.env.WELLFOUND_QUERY_URL ||
      "https://wellfound.com/jobs?query=growth%20manager"
  });
}
