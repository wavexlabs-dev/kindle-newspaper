// ZIP STORE, UTF-8 names, no ZIP64: at most 20 PNG pages (30 MB).
import { createHash } from 'node:crypto';
export const sha256 = b => createHash('sha256').update(b).digest('hex');
function crc32(b) {
  let c = 0xffffffff;
  for (const byte of b) { c ^= byte; for (let k=0;k<8;k++) c=(c>>>1)^((c&1)?0xedb88320:0); }
  return (c ^ 0xffffffff) >>> 0;
}
export function makeCBZ(pages) {
  if (!pages.length || pages.length>20) throw new Error('Invalid bundle page count');
  const chunks=[],directory=[];let offset=0;
  pages.forEach((data,i)=>{
    const name=Buffer.from(`page-${String(i+1).padStart(2,'0')}.png`);const crc=crc32(data);
    const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(33,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(data.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(name.length,26);
    chunks.push(h,name,data);
    const d=Buffer.alloc(46);d.writeUInt32LE(0x02014b50);d.writeUInt16LE(20,4);d.writeUInt16LE(20,6);d.writeUInt16LE(0x800,8);d.writeUInt16LE(33,14);d.writeUInt32LE(crc,16);d.writeUInt32LE(data.length,20);d.writeUInt32LE(data.length,24);d.writeUInt16LE(name.length,28);d.writeUInt32LE(offset,42);directory.push(d,name);offset+=h.length+name.length+data.length;
  });
  const central=Buffer.concat(directory);const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(pages.length,8);end.writeUInt16LE(pages.length,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);
  return Buffer.concat([...chunks,central,end]);
}
