import { refreshJobs } from "@/lib/jobs/service";

export async function POST() {
  const result = await refreshJobs();
  return Response.json(result);
}
