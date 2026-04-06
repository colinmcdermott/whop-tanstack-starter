import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
    host: true,
  },
  optimizeDeps: {
    exclude: ["@prisma/client", ".prisma"],
  },
  ssr: {
    noExternal: ["whop-kit"],
  },
  plugins: [
    viteTsConfigPaths(),
    tanstackStart({
      react: {
        babel: {},
      },
    }),
    nitro(),
  ],
});
