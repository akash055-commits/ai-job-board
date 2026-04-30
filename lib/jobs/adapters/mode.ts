export function shouldUseDemoJobs() {
  const scrapeMode = process.env.SCRAPE_MODE || "demo";
  const serpApiEnabled = process.env.SERPAPI_ENABLE === "true" && Boolean(process.env.SERPAPI_API_KEY);

  return scrapeMode !== "live" && !serpApiEnabled;
}
