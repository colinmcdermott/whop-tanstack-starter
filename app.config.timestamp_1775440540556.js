// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import viteTsConfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  vite: {
    plugins: [
      viteTsConfigPaths({ projects: ["./tsconfig.json"] })
    ]
  },
  tsr: {
    appDirectory: "./app",
    routesDirectory: "./app/routes",
    generatedRouteTree: "./app/routeTree.gen.ts"
  }
});
export {
  app_config_default as default
};
