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

async function getValidAccessToken(serviceClient: any, userId: string): Promise<{ accessToken: string } | { error: string; code: string; status: number }> {
  const { data: tokenRow, error: tokenError } = await serviceClient
    .from("google_calendar_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (tokenError || !tokenRow) {
    return { error: "Google Calendar not connected", code: "NOT_CONNECTED", status: 400 };
  }

  let accessToken = tokenRow.access_token;
  if (new Date(tokenRow.expires_at) <= new Date()) {
    const refreshed = await refreshAccessToken(tokenRow.refresh_token);
    if (!refreshed) {
      await serviceClient.from("google_calendar_tokens").delete().eq("user_id", userId);
      return { error: "Google token expired, please reconnect", code: "TOKEN_EXPIRED", status: 401 };
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

  return { accessToken };
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
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
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

    const body = await req.json();
    const { action, taskId } = body;

    // Check if user has Google Calendar connected
    const tokenResult = await getValidAccessToken(serviceClient, userId);
    if ("error" in tokenResult) {
      // Not connected — silently skip, no error for auto-sync
      return new Response(JSON.stringify({ skipped: true, reason: tokenResult.code }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { accessToken } = tokenResult;

    if (action === "create" || action === "update") {
      // Get the task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (taskError || !task) {
        return new Response(JSON.stringify({ error: "Task not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const startDate = new Date(task.scheduled_day + "T09:00:00");
      const endDate = new Date(startDate.getTime() + task.estimated_hours * 60 * 60 * 1000);

      const statusEmoji = task.status === "completed" ? "✅" : task.status === "in-progress" ? "🔄" : "🎯";
      const event = {
        summary: `${statusEmoji} ${task.name}`,
        description: `Dificultad: ${task.difficulty}\nPomodoros: ${task.completed_pomodoros}/${task.pomodoro_sessions}\nEstado: ${task.status}`,
        start: { dateTime: startDate.toISOString(), timeZone: "America/Bogota" },
        end: { dateTime: endDate.toISOString(), timeZone: "America/Bogota" },
      };

      // If task already has a calendar event, update it
      if (task.google_calendar_event_id) {
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${task.google_calendar_event_id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
          }
        );
        if (res.ok) {
          return new Response(JSON.stringify({ success: true, action: "updated" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // If update fails (event deleted externally), create new one
      }

      // Create new event
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
        const eventData = await res.json();
        // Store the event ID in the task
        await serviceClient
          .from("tasks")
          .update({ google_calendar_event_id: eventData.id })
          .eq("id", taskId);

        return new Response(JSON.stringify({ success: true, action: "created", eventId: eventData.id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        const errBody = await res.text();
        console.error("Failed to create calendar event:", errBody);
        return new Response(JSON.stringify({ error: "Failed to create event" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (action === "delete") {
      const { googleCalendarEventId } = body;

      if (!googleCalendarEventId) {
        return new Response(JSON.stringify({ skipped: true, reason: "no_event_id" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleCalendarEventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return new Response(
        JSON.stringify({ success: res.ok || res.status === 404, action: "deleted" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Event error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
