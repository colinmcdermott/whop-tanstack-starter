import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    exclude: ["@prisma/client", ".prisma"],
  },
  plugins: [
    tanstackStart(),
  ],
});
