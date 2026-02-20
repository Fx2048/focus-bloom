import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Task {
  id: string;
  name: string;
  difficulty: 'low' | 'medium' | 'high';
  estimatedHours: number;
  pomodoroSessions: number;
  completedPomodoros: number;
}

interface PlanRequest {
  tasks: Task[];
  motivationLevel: number;
  maxDailyHours: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tasks, motivationLevel, maxDailyHours }: PlanRequest = await req.json();
    
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
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a default plan
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
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
