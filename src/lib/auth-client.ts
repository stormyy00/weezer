import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";
import { lastLoginMethodClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
	plugins: [lastLoginMethodClient(), jwtClient()],
});

export const { useSession, signIn, signOut, getLastUsedLoginMethod } =
	authClient;
