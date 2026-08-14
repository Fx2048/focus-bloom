import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Eres un experto en mallas curriculares universitarias.
Recibes una imagen o el texto de una malla curricular y devuelves los cursos estructurados.
Reglas:
- Devuelve SOLO la herramienta extract_curriculum.
- "cycle" es el número de ciclo/semestre al que pertenece el curso (1, 2, 3...). Si la malla usa "Ciclo I", conviértelo a 1.
- "credits" en número (si no aparece, usa 3).
- "prerequisites" es una lista con los CÓDIGOS o NOMBRES exactos de los cursos requisito, tal como aparecen en la malla. Vacío si no tiene.
- No inventes cursos que no aparecen.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageBase64, text } = await req.json();
    if (!imageBase64 && !text) {
      return new Response(JSON.stringify({ error: "Envía una imagen o texto de la malla" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content: unknown[] = [];
    if (text) content.push({ type: "text", text: `Malla curricular:\n${String(text).slice(0, 20000)}` });
    if (imageBase64) {
      content.push({ type: "text", text: "Extrae los cursos de esta malla curricular." });
      content.push({ type: "image_url", image_url: { url: imageBase64 } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_curriculum",
            description: "Devuelve los cursos de la malla curricular",
            parameters: {
              type: "object",
              properties: {
                courses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      code: { type: "string" },
                      name: { type: "string" },
                      credits: { type: "number" },
                      cycle: { type: "number" },
                      prerequisites: { type: "array", items: { type: "string" } },
                    },
                    required: ["name", "cycle"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["courses"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_curriculum" } },
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Límite de solicitudes alcanzado, intenta en un momento." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "Se agotaron los créditos de IA del workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) {
      const errText = await res.text();
      console.error("AI gateway error", res.status, errText);
      return new Response(JSON.stringify({ error: "No se pudo analizar la malla" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const parsed = call ? JSON.parse(call.function.arguments) : { courses: [] };

    const courses = (parsed.courses ?? [])
      .filter((c: any) => c && typeof c.name === "string" && c.name.trim())
      .slice(0, 120)
      .map((c: any) => ({
        code: typeof c.code === "string" ? c.code.trim().slice(0, 20) : "",
        name: c.name.trim().slice(0, 120),
        credits: Number.isFinite(Number(c.credits)) && Number(c.credits) > 0 ? Number(c.credits) : 3,
        cycle: Number.isFinite(Number(c.cycle)) && Number(c.cycle) > 0 ? Math.round(Number(c.cycle)) : 1,
        prerequisites: Array.isArray(c.prerequisites)
          ? c.prerequisites.filter((p: any) => typeof p === "string").map((p: string) => p.trim()).slice(0, 6)
          : [],
      }));

    return new Response(JSON.stringify({ courses }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-curriculum error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
