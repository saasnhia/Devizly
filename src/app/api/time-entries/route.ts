import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/time-entries — list user's time entries
 * POST /api/time-entries — create a new time entry
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id");
  const quoteId = url.searchParams.get("quote_id");
  const billed = url.searchParams.get("billed");

  let query = supabase
    .from("time_entries")
    .select("*, clients(name), quotes(title, number)")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);
  if (quoteId) query = query.eq("quote_id", quoteId);
  if (billed === "true") query = query.eq("billed", true);
  if (billed === "false") query = query.eq("billed", false);

  const { data, error: dbError } = await query;
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json();
  const { description, client_id, quote_id, started_at, ended_at, duration_minutes, hourly_rate } = body as {
    description?: string;
    client_id?: string;
    quote_id?: string;
    started_at: string;
    ended_at?: string;
    duration_minutes?: number;
    hourly_rate?: number;
  };

  if (!started_at) {
    return NextResponse.json({ error: "started_at requis" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("time_entries")
    .insert({
      user_id: user.id,
      description: description || null,
      client_id: client_id || null,
      quote_id: quote_id || null,
      started_at,
      ended_at: ended_at || null,
      duration_minutes: duration_minutes || null,
      hourly_rate: hourly_rate || null,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
