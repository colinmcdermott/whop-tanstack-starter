import { createRootRoute, Outlet, ScrollRestoration } from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/react-start";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: APP_DESCRIPTION },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <Meta />
      </head>
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: "#18181b", background: "#fafafa" }}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
