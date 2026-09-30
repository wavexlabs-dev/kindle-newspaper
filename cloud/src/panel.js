import express from 'express';
import {fileURLToPath} from 'node:url';
import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {seal,unseal} from './security.js';
import {readPreferences,savePreferences} from './preferences.js';
import {validManifest,editionKey,dayKey} from './edition.js';
import {latest,generate} from './publish.js';
const COOKIE='pablostime_session';
const publicDir=fileURLToPath(new URL('../panel/',import.meta.url));
function originOK(req){try{return req.get('origin')===new URL(process.env.PUBLIC_URL||'http://127.0.0.1:4319').origin&&req.get('x-panel-request')==='1';}catch{return false;}}
export function mountPanel(app,store,adminAuth){
 app.post('/admin/panel-password',adminAuth,async(req,res)=>{
  const password=req.body?.password;if(typeof password!=='string'||password.length<16||password.length>128)return res.status(400).json({error:'La clave necesita entre 16 y 128 caracteres.'});
  const salt=randomBytes(16).toString('hex');await store.writeJSON('settings/panel-auth.json',{salt,hash:scryptSync(password,salt,32).toString('hex'),version:randomBytes(16).toString('hex')},{overwrite:true});res.json({ok:true});
 });
 app.use('/panel',(_req,res,next)=>{res.set('Content-Security-Policy',"default-src 'self'; img-src 'self' blob:; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");next();});
 app.get('/panel',(_req,res)=>res.sendFile(publicDir+'index.html'));
 app.use('/panel/assets',express.static(publicDir,{index:false,dotfiles:'deny'}));
 app.use('/panel/api',async(req,res,next)=>{
  if(req.method!=='GET'&&!originOK(req))return res.status(403).json({error:'Solicitud no permitida.'});
  if(req.path==='/login')return next();
  try{const raw=(req.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
   const session=unseal(raw||'');const auth=await store.json('settings/panel-auth.json');
   if(!auth||session.version!==auth.version||session.exp<Date.now())throw Error();req.panelSession=session;next();
  }catch{return res.status(401).json({error:'Inicia sesión para ver tu periódico.'});}
 });
 const loginAttempts=[];
 app.post('/panel/api/login',async(req,res)=>{
  const now=Date.now();while(loginAttempts.length&&loginAttempts[0]<now-60000)loginAttempts.shift();
  if(loginAttempts.length>=20)return res.status(429).json({error:'Demasiados intentos. Espera un minuto.'});loginAttempts.push(now);
  const password=req.body?.password;const auth=await store.json('settings/panel-auth.json');
  if(typeof password!=='string'||password.length>128||!auth)return res.status(401).json({error:'Clave incorrecta o acceso sin configurar.'});
  const derived=scryptSync(password,auth.salt,32);const expected=Buffer.from(auth.hash,'hex');
  if(derived.length!==expected.length||!timingSafeEqual(derived,expected))return res.status(401).json({error:'Clave incorrecta.'});
  res.cookie(COOKIE,seal({version:auth.version,exp:Date.now()+7*86400000}),{httpOnly:true,secure:!!process.env.VERCEL,sameSite:'strict',path:'/panel',maxAge:7*86400000});res.json({ok:true});
 });
 app.post('/panel/api/logout',(_req,res)=>{res.clearCookie(COOKIE,{path:'/panel'});res.json({ok:true});});
 app.get('/panel/api/preferences',async(_req,res)=>res.json(await readPreferences(store)));
 app.put('/panel/api/preferences',async(req,res)=>{
  try{res.json(await savePreferences(store,req.body?.preferences,req.body?.version));}catch(e){if(e.name==='ZodError')return res.status(400).json({error:e.issues.map(x=>x.message).join('. ')});if(e.status===409)return res.status(409).json({error:e.message});throw e;}
 });
 app.get('/panel/api/overview',async(_req,res)=>res.json({today:dayKey(),latest:await latest(store),run:await store.json(`runs/${dayKey()}.json`),receipt:await store.json('device/last-receipt.json'),alarm:await store.json('device/last-alarm.json'),connections:{newsletters:!!await store.read('oauth/newsletters'),calendar:!!await store.read('oauth/calendar')},schedule:{generation:'06:00',delivery:'08:00',zone:'America/Mexico_City'}}));
 app.get('/panel/api/archive',async(req,res)=>{
  const offset=Number(req.query.offset||0);if(!Number.isInteger(offset)||offset<0||offset>10000)return res.sendStatus(400);
  const files=(await store.list('editions/')).map(x=>x.pathname).filter(x=>/^editions\/\d{4}-\d{2}-\d{2}\/(?:revisions\/\d{13}\/)?manifest\.json$/.test(x)).sort().reverse();
  const editions=[];for(const path of files.slice(offset,offset+12)){const m=await store.json(path);if(!validManifest(m,m?.day))continue;const key=editionKey(m.day,m.revision);if(path!==`editions/${key}/manifest.json`)continue;const e=await store.json(`editions/${key}/edition.json`);editions.push({day:m.day,revision:m.revision,pages:m.pages.length,generated_at:m.generated_at,headline:e?.editorial?.headline||'Edición del día',summary:e?.editorial?.introduction||''});}
  res.json({editions,next:offset+12<files.length?offset+12:null});
 });
 app.get('/panel/api/edition/:day/:revision',async(req,res)=>{
  let key;try{key=editionKey(req.params.day,req.params.revision==='daily'?undefined:req.params.revision);}catch{return res.sendStatus(400);}
  const manifest=await store.json(`editions/${key}/manifest.json`);if(!validManifest(manifest,req.params.day))return res.sendStatus(404);
  const receipt=await store.json(`receipts/${key}.json`);res.json({manifest,edition:await store.json(`editions/${key}/edition.json`),receipt});
 });
 app.get('/panel/api/image/:day/:revision/:page',async(req,res)=>{
  let key;try{key=editionKey(req.params.day,req.params.revision==='daily'?undefined:req.params.revision);}catch{return res.sendStatus(400);}
  const page=Number(req.params.page);const m=await store.json(`editions/${key}/manifest.json`);if(!validManifest(m,req.params.day)||!Number.isInteger(page)||page<1||page>m.pages.length)return res.sendStatus(404);
  const b=await store.read(`editions/${key}/page-${page}.png`);if(!b)return res.sendStatus(404);res.type('png').send(b);
 });
 app.post('/panel/api/generate',async(req,res)=>{
  const revision=req.body?.revision;if(typeof revision!=='string'||!/^\d{13}$/.test(revision))return res.sendStatus(400);
  res.json(await generate(store,dayKey(),{revision}));
 });
}
