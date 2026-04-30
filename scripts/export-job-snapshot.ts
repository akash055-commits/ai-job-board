import { getDashboardJobs, refreshJobs } from "@/lib/jobs/service";

async function main() {
  const result = await refreshJobs();
  const jobs = await getDashboardJobs();

  console.log(
    JSON.stringify(
      {
        refresh: result,
        snapshotJobs: jobs.length
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
