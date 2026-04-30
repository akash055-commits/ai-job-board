import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApplicationStatus, APPLICATION_STATUSES } from "@/lib/domain";

const bodySchema = z.object({
  status: z.enum(APPLICATION_STATUSES)
});

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  const body = bodySchema.parse(await request.json());

  const action = await prisma.userAction.upsert({
    where: {
      jobId: context.params.id
    },
    create: {
      jobId: context.params.id,
      status: body.status,
      saved: body.status === ApplicationStatus.SAVED
    },
    update: {
      status: body.status,
      saved: body.status === ApplicationStatus.SAVED,
      lastTouchedAt: new Date()
    }
  });

  return Response.json(action);
}
