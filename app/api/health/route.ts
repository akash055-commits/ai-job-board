import { prisma } from "@/lib/db";

export async function GET() {
  const jobs = await prisma.job.count();
  return Response.json({
    ok: true,
    jobs,
    timestamp: new Date().toISOString()
  });
}
