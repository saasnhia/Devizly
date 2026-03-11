import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const revalidate = 3600;

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { count } = await supabase
      .from("quotes")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({ quotes_count: count ?? 0 });
  } catch {
    return NextResponse.json({ quotes_count: 0 });
  }
}
