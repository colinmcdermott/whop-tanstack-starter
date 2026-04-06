import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
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
        babel: {}, // let tanstackStart handle React
      },
    }),
  ],
});
