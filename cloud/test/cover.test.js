import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {coverPrompt,generateCover,COVER_MODEL} from '../src/cover.js';
const editorial={headline:'IA en el trabajo creativo',articles:[{title:'Una noticia',summary:'Un resumen público',private:'NEVER INCLUDE'}],agenda:[{title:'PRIVATE CALENDAR'}]};
test('cover prompt includes editorial content, never agenda or unknown fields',()=>{
 const p=coverPrompt(editorial,'2026-09-29');assert.ok(p.includes("Pablo's Time"));assert.ok(p.includes('Un resumen público'));assert.equal(p.includes('PRIVATE CALENDAR'),false);assert.equal(p.includes('NEVER INCLUDE'),false);
});
test('daily cover requests exactly one GPT Image 2.5 image and produces a Kindle-sized PNG',async()=>{
 const input=await sharp({create:{width:64,height:96,channels:3,background:'white'}}).png().toBuffer();
 const api={responses:{create:async request=>{assert.equal(request.tools[0].model,COVER_MODEL);assert.equal(request.max_tool_calls,1);assert.equal(request.store,false);return {status:'completed',output:[{type:'image_generation_call',result:input.toString('base64')}],usage:{}};}}};
 const {png}=await generateCover(editorial,'2026-09-29',api);const m=await sharp(png).metadata();assert.equal(m.width,600);assert.equal(m.height,800);
});
