import twilio from "twilio";

let _client: ReturnType<typeof twilio> | null = null;

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
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;
  if (!fromPhone) {
    console.error("[SMS] TWILIO_PHONE_NUMBER not configured");
    return false;
  }

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
