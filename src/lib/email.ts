import { sendEmail as _sendEmail } from "whop-kit/email";
import type { EmailProvider, SendEmailResult } from "whop-kit/email";
import { getConfig } from "./config";

export type { EmailProvider, SendEmailResult };

export async function sendEmail(options: { to: string; subject: string; html: string; from?: string }): Promise<SendEmailResult> {
  const [provider, apiKey, fromAddress] = await Promise.all([
    getConfig("email_provider"),
    getConfig("email_api_key"),
    getConfig("email_from_address"),
  ]);

  if (!provider || !apiKey) return { success: false, error: "Email not configured" };
  const from = options.from || fromAddress;
  if (!from) return { success: false, error: "No from address" };

  return _sendEmail({ provider: provider as EmailProvider, apiKey }, { ...options, from });
}
