import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.number().default(4444),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error(
    "🚨 Invalid environment variable: " + JSON.stringify(_env, null, 2)
  );

  throw new Error("Invalid environment variable: " + _env);
}

export const env = _env.data;
