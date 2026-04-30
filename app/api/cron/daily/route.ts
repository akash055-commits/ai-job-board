import { refreshJobs } from "@/lib/jobs/service";

function authorized(request: Request) {
  const secret = process.env.JOB_REFRESH_SECRET;
  if (!secret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) {
    return true;
  }

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await refreshJobs();
  return Response.json({
    ranAt: new Date().toISOString(),
    ...result
  });
}
