import test from 'node:test';
import assert from 'node:assert/strict';
import {readCalendars,mergeEvents} from '../src/calendar.js';
test('all calendars and event pages are fetched, including hidden/shared calendars',async()=>{
 const calls=[];
 const auth={request:async r=>{calls.push(r);if(r.url.endsWith('calendarList'))return {data:r.params.pageToken?{items:[{id:'shared#id',summary:'Shared'}]}:{items:[{id:'primary',summary:'Main'}],nextPageToken:'more'}};
 return {data:{items:[{id:r.url,summary:r.url.includes('primary')?'Main event':'Shared event',start:{dateTime:'2026-09-29T09:00:00-06:00'}}]}};
 }};
 const result=await readCalendars(auth,'2026-09-29');assert.equal(result.length,2);
 assert.equal(calls[0].params.showHidden,true);assert.ok(calls.some(r=>r.url.includes('shared%23id')));
 assert.ok(calls.filter(r=>r.url.endsWith('/events')).every(r=>r.params.timeMin==='2026-09-29T00:00:00.000-06:00'));
});
test('shared copies deduplicate by UID and occurrence, not title; all-day and times sort correctly',()=>{
 const cal={id:'a',summary:'A'};const event={id:'1',iCalUID:'shared',summary:'Meeting',start:{dateTime:'2026-09-29T09:00:00-07:00'}};
 const result=mergeEvents([{calendar:cal,event},{calendar:{id:'b',summary:'B'},event},{calendar:cal,event:{...event,id:'2',iCalUID:'another',start:{date:'2026-09-29'}}},{calendar:cal,event:{...event,start:{dateTime:'2026-09-29T11:00:00-06:00'}}},{calendar:cal,event:{...event,status:'cancelled'}}]);
 assert.equal(result.length,3);assert.equal(result[0].time,'Todo el día');assert.equal(result[1].time,'10:00');assert.deepEqual(result[1].calendars,['A','B']);assert.equal(result[2].time,'11:00');
});
test('inaccessible calendar fails rather than quietly omitting its events',async()=>{
 const auth={request:async r=>{if(r.url.endsWith('calendarList'))return {data:{items:[{id:'denied'}]}};throw Error('denied');}};
 await assert.rejects(()=>readCalendars(auth,'2026-09-29'),/denied/);
});
