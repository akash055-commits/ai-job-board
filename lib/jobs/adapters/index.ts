import type { JobInput } from "@/lib/types";
import { fetchCompanyPageJobs } from "@/lib/jobs/adapters/company-pages";
import { fetchIndeedJobs } from "@/lib/jobs/adapters/indeed";
import { fetchInstahyreJobs } from "@/lib/jobs/adapters/instahyre";
import { fetchLinkedInJobs } from "@/lib/jobs/adapters/linkedin";
import { fetchNaukriJobs } from "@/lib/jobs/adapters/naukri";
import { fetchSerpApiJobs } from "@/lib/jobs/adapters/serpapi";
import { fetchWellfoundJobs } from "@/lib/jobs/adapters/wellfound";

export async function fetchAllJobs(): Promise<JobInput[]> {
  const sources = await Promise.allSettled([
    fetchSerpApiJobs(),
    fetchLinkedInJobs(),
    fetchIndeedJobs(),
    fetchNaukriJobs(),
    fetchInstahyreJobs(),
    fetchWellfoundJobs(),
    fetchCompanyPageJobs()
  ]);

  return sources.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}
