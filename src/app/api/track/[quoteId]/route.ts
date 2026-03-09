import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await params;

  // Fire-and-forget: log the view
  try {
    const supabase = createServiceClient();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ua = request.headers.get("user-agent") || "unknown";

    // Insert view log
    await supabase.from("quote_views").insert({
      quote_id: quoteId,
      ip_address: ip,
      user_agent: ua,
    });

    // Increment view_count on the quote
    const { data: quote } = await supabase
      .from("quotes")
      .select("view_count")
      .eq("id", quoteId)
      .single();

    if (quote) {
      await supabase
        .from("quotes")
        .update({ view_count: (quote.view_count || 0) + 1 })
        .eq("id", quoteId);
    }
  } catch {
    // Non-blocking — never fail the pixel response
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
