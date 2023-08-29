import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { checkSessionIdExits } from "../middlewares/check-session-id-exits";
import { getParamsId } from "../middlewares/get-params-id";
import { prisma } from "../services/database";

export async function mealsRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const { sessionId } = request.cookies;

    const meals = await prisma.meal.findMany({
      where: {
        session_id: sessionId,
      },
    });

    return { meals };
  });
  app.get(
    "/summary",
    { preHandler: [checkSessionIdExits] },
    async (request) => {
      const { sessionId } = request.cookies;

      const meals = await prisma.meal.findMany({
        where: {
          session_id: sessionId,
        },
      });

      const total = meals.length;
      const totalInDiet = meals.filter((f) => f.isDiet).length;
      const totalOutDiet = meals.filter((f) => !f.isDiet).length;

      let bestSequence = 0;
      let aux = 0;

      for (const meal of meals) {
        if (aux > bestSequence) {
          bestSequence = aux;
        }

        if (meal.isDiet) {
          aux++;
        } else {
          aux = 0;
        }
      }

      return {
        total,
        totalInDiet,
        totalOutDiet,
        bestSequence,
      };
    }
  );
  app.get(
    "/:id",
    { preHandler: [getParamsId, checkSessionIdExits] },
    async (request) => {
      const { id } = request.params as { id: string };
      const { sessionId } = request.cookies;

      const meal = await prisma.meal.findFirst({
        where: {
          id,
          session_id: sessionId,
        },
      });

      return { meal };
    }
  );
  app.post(
    "/",
    { preHandler: [checkSessionIdExits] },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isDiet: z.boolean(),
      });

      const { name, description, isDiet } = createMealBodySchema.parse(
        request.body
      );

      let sessionId = request.cookies.sessionId;
      if (!sessionId) {
        sessionId = randomUUID();
        reply.cookie("sessionId", sessionId, {
          path: "/",
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });
      }

      await prisma.meal.create({
        data: {
          name,
          description,
          isDiet,
          session_id: sessionId,
        },
      });

      return reply.status(201).send();
    }
  );
  app.put("/:id", { preHandler: [getParamsId] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { sessionId } = request.cookies;

    const updateMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      isDiet: z.boolean().optional(),
    });

    const { name, description, isDiet } = updateMealBodySchema.parse(
      request.body
    );

    const alreadyExistsMeal = await prisma.meal.findFirst({
      where: {
        id,
        session_id: sessionId,
      },
    });

    if (!sessionId || !alreadyExistsMeal) {
      reply.status(401).send({ message: "Not authenticated" });
    }

    await prisma.meal.update({
      data: {
        name,
        description,
        isDiet,
      },
      where: {
        id,
      },
    });

    return reply.status(200).send();
  });
  app.delete("/:id", { preHandler: [getParamsId] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { sessionId } = request.cookies;

    const alreadyExistsMeal = await prisma.meal.findFirst({
      where: {
        id,
        session_id: sessionId,
      },
    });

    if (!sessionId || !alreadyExistsMeal) {
      reply.status(401).send({ message: "Not authenticated" });
    }

    await prisma.meal.delete({
      where: {
        id,
      },
    });

    return reply.status(200).send();
  });
}
