import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';
export type Deadline = Tables<'study_deadlines'>;
const key='bloom-guest-deadlines';
export function useStudyWorkspace() {
  const {user}=useAuth(); const qc=useQueryClient();
  const [guest,setGuest]=useState<Deadline[]>(()=>{try{return JSON.parse(localStorage.getItem(key)||'[]');}catch{return [];}});
  const updateGuest=useCallback((fn:(items:Deadline[])=>Deadline[])=>setGuest(items=>{const next=fn(items);localStorage.setItem(key,JSON.stringify(next));return next;}),[]);
  const query=useQuery({queryKey:['study-deadlines',user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await supabase.from('study_deadlines').select('*').eq('user_id',user?.id||'').order('due_at');if(error)throw error;return data;}});
  const save=async(values:Pick<Deadline,'title'|'course'|'due_at'|'priority'|'notes'>,id?:string)=>{
    if(!user){updateGuest(items=>id?items.map(d=>d.id===id?{...d,...values}:d):[...items,{...values,id:crypto.randomUUID(),user_id:'guest',completed:false,created_at:new Date().toISOString()}]);return;}
    const result=id?await supabase.from('study_deadlines').update(values).eq('id',id).eq('user_id',user.id):await supabase.from('study_deadlines').insert({...values,user_id:user.id});
    if(result.error)throw result.error;await qc.invalidateQueries({queryKey:['study-deadlines']});
  };
  const toggle=async(d:Deadline)=>{if(!user){updateGuest(items=>items.map(x=>x.id===d.id?{...x,completed:!x.completed}:x));return;}const {error}=await supabase.from('study_deadlines').update({completed:!d.completed}).eq('id',d.id).eq('user_id',user.id);if(error)throw error;await qc.invalidateQueries({queryKey:['study-deadlines']});};
  const remove=async(id:string)=>{if(!user){updateGuest(items=>items.filter(d=>d.id!==id));return;}const {error}=await supabase.from('study_deadlines').delete().eq('id',id).eq('user_id',user.id);if(error)throw error;await qc.invalidateQueries({queryKey:['study-deadlines']});};
  return {deadlines:user?query.data||[]:guest,loading:query.isLoading,error:query.error,save,toggle,remove};
}