import { createOpenAI } from 'npm:@ai-sdk/openai@4.0.96';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from './run-id.ts';
export const cors = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods':'POST, OPTIONS' };
export function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), {status, headers:{...cors,'Content-Type':'application/json'}}); }
export async function authenticate(req: Request) {
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_ANON_KEY'); const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key || !serviceKey) throw new Error('Missing backend configuration');
  const authorization = req.headers.get('Authorization') || '';
  if (!authorization.startsWith('Bearer ')) return null;
  const client = createClient(url, key, {global:{headers:{Authorization:authorization}}});
  const {data, error} = await client.auth.getUser(authorization.slice(7));
  if(error || !data.user) return null;
  return {client, admin:createClient(url,serviceKey), user:data.user};
}
export async function gateway(req: Request, admin: ReturnType<typeof createClient>, resume = false) {
  const {data:blocked,error} = await admin.from('study_ai_access').select('*').eq('id','workspace').maybeSingle();
  if(error) throw error;
  if(blocked) {
    if(resume && blocked.status === 402) { const {error:clearError}=await admin.from('study_ai_access').delete().eq('id','workspace'); if(clearError) throw clearError; }
    else return {blocked};
  }
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if(!apiKey) return {blocked:{reason:'Lovable AI is not configured.', status:401}};
  const run = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
  let upstreamStatus = 200; let reason = '';
  let resolveReady:()=>void = ()=>{};
  const ready = new Promise<void>(resolve=>{resolveReady=resolve});
  const provider = createOpenAI({apiKey,baseURL:'https://ai.gateway.lovable.dev/v1',headers:{'Lovable-API-Key':apiKey,'X-Lovable-AIG-SDK':'vercel-ai-sdk'},fetch:async(input,init)=>{
    try {
      const response = await run.fetch(input,init); upstreamStatus=response.status;
      if(!response.ok) {
        const body=await response.clone().json().catch(()=>({}));
        reason=body.message || body.error?.message || (typeof body.error==='string'?body.error:'Lovable AI could not complete this request.');
        if(response.status===402 || response.status===403) {
          const {error:saveError}=await admin.from('study_ai_access').upsert({id:'workspace',reason,status:response.status});
          if(saveError) throw saveError;
        }
      }
      return response;
    } finally {resolveReady();}
  }});
  return {provider,run,ready,status:()=>upstreamStatus,error:()=>reason};
}
export const reasoning = {openai:{forceReasoning:true,reasoningEffort:'low',reasoningSummary:'auto',store:false,include:['reasoning.encrypted_content']}};