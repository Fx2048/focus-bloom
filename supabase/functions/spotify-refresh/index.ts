import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tokenRow, error: fetchError } = await serviceClient
      .from("spotify_tokens")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError || !tokenRow) {
      return new Response(JSON.stringify({ error: "No Spotify connection found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if token is still valid
    if (new Date(tokenRow.expires_at) > new Date(Date.now() + 60000)) {
      return new Response(JSON.stringify({ access_token: tokenRow.access_token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Refresh the token
    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID")!;
    const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET")!;

    const refreshResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokenRow.refresh_token,
      }),
    });

    const refreshData = await refreshResponse.json();

    if (refreshData.error) {
      return new Response(JSON.stringify({ error: "Token refresh failed", code: "TOKEN_EXPIRED" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

    await serviceClient
      .from("spotify_tokens")
      .update({
        access_token: refreshData.access_token,
        expires_at: expiresAt,
        ...(refreshData.refresh_token ? { refresh_token: refreshData.refresh_token } : {}),
      })
      .eq("user_id", userId);

    return new Response(JSON.stringify({ access_token: refreshData.access_token }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Spotify refresh error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
