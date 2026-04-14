import { Resend } from "resend";
import { env, isResendConfigured } from "@/lib/env";

let resendClient: Resend | null = null;

export function getResendClient() {
  if (!isResendConfigured()) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(env.resendApiKey);
  }

  return resendClient;
}
