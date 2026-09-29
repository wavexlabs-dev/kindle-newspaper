# La Señal: servicio privado

Servicio Node 22/Express para una edición diaria de IA y tecnología y el calendario personal. El Kindle recibe páginas PNG de 600 × 800; Gmail, Calendar y OpenAI permanecen en el servidor.

## Estado

Servicio desplegado en https://kindle-newspaper.vercel.app con pruebas locales y comprobación HTTP de las rutas públicas y privadas. No equivale a una integración OAuth autorizada, una edición real publicada ni un despertar físico comprobado. Consultar `docs/REGISTRO.md` para las verificaciones de campo.

## Ejecutar

1. `npm ci`.
2. Copiar `.env.example` a `.env.local`, completar las variables y elegir una carpeta local ignorada mediante `LOCAL_DATA_DIR` para desarrollo.
3. `npm test` y `npm run dev`.
4. `npm run render` genera muestras claramente etiquetadas en `../.local/render-cloud/`.

Las fuentes Noto Serif se distribuyen bajo SIL OFL, incluida en `fonts/LICENSE`; proceden del paquete oficial KOReader v2026.07.1.

## Configuración de producción

- Vercel con almacenamiento **Blob privado**. No crear almacenamiento público para este proyecto.
- Cliente OAuth web de Google con Gmail API y Calendar API habilitadas. Redirect exacto: `${PUBLIC_URL}/oauth/callback`.
- `NEWSLETTER_ACCOUNT` y `CALENDAR_ACCOUNT` son cuentas distintas confirmadas por el propietario. El callback comprueba email verificado y cuenta exacta antes de guardar credenciales.
- Permisos: Gmail de solo lectura para newsletters; Calendar events de solo lectura para agenda. El permiso de Gmail abarca el buzón a nivel API; la aplicación limita sus consultas a `NEWSLETTER_SENDERS`, no solicita envío ni modificación.
- `ADMIN_TOKEN`, `DEVICE_TOKEN` y `CRON_SECRET` deben ser secretos aleatorios distintos de al menos 32 caracteres. `ENCRYPTION_KEY` son 32 bytes aleatorios codificados en base64.
- Clave de OpenAI dedicada, permisos de Responses API. El código no reintenta llamadas de pago: máximo 2 llamadas de modelo y 4 invocaciones de búsqueda por edición. Esto limita actividad, no garantiza una factura fija: configurar también los controles de gasto disponibles en la cuenta.

No introducir credenciales en Git ni en URLs. Endpoints administrativos requieren `Authorization: Bearer ADMIN_TOKEN`. Para conectar cada cuenta, POST a `/admin/oauth/newsletters` o `/admin/oauth/calendar` y abrir el enlace devuelto. El usuario concede acceso en Google. La conexión externa en modo Testing puede caducar; revisar las reglas de Google antes del uso permanente.

## Publicación y dispositivo

- Cron preparado: 12:00 UTC (06:00 Ciudad de México), con margen para encontrar la edición a las 08:00. No garantiza hora exacta de generación en todos los planes de hosting.
- `POST /admin/generate` inicia la edición del día, una vez. `GET /admin/status` devuelve conexión y estado sin contenido personal.
- Calendario se incorpora directamente y no se envía al modelo. Newsletters son pistas; investigación pública y redacción ocurren en dos llamadas separadas. Solo se permiten URLs recuperadas durante la investigación. Esto controla procedencia, no sustituye una revisión editorial de exactitud.
- Las páginas y JSON se escriben antes del manifiesto inmutable. Una carga interrumpida no se publica. `/device/manifest` busca la última edición completa con manifiesto válido, incluso después de una interrupción de más de una semana, e indica `stale` si no corresponde al día actual. Las páginas y JSON requieren exclusivamente `DEVICE_TOKEN`.
- `next_delivery` es un timestamp de la próxima entrega a las 08:00. El cliente todavía debe implementar y verificar descarga, integridad, caché, lectura, RTC, suspensión y recuperación.
- Un intento fallido conserva el registro de ejecución y evita reintentos de pago automáticos. La recuperación debe revisar el fallo y los objetos parciales antes de eliminar exclusivamente el registro y archivos de ese día.

Después de publicar, el cron conserva 7 días de ediciones (configurable entre 2 y 30 mediante `RETENTION_DAYS`) y **siempre protege la última edición válida**, aunque sea más antigua. Elimina primero los manifiestos caducados y después sus archivos conocidos. No borra credenciales ni archivos desconocidos. Conserva registros de ejecución durante 30 días y limpia estados OAuth temporales de más de una hora. Un fallo de limpieza no invalida una publicación correcta.

Pendiente antes de activar uso diario: supervisión de fallos, configuración OAuth real, medición de costes y cliente físico autónomo. No se elimina información personal del Kindle ni se copian libros.

Fuentes: [Google OAuth web](https://developers.google.com/identity/protocols/oauth2/web-server), [Gmail messages.get](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get), [Calendar events.list](https://developers.google.com/workspace/calendar/api/v3/reference/events/list), [OpenAI web search](https://developers.openai.com/api/docs/guides/tools-web-search), [Vercel Blob privado](https://vercel.com/docs/vercel-blob/private-storage).
