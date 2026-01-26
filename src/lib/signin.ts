import type { ErrorContext } from "better-auth/react";
import { signIn } from "./auth-client";

export const SignInProvider = async (provider: string, callbackURL: string) =>
	await signIn.social(
		{
			provider: provider,
			callbackURL: callbackURL,
		},
		{
			onSuccess: async () => {},
			onError: (ctx: ErrorContext) => {
				alert({
					title: "Something went wrong",
					description: ctx.error.message ?? "Something went wrong.",
					variant: "destructive",
				});
			},
		},
	);
