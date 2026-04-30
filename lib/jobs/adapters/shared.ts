import { chromium } from "playwright";
import type { JobSource } from "@/lib/domain";
import type { JobInput } from "@/lib/types";

type ScrapeArgs = {
  source: JobSource;
  url: string;
};

type ScrapedBoardJob = {
  title: string;
  company: string;
  location: string;
  description: string;
  applyLink: string;
  source: JobSource;
  sourceLink: string;
  datePosted: string;
};

export async function scrapeGenericBoard({ source, url }: ScrapeArgs): Promise<JobInput[]> {
  if (process.env.SCRAPE_MODE !== "live" || !url) {
    return [];
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45_000
    });

    await page.waitForTimeout(2_000);

    const jobs = await page.evaluate((jobSource) => {
      const clean = (value?: string | null) => value?.replace(/\s+/g, " ").trim() ?? "";

      const cards = Array.from(
        document.querySelectorAll(
          "article, li, .job, .job-card, .result, .job_seen_beacon, .jobTuple, .job-card-container"
        )
      ).slice(0, 20);

      return cards
        .map((card) => {
          const title =
            clean(
              card.querySelector("h1, h2, h3, [data-testid='job-title'], .title, .jobTitle span")?.textContent
            ) || "";
          const company =
            clean(
              card.querySelector("[data-testid='company-name'], .companyName, .company, .subtitle")?.textContent
            ) || "";
          const location =
            clean(
              card.querySelector("[data-testid='job-location'], .companyLocation, .location, .locWdth")?.textContent
            ) || "";
          const description =
            clean(card.querySelector(".description, .job-snippet, .job-desc, p, .job-description")?.textContent) ||
            "";
          const anchor = card.querySelector("a") as HTMLAnchorElement | null;
          const applyLink = anchor?.href || "";

          if (!title || !company || !applyLink) {
            return null;
          }

          return {
            title,
            company,
            location,
            description,
            applyLink,
            source: jobSource,
            sourceLink: window.location.href,
            datePosted: new Date().toISOString()
          };
        })
        .filter((job): job is ScrapedBoardJob => Boolean(job));
    }, source);

    return jobs.map((job) => ({
      ...job,
      location: job.location || null,
      source,
      sourceLink: job.sourceLink || url,
      datePosted: job.datePosted ? new Date(job.datePosted) : new Date()
    })) as JobInput[];
  } catch {
    return [];
  } finally {
    await browser.close();
  }
}

export async function verifyJobLink(link: string) {
  if (process.env.VERIFY_LINKS !== "true") {
    return true;
  }

  try {
    const response = await fetch(link, {
      method: "HEAD",
      redirect: "follow",
      cache: "no-store"
    });
    return response.ok;
  } catch {
    return false;
  }
}
