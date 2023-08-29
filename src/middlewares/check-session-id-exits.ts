import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'

export function checkSessionIdExits(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    reply.status(401).send({
      error: 'Unauthorized',
    })
  }

  done()
}
