import { createConfigManager } from "whop-kit/config";
import { prisma } from "../../db/index";
import { prismaConfigStore } from "./adapters/prisma";

const ENV_MAP: Record<string, string> = {
  whop_app_id: "WHOP_APP_ID",
  whop_api_key: "WHOP_API_KEY",
  whop_webhook_secret: "WHOP_WEBHOOK_SECRET",
  app_url: "APP_URL",
};

const configManager = createConfigManager({
  store: prismaConfigStore(prisma),
  envMap: ENV_MAP,
});

export const getConfig = configManager.get;
export const setConfig = configManager.set;
