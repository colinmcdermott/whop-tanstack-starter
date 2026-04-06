import type { CookieAdapter, CookieOptions } from "whop-kit/auth";
import { getCookie, setCookie, deleteCookie } from "vinxi/http";

/**
 * Cookie adapter for TanStack Start using vinxi/http.
 */
export function tanstackCookieAdapter(): CookieAdapter {
  return {
    get(name: string) {
      return getCookie(name);
    },
    set(name: string, value: string, options: CookieOptions) {
      setCookie(name, value, {
        httpOnly: options.httpOnly,
        secure: options.secure,
        sameSite: options.sameSite,
        maxAge: options.maxAge,
        path: options.path,
      });
    },
    delete(name: string) {
      deleteCookie(name);
    },
  };
}
