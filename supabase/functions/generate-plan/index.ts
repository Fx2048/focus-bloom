import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_DIFFICULTIES = ["low", "medium", "high"];
const MAX_TASK_NAME_LENGTH = 200;
const MAX_TASKS = 50;

function validateAndSanitizeTasks(tasks: unknown): { id: string; name: string; difficulty: string; estimatedHours: number; pomodoroSessions: number; completedPomodoros: number }[] {
  if (!Array.isArray(tasks)) throw new Error("tasks must be an array");
  if (tasks.length > MAX_TASKS) throw new Error(`Maximum ${MAX_TASKS} tasks allowed`);
  if (tasks.length === 0) return [];

  return tasks.map((t, i) => {
    if (!t || typeof t !== "object") throw new Error(`Task ${i} is invalid`);
    if (typeof t.id !== "string" || t.id.length === 0) throw new Error(`Task ${i}: invalid id`);
    if (typeof t.name !== "string" || t.name.length === 0) throw new Error(`Task ${i}: name required`);
    if (t.name.length > MAX_TASK_NAME_LENGTH) throw new Error(`Task ${i}: name too long (max ${MAX_TASK_NAME_LENGTH})`);
    if (!VALID_DIFFICULTIES.includes(t.difficulty)) throw new Error(`Task ${i}: invalid difficulty`);
    if (typeof t.estimatedHours !== "number" || t.estimatedHours < 0.5 || t.estimatedHours > 24) throw new Error(`Task ${i}: estimatedHours must be 0.5-24`);
    if (typeof t.pomodoroSessions !== "number" || !Number.isInteger(t.pomodoroSessions) || t.pomodoroSessions < 0) throw new Error(`Task ${i}: invalid pomodoroSessions`);
    if (typeof t.completedPomodoros !== "number" || !Number.isInteger(t.completedPomodoros) || t.completedPomodoros < 0) throw new Error(`Task ${i}: invalid completedPomodoros`);

    // Sanitize task name - strip control characters
    const sanitizedName = t.name.replace(/[\x00-\x1f\x7f]/g, "").trim();

    return {
      id: t.id,
      name: sanitizedName,
      difficulty: t.difficulty,
      estimatedHours: t.estimatedHours,
      pomodoroSessions: t.pomodoroSessions,
      completedPomodoros: t.completedPomodoros,
    };
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Input Validation ---
    const body = await req.json();
    const { tasks: rawTasks, motivationLevel, maxDailyHours } = body;

    if (typeof motivationLevel !== "number" || motivationLevel < 1 || motivationLevel > 10 || !Number.isInteger(motivationLevel)) {
      return new Response(
        JSON.stringify({ error: "motivationLevel must be an integer between 1 and 10" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (typeof maxDailyHours !== "number" || maxDailyHours < 1 || maxDailyHours > 24) {
      return new Response(
        JSON.stringify({ error: "maxDailyHours must be between 1 and 24" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let tasks;
    try {
      tasks = validateAndSanitizeTasks(rawTasks);
    } catch (validationError) {
      return new Response(
        JSON.stringify({ error: validationError instanceof Error ? validationError.message : "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Filter pending/in-progress tasks only
    const activeTasks = tasks.filter(t => t.completedPomodoros < t.pomodoroSessions);
    
    if (activeTasks.length === 0) {
      return new Response(
        JSON.stringify({ 
          plan: [], 
          message: "No tasks to schedule! Add some tasks to get started." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a mental health-focused productivity assistant for FocusFlow, an app that helps students study in a balanced way.

Your job is to create a daily study plan that:
1. Respects the user's energy levels and prevents burnout
2. Prioritizes high-difficulty tasks when the user is fresh (earlier in the day)
3. Never exceeds the maximum daily hours
4. Schedules easier tasks for lower motivation days
5. Includes adequate breaks between tasks
6. Considers partial completion (some tasks may already have completed pomodoros)

Current context:
- User's motivation level: ${motivationLevel}/10
- Maximum work hours today: ${maxDailyHours}
- ${motivationLevel <= 3 ? "User is feeling low energy - be gentle and suggest lighter workload" : ""}
- ${motivationLevel >= 8 ? "User is highly motivated - can handle more challenging work" : ""}

Respond with a JSON object containing:
{
  "plan": [
    {
      "taskId": "task-uuid",
      "taskName": "task name",
      "suggestedTime": "9:00 AM",
      "duration": 1.5,
      "pomodorosToComplete": 3,
      "reason": "Brief explanation of why scheduled here"
    }
  ],
  "totalHours": 4.5,
  "message": "Encouraging message about the plan",
  "wellnessReminder": "A gentle mental health tip for the day"
}

Be kind, supportive, and prioritize wellbeing over productivity.`;

    const taskList = activeTasks.map(t => 
      `- ${t.name} (Difficulty: ${t.difficulty}, ${t.estimatedHours}h total, ${t.pomodoroSessions - t.completedPomodoros} pomodoros remaining)`
    ).join('\n');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please create a balanced study plan for today with these tasks:\n\n${taskList}` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate plan");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Extract JSON from the response
    let planData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      planData = {
        plan: activeTasks.slice(0, 3).map((t, i) => ({
          taskId: t.id,
          taskName: t.name,
          suggestedTime: `${9 + i * 2}:00 AM`,
          duration: Math.min(t.estimatedHours, 2),
          pomodorosToComplete: Math.min(t.pomodoroSessions - t.completedPomodoros, 4),
          reason: "Scheduled based on priority and available time"
        })),
        totalHours: Math.min(activeTasks.reduce((a, t) => a + t.estimatedHours, 0), maxDailyHours),
        message: "Here's your study plan for today. Remember to take breaks!",
        wellnessReminder: "Progress, not perfection. Every small step counts! 🌱"
      };
    }

    return new Response(
      JSON.stringify(planData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-plan error:", error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
