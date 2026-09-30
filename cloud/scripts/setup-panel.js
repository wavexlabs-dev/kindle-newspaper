// Run once per independent deployment; the panel never receives ADMIN_TOKEN.
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
export async function setupPanel({origin,admin,output,password=randomBytes(24).toString('base64url')}){
 if(!origin||!admin||!output)throw Error('PUBLIC_URL, ADMIN_TOKEN and output path are required');
 const parsed=new URL(origin);if(parsed.protocol!=='https:'&&parsed.hostname!=='127.0.0.1')throw Error('Use HTTPS');
 const r=await fetch(parsed.origin+'/admin/panel-password',{method:'POST',headers:{Authorization:'Bearer '+admin,'Content-Type':'application/json'},body:JSON.stringify({password})});
 if(!r.ok)throw Error('Panel access setup failed: HTTP '+r.status);
 await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,`Panel: ${parsed.origin}/panel\n\nClave de acceso:\n${password}\n\nGuarda esta clave en tu gestor de contraseñas. No la subas a GitHub.\n`,{mode:0o600});await fs.chmod(output,0o600);return {url:parsed.origin+'/panel',file:output,password};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await setupPanel({origin:process.env.PUBLIC_URL,admin:process.env.ADMIN_TOKEN,output:path.resolve('../.local/panel-access.txt'),...(process.env.PANEL_PASSWORD?{password:process.env.PANEL_PASSWORD}:{})});console.log('Acceso configurado. Clave guardada únicamente en '+result.file);
}
