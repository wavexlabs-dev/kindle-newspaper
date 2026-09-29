import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCBZ} from '../src/bundle.js';
import {validManifest} from '../src/edition.js';
import {Store} from '../src/store.js';
import {publish,latest} from '../src/publish.js';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {DateTime} from 'luxon';
import {deliverySample} from '../src/sample.js';
test('CBZ is a standard ZIP with correct CRC and page contents',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'cbz-test-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 const file=path.join(dir,'test.cbz');await fs.writeFile(file,makeCBZ([Buffer.from('one'),Buffer.from('two')]));
 execFileSync('python3',['-c',"import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; assert z.namelist()==['page-01.png','page-02.png']; assert z.read('page-02.png')==b'two'",file]);
});
test('new revision becomes latest only after complete publication; original remains readable',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'revision-test-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const store=new Store(dir);const e=deliverySample('2026-09-29');const now=DateTime.fromISO('2026-09-29T12:00:00-06:00');
 const first=await publish(store,e);assert.ok(first.bundle);await store.write('editions/2026-09-29/revisions/1790700000000/partial.png',Buffer.from('x'));assert.equal((await latest(store,now)).revision,undefined);
 const m=await publish(store,e,{revision:'1790700000000'});assert.ok(validManifest(m,e.day));assert.equal((await latest(store,now)).revision,'1790700000000');assert.ok(await store.read('editions/2026-09-29/edition.cbz'));
 assert.equal(validManifest({...m,bundle:{...m.bundle,path:'https://evil.invalid/steal'}},e.day),false);
 assert.equal(validManifest({...m,revision:'../escape'},e.day),false);
});
