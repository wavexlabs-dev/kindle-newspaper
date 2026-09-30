import { z } from 'zod';
const sender = z.object({ email:z.string().trim().toLowerCase().regex(/^[a-z0-9._+%-]+@[a-z0-9.-]+\.[a-z]{2,}$/), enabled:z.boolean() }).strict();
export const preferencesSchema=z.object({senders:z.array(sender).min(1).max(20),lookbackDays:z.number().int().min(1).max(7),maxMessages:z.number().int().min(1).max(20)}).strict().superRefine((v,c)=>{
  if(new Set(v.senders.map(s=>s.email)).size!==v.senders.length)c.addIssue({code:'custom',message:'Hay correos duplicados'});
  if(!v.senders.some(s=>s.enabled))c.addIssue({code:'custom',message:'Mantén al menos una fuente activa'});
});
export async function readPreferences(store){
 const files=(await store.list('settings/newsletters/')).map(x=>x.pathname).filter(x=>/^settings\/newsletters\/\d{8}\.json$/.test(x)).sort().reverse();
 if(files.length){const value=await store.json(files[0]);return {...preferencesSchema.parse(value.preferences),version:value.version};}
 return {senders:(process.env.NEWSLETTER_SENDERS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).map(email=>({email,enabled:true})),lookbackDays:3,maxMessages:12,version:0};
}
export async function savePreferences(store,input,version){
 const preferences=preferencesSchema.parse(input);const current=await readPreferences(store);
 if(!Number.isInteger(version)||version!==current.version)throw Object.assign(new Error('La configuración cambió. Recarga antes de guardar.'),{status:409});
 const next=version+1;if(next>99999999)throw Error('Settings limit');
 try{await store.writeJSON(`settings/newsletters/${String(next).padStart(8,'0')}.json`,{version:next,preferences,at:new Date().toISOString()});}
 catch(e){if(e.code==='EEXIST'||/already exists/i.test(e.message))throw Object.assign(new Error('La configuración cambió. Recarga antes de guardar.'),{status:409});throw e;}
 return {...preferences,version:next};
}
