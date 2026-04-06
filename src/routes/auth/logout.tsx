import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie } from "@tanstack/react-start/server";

const performLogout = createServerFn({ method: "GET" }).handler(async () => {
  deleteCookie("session");
  deleteCookie("logged_in");
  throw redirect({ to: "/" });
});

export const Route = createFileRoute("/auth/logout")({
  beforeLoad: async () => {
    await performLogout();
  },
  component: () => <p>Signing out...</p>,
});
