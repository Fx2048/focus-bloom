import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (data.error) return null;
  return { access_token: data.access_token, expires_in: data.expires_in };
}

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

    // Get stored tokens
    const { data: tokenRow, error: tokenError } = await serviceClient
      .from("google_calendar_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (tokenError || !tokenRow) {
      return new Response(
        JSON.stringify({ error: "Google Calendar not connected", code: "NOT_CONNECTED" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Refresh token if expired
    let accessToken = tokenRow.access_token;
    if (new Date(tokenRow.expires_at) <= new Date()) {
      const refreshed = await refreshAccessToken(tokenRow.refresh_token);
      if (!refreshed) {
        // Token revoked, clean up
        await serviceClient.from("google_calendar_tokens").delete().eq("user_id", userId);
        return new Response(
          JSON.stringify({ error: "Google token expired, please reconnect", code: "TOKEN_EXPIRED" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      accessToken = refreshed.access_token;
      await serviceClient
        .from("google_calendar_tokens")
        .update({
          access_token: refreshed.access_token,
          expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        })
        .eq("user_id", userId);
    }

    // Get user's tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "completed");

    if (tasksError) {
      return new Response(JSON.stringify({ error: "Failed to fetch tasks" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create events in Google Calendar
    let created = 0;
    let errors = 0;

    for (const task of tasks || []) {
      const startDate = new Date(task.scheduled_day + "T09:00:00");
      const endDate = new Date(startDate.getTime() + task.estimated_hours * 60 * 60 * 1000);

      const event = {
        summary: `🎯 ${task.name}`,
        description: `Dificultad: ${task.difficulty}\nPomodoros: ${task.completed_pomodoros}/${task.pomodoro_sessions}\nEstado: ${task.status}`,
        start: { dateTime: startDate.toISOString(), timeZone: "America/Bogota" },
        end: { dateTime: endDate.toISOString(), timeZone: "America/Bogota" },
      };

      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (res.ok) {
        created++;
      } else {
        errors++;
        const errBody = await res.text();
        console.error(`Failed to create event for task ${task.id}:`, errBody);
      }
    }

    return new Response(
      JSON.stringify({ success: true, created, errors, total: tasks?.length || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
