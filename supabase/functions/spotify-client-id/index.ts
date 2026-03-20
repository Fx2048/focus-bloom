const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  if (!clientId) {
    return new Response(JSON.stringify({ error: "Spotify not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ client_id: clientId }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
