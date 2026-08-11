import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveOrigin } from "@/lib/resolve-origin";
import { resolveSafeRedirect } from "@/lib/safe-direct";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const origin = resolveOrigin(new URL(request.url).origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${resolveSafeRedirect(next, "/documents")}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
