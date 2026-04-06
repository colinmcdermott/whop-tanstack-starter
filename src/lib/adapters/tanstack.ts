import type { CookieAdapter } from "whop-kit/auth";

/**
 * Create a cookie adapter from a raw cookie header string.
 * Used in TanStack Start server handlers where we only have the request.
 */
export function requestCookieAdapter(cookieHeader: string): CookieAdapter {
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...rest] = c.trim().split("=");
      return [key, rest.join("=")];
    }),
  );

  return {
    get(name: string) {
      return cookies[name];
    },
    set() {
      // Server handlers set cookies via response headers, not adapter
    },
    delete() {
      // Server handlers delete cookies via response headers
    },
  };
}
