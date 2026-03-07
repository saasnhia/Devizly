import { createServerClient } from "@supabase/ssr";

const MAX_ACCOUNTS_PER_IP_PER_WEEK = 2;

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function checkSignupAbuse(ip: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const supabase = createServiceClient();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { count } = await supabase
    .from("signup_ips")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("created_at", oneWeekAgo.toISOString());

  if ((count ?? 0) >= MAX_ACCOUNTS_PER_IP_PER_WEEK) {
    return {
      allowed: false,
      reason: "Trop de comptes créés depuis cette adresse. Réessayez plus tard.",
    };
  }

  return { allowed: true };
}

export async function recordSignupIp(ip: string, userId: string) {
  const supabase = createServiceClient();
  await supabase.from("signup_ips").insert({ ip_address: ip, user_id: userId });
  await supabase
    .from("profiles")
    .update({ ip_created: ip })
    .eq("id", userId);
}
