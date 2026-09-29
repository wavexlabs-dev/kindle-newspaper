import fs from 'node:fs/promises';
import { renderEdition } from '../src/render.js';
const editorial = {
  headline: 'Tu mañana empieza con una señal',
  introduction: 'PRUEBA DE DISEÑO · Esta portada comprueba la lectura en tinta electrónica. Las noticias reales aparecerán cuando terminemos de conectar las fuentes.',
  articles: [
    { title: 'Las ideas que vale la pena seguir', summary: 'Una selección breve de IA y tecnología, con contexto y enlaces a sus fuentes. Este es contenido de muestra para probar la pantalla.', why: 'Menos ruido y más contexto para empezar el día.', sources: ['https://example.com/'] },
    { title: 'Lo que cambia en tus herramientas', summary: 'El periódico incluirá novedades útiles para el trabajo creativo. Este texto es una muestra de maquetación.', why: 'Entender qué cambió y cuándo merece tu atención.', sources: ['https://example.com/'] },
    { title: 'Tu agenda, junto a las noticias', summary: 'Los eventos de tu calendario tendrán su propia página. Esta demostración no contiene información personal.', why: 'Una sola lectura para preparar la mañana.', sources: ['https://example.com/'] },
  ],
};
await fs.mkdir('../.local/render-cloud', { recursive: true });
const pages = await renderEdition({ day: '2026-09-28', editorial, agenda: [] });
for (const [i, page] of pages.entries()) await fs.writeFile(`../.local/render-cloud/page-${i + 1}.png`, page);
console.log(`Rendered ${pages.length} clearly labeled sample pages`);
