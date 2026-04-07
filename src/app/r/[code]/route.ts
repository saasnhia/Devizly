import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const response = NextResponse.redirect(new URL("/signup", req.url));
  response.cookies.set("ref_code", code, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: false,
    path: "/",
  });
  return response;
}
