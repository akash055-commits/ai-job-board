import { refreshJobs } from "@/lib/jobs/service";

async function main() {
  const result = await refreshJobs();
  console.log("Seeded jobs:", result);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
