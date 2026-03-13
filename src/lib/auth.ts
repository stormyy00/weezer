import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "./env";
import { db } from "@/db";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),

	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID!,
			clientSecret: env.GOOGLE_CLIENT_SECRET!,
		},
	},

	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},
	plugins: [tanstackStartCookies(), jwt()], // make sure this is the last plugin in the array

	user: {
		additionalFields: {
			role: {
				type: ["user", "admin"],
				required: false,
				defaultValue: "user",
				input: false,
			},
		},
	},
});
