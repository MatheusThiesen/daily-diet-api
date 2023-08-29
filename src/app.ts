import cookie from "@fastify/cookie";
import Fastify from "fastify";
import { mealsRoutes } from "./routes/meals";

const app = Fastify();

app.register(cookie);

app.addHook("preHandler", (request, _reply, done) => {
  console.log(`[${request.method}] ${request.url}`);
  done();
});

app.register(mealsRoutes, { prefix: "meals" });

export { app };
