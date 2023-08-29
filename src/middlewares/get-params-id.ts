import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { z } from "zod";

export function getParamsId(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  const getMealParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const _getMealParamsSchema = getMealParamsSchema.safeParse(request.params);

  if (_getMealParamsSchema.success === false) {
    return reply.status(400).send();
  }

  request.params = _getMealParamsSchema.data;

  done();
}
