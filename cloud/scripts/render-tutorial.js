// Reproducible screenshots of rendered pages. No personal sources or paid API calls.
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { renderEdition } from '../src/render.js';
import { normalizeCover } from '../src/cover.js';
const root = new URL('../../', import.meta.url);
const out = new URL('docs/images/', root);
const cover = await normalizeCover(await fs.readFile(new URL('assets/covers/pablos-time-2026-09-29.png', root)));
const edition = {
  day: '2026-09-29',
  agenda: [
    { time:'09:00', title:'Revisar ideas de la semana', location:'Evento ficticio', calendars:['Trabajo (ejemplo)'] },
    { time:'12:30', title:'Pausa para leer', location:'Evento ficticio', calendars:['Personal (ejemplo)'] },
    { time:'17:00', title:'Taller de ilustración', location:'Evento ficticio', calendars:['Compartido (ejemplo)'] },
  ],
  editorial: {
    headline:'Una mañana para leer con calma',
    introduction:'MUESTRA DEL TUTORIAL · Estas páginas usan textos y eventos ficticios. Sirven para mostrar el diseño sin publicar correos ni calendarios personales.',
    articles: [
      { title:'Del correo a una edición personal', summary:'MUESTRA · El servidor selecciona newsletters de los remitentes configurados. La investigación contrasta las pistas con fuentes públicas antes de redactar una selección breve en español. Este párrafo describe el proyecto: no es una noticia de actualidad.', why:'Leer una selección acotada puede ayudar a empezar el día con menos distracciones.', sources:['https://example.com/'] },
      { title:'Una portada que cuenta una idea', summary:'MUESTRA · La ilustración se basa en las noticias de cada edición. El título del periódico permanece y el concepto visual cambia. La agenda no forma parte del prompt de imagen.', why:'La portada convierte cada edición en un objeto reconocible y distinto.', sources:['https://example.com/'] },
      { title:'Tus calendarios, reunidos', summary:'MUESTRA · Los eventos de los calendarios accesibles se ordenan en la zona horaria configurada. Las copias de una misma reunión se combinan y el origen de cada evento aparece junto al título.', why:'Una agenda reunida evita consultar cada calendario por separado.', sources:['https://example.com/'] },
    ],
  },
};
const pages = await renderEdition(edition, {cover});
await fs.mkdir(out, {recursive:true});
for (const [name,index] of [['01-cover.png',0],['02-editorial-demo.png',1],['03-agenda-demo.png',2],['04-article-demo.png',3]]) {
  await fs.writeFile(new URL(name,out),pages[index]);
}
console.log(`Tutorial images: ${fileURLToPath(out)} (synthetic interiors; 600×800)`);
