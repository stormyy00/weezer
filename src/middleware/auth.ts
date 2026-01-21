import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw redirect({ to: "/adminlogin" });
  }

  return await next();
});

export const isAdmin = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session || session.user.role !== "admin") {
    await auth.api.signOut({ headers });
    console.error("User data breach attempt detected:", session?.user);
    throw redirect({ to: "/adminlogin" });
  }

  return await next();
});

export const authenticate = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session || session.user.role !== "admin") {
    await auth.api.signOut({ headers });
    throw redirect({ to: "/adminlogin" });
  }

  return await next({
    context: {
      userId: session.user.id,
      user: session.user,
    },
  });
});

