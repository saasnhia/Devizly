/**
 * Twilio SMS integration for quote reminders (J+7).
 *
 * Setup:
 * 1. Create an account at https://twilio.com
 * 2. Buy a French phone number (+33…) in Console > Phone Numbers
 * 3. Copy Account SID & Auth Token from Console > Account Info
 * 4. Set environment variables:
 *    - TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *    - TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *    - TWILIO_PHONE_NUMBER=+33xxxxxxxxx
 *
 * If these variables are absent, SMS sending is silently skipped (no crash).
 */
import twilio from "twilio";

let _client: ReturnType<typeof twilio> | null = null;

const twilioConfigured =
  !!process.env.TWILIO_ACCOUNT_SID &&
  !!process.env.TWILIO_AUTH_TOKEN &&
  !!process.env.TWILIO_PHONE_NUMBER;

export function getTwilioClient() {
  if (!_client) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
    }
    _client = twilio(accountSid, authToken);
  }
  return _client;
}

const SMS_LIMITS: Record<string, number> = {
  free: 0,
  pro: 10,
  business: -1, // unlimited
};

export function getSmsLimit(plan: string): number {
  return SMS_LIMITS[plan] ?? 0;
}

export function canSendSms(plan: string, smsUsed: number): boolean {
  const limit = getSmsLimit(plan);
  if (limit === -1) return true; // unlimited
  return smsUsed < limit;
}

export async function sendSms(to: string, body: string): Promise<boolean> {
  if (!twilioConfigured) {
    console.info("[SMS] Twilio not configured — skipping SMS send");
    return false;
  }

  const fromPhone = process.env.TWILIO_PHONE_NUMBER!;

  try {
    const client = getTwilioClient();
    await client.messages.create({
      body,
      from: fromPhone,
      to,
    });
    return true;
  } catch (error) {
    console.error("[SMS] Send failed:", error);
    return false;
  }
}
