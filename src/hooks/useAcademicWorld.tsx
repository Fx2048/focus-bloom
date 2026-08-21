import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AcademicWorld, CourseStatus, Mission } from '@/types/academicWorld';
import { demoAcademicData } from '@/data/demoAcademicData';
const KEY = 'focus-bloom-world-v1';
type API = { world: AcademicWorld; missions: Mission[]; approvedCredits: number; average: number; updateCourse: (id:string,status:CourseStatus,grade?:number)=>void; completeMission:(mission:Mission,minutes:number,notes:string)=>void; resetDemo:()=>void; setMode:(mode:'demo'|'personal')=>void };
const Ctx = createContext<API | null>(null);
const clone = () => JSON.parse(JSON.stringify(demoAcademicData)) as AcademicWorld;
export function AcademicWorldProvider({children}:{children:React.ReactNode}) {
 const [world,setWorld] = useState<AcademicWorld>(()=>{ try { const saved=localStorage.getItem(KEY); return saved ? JSON.parse(saved) : clone(); } catch { return clone(); }});
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(world)),[world]);
 const approvedCredits=useMemo(()=>world.courses.filter(c=>c.status==='approved').reduce((n,c)=>n+c.credits,0),[world]);
 const average=useMemo(()=>{const g=world.courses.filter(c=>c.grade);return g.length?g.reduce((n,c)=>n+(c.grade||0)*c.credits,0)/g.reduce((n,c)=>n+c.credits,0):0},[world]);
 const missions=useMemo(()=>{const m:Mission[]=[]; const pending=world.tasks.filter(t=>t.status==='pending'); const urgent=[...pending].sort((a,b)=>new Date(a.deadline||0).getTime()-new Date(b.deadline||0).getTime())[0]; if(urgent){const c=world.courses.find(x=>x.id===urgent.courseId);m.push({id:'urgent',title:`Urgente: ${urgent.title}`,description:`${c?.name||'Misión'} · recompensa ampliada`,priority:'urgent',minutes:urgent.estimatedMinutes,xp:urgent.difficulty*25,taskId:urgent.id,courseId:urgent.courseId})} const growth=pending.find(t=>t.id!==urgent?.id);if(growth)m.push({id:'growth',title:`Avance: ${growth.title}`,description:'Un paso visible en tu Reino Académico',priority:'growth',minutes:growth.estimatedMinutes,xp:25,taskId:growth.id,courseId:growth.courseId}); if(world.profile.wellbeing<76)m.push({id:'recovery',title:'Recuperación consciente',description:'Respira, descansa y protege tu racha',priority:'recovery',minutes:15,xp:12}); return m},[world]);
 const updateCourse=(id:string,status:CourseStatus,grade?:number)=>setWorld(w=>{const courses=w.courses.map(c=>c.id===id?{...c,status,grade}:c);return {...w,courses:courses.map(c=>c.status==='locked'&&c.prerequisites.every(p=>courses.find(x=>x.id===p)?.status==='approved')?{...c,status:'pending'}:c)}});
 const completeMission=(mission:Mission,minutes:number,notes:string)=>setWorld(w=>{const xp=mission.xp; return {...w,profile:{...w.profile,xp:w.profile.xp+xp,bloomSeeds:w.profile.bloomSeeds+1,wellbeing:Math.min(100,w.profile.wellbeing+(mission.priority==='recovery'?8:-1)),level:Math.floor((w.profile.xp+xp)/1000)+1},tasks:w.tasks.map(t=>t.id===mission.taskId?{...t,status:'done',pomodoros:t.pomodoros+Math.max(1,Math.ceil(minutes/25))}:t),sessions:[...w.sessions,{id:crypto.randomUUID(),date:new Date().toISOString(),minutes,notes,focus:4,xp}]}});
 return <Ctx.Provider value={{world,missions,approvedCredits,average,updateCourse,completeMission,resetDemo:()=>setWorld(clone()),setMode:(mode)=>setWorld(w=>({...w,mode}))}}>{children}</Ctx.Provider>
}
export const useAcademicWorld=()=>{const x=useContext(Ctx);if(!x)throw Error('AcademicWorldProvider missing');return x};
