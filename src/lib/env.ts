import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	/*
	 * Serverside Environment variables, not available on the client.
	 * Will throw if you access these variables on the client.
	 */
	server: {
		DATABASE_URL: z.string().url(),
		BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
		BETTER_AUTH_SECRET: z.string().min(1),
		GOOGLE_CLIENT_ID: z.string().optional(),
		GOOGLE_CLIENT_SECRET: z.string().optional(),
		R2_ACCESS_KEY_ID: z.string().min(1),
		R2_SECRET_ACCESS_KEY: z.string().min(1),
		R2_BUCKET_NAME: z.string().min(1),
		R2_ACCOUNT_ID: z.string().min(1),
		R2_ENDPOINT: z.string().url().default("https://s3.amazonaws.com"),
	},
	/*
	 * Environment variables available on the client (and server).
	 *
	 * 💡 You'll get type errors if these are not prefixed with PUBLIC_.
	 */
	clientPrefix: "VITE_",
	client: {
		VITE_BASE_URL: z.string().url().default("http://localhost:3000"),
	},
	/*
	 * Specify what values should be validated by your schemas above.
	 */
	runtimeEnv: process.env,
});
