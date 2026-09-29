export function deliverySample(day) {
  return {
    day, agenda: [],
    editorial: {
      headline: 'Una señal que llega por Wi-Fi',
      introduction: 'PRUEBA DE ENTREGA · Esta portada se ha generado en la nube. Es una prueba técnica; todavía no contiene tus noticias ni tu calendario.',
      articles: [
        { title: 'De la nube a la tinta electrónica', summary: 'El servidor prepara las páginas para que el dispositivo descargue una edición completa. Esta muestra permite comprobar la conexión sin usar datos personales.', why: 'La prueba valida el transporte; no acredita todavía el despertar automático.', sources: ['https://example.com/'] },
        { title: 'Preparado para una lectura tranquila', summary: 'Las páginas se presentan en blanco y negro y se guardarán localmente en el dispositivo para su lectura. Este contenido es solo una muestra.', why: 'El periódico debe seguir disponible aunque se interrumpa la conexión.', sources: ['https://example.com/'] },
        { title: 'Cada cosa a su hora', summary: 'La entrega prevista es a las ocho de la mañana, hora de Ciudad de México. Falta verificar físicamente esa actualización autónoma.', why: 'Una portada de prueba no sustituye una mañana completa de funcionamiento.', sources: ['https://example.com/'] },
      ],
    },
  };
}
