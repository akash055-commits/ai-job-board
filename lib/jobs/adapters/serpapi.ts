import { JobSource } from "@/lib/domain";
import type { JobInput } from "@/lib/types";

type SerpApiApplyOption = {
  title?: string;
  link?: string;
};

type SerpApiJob = {
  job_id?: string;
  title?: string;
  company_name?: string;
  location?: string;
  description?: string;
  share_link?: string;
  source_link?: string;
  via?: string;
  apply_options?: SerpApiApplyOption[];
  detected_extensions?: {
    posted_at?: string;
  };
};

type SerpApiResponse = {
  jobs_results?: SerpApiJob[];
  serpapi_pagination?: {
    next_page_token?: string;
  };
  search_metadata?: {
    status?: string;
  };
};

const DEFAULT_LOCATIONS = ["Gurugram, Haryana, India", "Bengaluru, Karnataka, India", "Remote"];
const DEFAULT_QUERIES = [
  "growth manager startup",
  "performance marketing manager meta google",
  "growth product manager",
  "product manager growth",
  "founder's office growth",
  "growth associate high ownership"
];

function getConfiguredLocations() {
  const configured = (process.env.SERPAPI_LOCATIONS || "")
    .split("||")
    .map((value) => value.trim())
    .filter(Boolean);

  return configured.length > 0 ? configured : DEFAULT_LOCATIONS;
}

function getConfiguredQueries() {
  const configured = (process.env.SERPAPI_QUERIES || "")
    .split("||")
    .map((value) => value.trim())
    .filter(Boolean);

  return configured.length > 0 ? configured : DEFAULT_QUERIES;
}

function parsePostedAt(value?: string) {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().trim();
  const now = new Date();

  if (normalized.includes("today") || normalized.includes("just")) {
    return now;
  }

  if (normalized.includes("yesterday")) {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  const match = normalized.match(/(\d+)\s+(hour|day|week|month)/);
  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000
  };

  return new Date(now.getTime() - amount * multipliers[unit]);
}

function buildQueryPairs() {
  const queries = getConfiguredQueries();
  const locations = getConfiguredLocations();
  const pairs: Array<{ query: string; location?: string }> = [];

  for (const query of queries) {
    for (const location of locations) {
      if (location.toLowerCase() === "remote") {
        pairs.push({ query: `${query} remote` });
        continue;
      }

      pairs.push({ query, location });
    }
  }

  return pairs;
}

async function fetchSerpApiPage({
  apiKey,
  query,
  location,
  nextPageToken
}: {
  apiKey: string;
  query: string;
  location?: string;
  nextPageToken?: string;
}) {
  const baseUrl = process.env.SERPAPI_BASE_URL || "https://serpapi.com/search.json";
  const params = new URLSearchParams({
    engine: process.env.SERPAPI_ENGINE || "google_jobs",
    api_key: apiKey,
    q: query,
    google_domain: process.env.SERPAPI_GOOGLE_DOMAIN || "google.com",
    gl: process.env.SERPAPI_GL || "in",
    hl: process.env.SERPAPI_HL || "en"
  });

  if (location) {
    params.set("location", location);
  }

  if (process.env.SERPAPI_NO_CACHE === "true") {
    params.set("no_cache", "true");
  }

  if (nextPageToken) {
    params.set("next_page_token", nextPageToken);
  }

  const response = await fetch(`${baseUrl}?${params.toString()}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SerpApi request failed with status ${response.status}: ${text}`);
  }

  return (await response.json()) as SerpApiResponse;
}

function normalizeSerpApiJob(job: SerpApiJob, query: string, location?: string): JobInput | null {
  const title = job.title?.trim();
  const company = job.company_name?.trim();
  const applyLink = job.apply_options?.find((option) => option.link)?.link || job.share_link;

  if (!title || !company || !applyLink) {
    return null;
  }

  return {
    title,
    company,
    location: job.location?.trim() || location,
    description: job.description?.trim() || `Listed via ${job.via || "Google Jobs"} for query "${query}".`,
    applyLink,
    source: JobSource.SERPAPI,
    sourceLink: job.source_link || job.share_link || applyLink,
    externalId: job.job_id || null,
    datePosted: parsePostedAt(job.detected_extensions?.posted_at)
  };
}

export async function fetchSerpApiJobs(): Promise<JobInput[]> {
  if (process.env.SERPAPI_ENABLE !== "true") {
    return [];
  }

  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return [];
  }

  const maxPages = Math.max(1, Number(process.env.SERPAPI_MAX_PAGES || "1"));
  const pairs = buildQueryPairs();
  const jobs: JobInput[] = [];

  for (const pair of pairs) {
    let nextPageToken: string | undefined;

    try {
      for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
        const payload = await fetchSerpApiPage({
          apiKey,
          query: pair.query,
          location: pair.location,
          nextPageToken
        });

        const normalizedJobs = (payload.jobs_results || [])
          .map((job) => normalizeSerpApiJob(job, pair.query, pair.location))
          .filter(Boolean) as JobInput[];

        jobs.push(...normalizedJobs);

        nextPageToken = payload.serpapi_pagination?.next_page_token;
        if (!nextPageToken) {
          break;
        }
      }
    } catch (error) {
      console.error(`SerpApi pair failed for query "${pair.query}" and location "${pair.location ?? "none"}":`, error);
    }
  }

  return jobs;
}
