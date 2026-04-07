import type { SupabaseClient } from "@supabase/supabase-js";

export function generateReferralCode(name: string): string {
  const prefix =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 6) || "USER";
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

export async function assignReferralCode(
  supabase: SupabaseClient,
  userId: string,
  userName: string
): Promise<string> {
  let code = generateReferralCode(userName);
  let attempts = 0;
  while (attempts < 5) {
    const { error } = await supabase
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", userId)
      .is("referral_code", null);
    if (!error) break;
    code = generateReferralCode(userName + attempts);
    attempts++;
  }
  return code;
}

export async function linkReferral(
  supabase: SupabaseClient,
  referredUserId: string,
  referralCode: string
): Promise<void> {
  const { data: referrer } = await supabase
    .from("profiles")
    .select("id")
    .eq("referral_code", referralCode)
    .single();

  if (!referrer || referrer.id === referredUserId) return;

  await supabase
    .from("referrals")
    .upsert(
      {
        referrer_id: referrer.id,
        referred_id: referredUserId,
        status: "pending",
      },
      { onConflict: "referred_id", ignoreDuplicates: true }
    );
}
