import { JobSource } from "@/lib/domain";
import { shouldUseDemoJobs } from "@/lib/jobs/adapters/mode";
import { scrapeGenericBoard } from "@/lib/jobs/adapters/shared";
import { sampleJobs } from "@/lib/jobs/sample-jobs";
import type { JobInput } from "@/lib/types";

export async function fetchInstahyreJobs(): Promise<JobInput[]> {
  if (shouldUseDemoJobs()) {
    return sampleJobs.filter((job) => job.source === JobSource.INSTAHYRE);
  }

  if (process.env.SCRAPE_MODE !== "live") {
    return [];
  }

  return scrapeGenericBoard({
    source: JobSource.INSTAHYRE,
    url:
      process.env.INSTAHYRE_QUERY_URL ||
      "https://www.instahyre.com/candidate/opportunities/?skills=growth%20product"
  });
}
