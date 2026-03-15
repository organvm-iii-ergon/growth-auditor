import { getConfig } from "@/lib/config";

export interface WebhookPayload {
  event: "audit.completed" | "lead.captured" | "comparison.completed";
  timestamp: string;
  data: Record<string, unknown>;
}

export async function sendWebhook(payload: WebhookPayload): Promise<boolean> {
  const webhookUrl = getConfig("webhookUrl");
  if (!webhookUrl) return false;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "GrowthAuditor/1.0",
        "X-Webhook-Event": payload.event,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      console.error(`Webhook failed: ${response.status} ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Webhook error:", error);
    return false;
  }
}

export async function sendAuditWebhook(auditData: {
  id: string;
  link: string;
  businessType: string;
  goals: string;
  scores: Record<string, number>;
  userEmail?: string;
}): Promise<boolean> {
  return sendWebhook({
    event: "audit.completed",
    timestamp: new Date().toISOString(),
    data: auditData,
  });
}

export async function sendLeadWebhook(leadData: {
  email: string;
  auditId?: string;
  source: string;
}): Promise<boolean> {
  return sendWebhook({
    event: "lead.captured",
    timestamp: new Date().toISOString(),
    data: leadData,
  });
}
