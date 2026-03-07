import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

const MAX_SIZE = 500_000; // 500KB max for base64 logo

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { logo_url } = body;

  if (!logo_url) {
    // Delete logo
    const service = createServiceClient();
    await service
      .from("profiles")
      .update({ logo_url: null })
      .eq("id", user.id);
    return NextResponse.json({ success: true });
  }

  if (typeof logo_url !== "string" || !logo_url.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "Format invalide. Envoyez une image PNG ou JPEG." },
      { status: 400 }
    );
  }

  if (logo_url.length > MAX_SIZE) {
    return NextResponse.json(
      { error: "Logo trop volumineux (500KB max)" },
      { status: 400 }
    );
  }

  const service = createServiceClient();
  const { error } = await service
    .from("profiles")
    .update({ logo_url })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
