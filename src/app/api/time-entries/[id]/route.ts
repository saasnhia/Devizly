import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/time-entries/[id] — update a time entry (stop timer, edit)
 * DELETE /api/time-entries/[id] — delete a time entry
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.ended_at !== undefined) updates.ended_at = body.ended_at;
  if (body.duration_minutes !== undefined) updates.duration_minutes = body.duration_minutes;
  if (body.description !== undefined) updates.description = body.description;
  if (body.client_id !== undefined) updates.client_id = body.client_id || null;
  if (body.quote_id !== undefined) updates.quote_id = body.quote_id || null;
  if (body.hourly_rate !== undefined) updates.hourly_rate = body.hourly_rate;
  if (body.billed !== undefined) updates.billed = body.billed;

  const { data, error: dbError } = await supabase
    .from("time_entries")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { error: dbError } = await supabase
    .from("time_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
