import { DashboardClient } from "@/app/components/dashboard-client";
import { getDashboardJobs, upsertDemoDataIfEmpty } from "@/lib/jobs/service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await upsertDemoDataIfEmpty();
  const jobs = await getDashboardJobs();

  return <DashboardClient initialJobs={jobs} />;
}
