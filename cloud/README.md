# Pablo’s Time · servidor privado

[← Tutorial principal](../README.md) · [Implementación paso a paso](../docs/TUTORIAL.md) · [Portadas](../docs/PORTADA.md)

Node 22/Express: Gmail → investigación/redacción → portada GPT Image 2.5 → páginas PNG + agenda → almacenamiento privado. Cada instalación utiliza sus propias cuentas y secretos.

## Prueba local

Desde `cloud/`:

```sh
npm ci
npm test
node scripts/render-tutorial.js
cp .env.example .env.local
```

Para arrancar el servidor, completa `.env.local`, activa `LOCAL_DATA_DIR=../.local/cloud-data` únicamente en desarrollo y ejecuta `npm run dev`. Escucha en `127.0.0.1:4318`. No es un túnel accesible desde Google: las pruebas OAuth deben usar un callback que Google pueda redirigir y que coincida exactamente con el cliente configurado.

`npm run render` genera otra muestra de diseño en `.local/render-cloud`. Los renders de demostración no llaman a la API. Las fuentes Noto Serif llevan licencia [SIL OFL](fonts/LICENSE).

## Variables

| Variable | Qué configurar |
| --- | --- |
| `PUBLIC_URL` | Origen HTTPS de tu propio despliegue, sin `/` final |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Cliente OAuth web propio |
| `NEWSLETTER_ACCOUNT` | Email exacto de la cuenta que autorizará Gmail |
| `CALENDAR_ACCOUNT` | Email exacto de la cuenta que autorizará Calendar |
| `NEWSLETTER_SENDERS` | Remitentes iniciales; después del primer guardado manda el [panel](../docs/PANEL.md) |
| `OPENAI_API_KEY` | Clave dedicada con acceso a Responses y herramientas requeridas |
| `OPENAI_MODEL` | `gpt-6-luna` por defecto; verifica acceso de tu cuenta |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob **privado** de tu proyecto |
| `ADMIN_TOKEN` | Secreto aleatorio independiente para operaciones administrativas |
| `DEVICE_TOKEN` | Secreto distinto, solo para lectura desde el dispositivo |
| `CRON_SECRET` | Secreto distinto para el cron |
| `ENCRYPTION_KEY` | 32 bytes aleatorios codificados en base64 para cifrar OAuth |
| `RETENTION_DAYS` | 7 por defecto, permitido 2–30 |
| `LOCAL_DATA_DIR` | Solo desarrollo; no definir en Vercel |

Genera por separado los tres tokens con `randomBytes(32).toString('hex')` y la clave de cifrado con `randomBytes(32).toString('base64')`. Guárdalos directamente en un archivo ignorado o gestor de secretos. No reutilices valores y no los imprimas en capturas ni documentación.

## Vercel y Google

- Root Directory del proyecto Vercel: **`cloud`**.
- Entrada: `api/index.js`; configuración en `vercel.json`, límite de función 300 segundos y fuentes empaquetadas.
- Vincula Blob privado. No uses un bucket público para agendas o credenciales.
- Habilita Gmail API y Calendar API en tu proyecto Google.
- Callback del cliente web: `${PUBLIC_URL}/oauth/callback`, exactamente.
- Configura usuarios de prueba si tu aplicación usa audiencia externa en Testing. El propietario completa cada consentimiento.
- Scopes: `openid`, `email`, `gmail.readonly` para newsletters; `openid`, `email`, `calendar.events.readonly`, `calendar.calendarlist.readonly` para agenda.
- El callback verifica email y permisos antes de guardar el refresh token cifrado. Una conexión externa en Testing puede requerir renovar autorización; consulta las reglas vigentes de Google antes de uso permanente.

Gmail tiene permiso de lectura del buzón a nivel API, aunque el código filtra por remitentes. No solicita envío o modificación. La lectura actual busca los últimos 3 días y procesa hasta 12 mensajes, con hasta 4,000 caracteres de texto por mensaje.

Calendar enumera todos los calendarios con permiso de lectura de eventos, incluidos compartidos y ocultos; expande recurrencias y recupera el día en `America/Mexico_City`. Los calendarios de solo libre/ocupado no aportan títulos. La agenda no se envía a OpenAI.

## Endpoints

Los tokens se envían mediante `Authorization: Bearer …`, nunca en query strings.

| Método y ruta | Autenticación | Resultado |
| --- | --- | --- |
| `GET /health` | Pública | Estado del servicio |
| `POST /admin/oauth/newsletters` | Admin | URL de consentimiento de Gmail |
| `POST /admin/oauth/calendar` | Admin | URL de consentimiento de Calendar/lista |
| `GET /admin/status` | Admin | Conexiones, permiso de todos los calendarios y ejecución del día |
| `GET /admin/agenda` | Admin | Agenda real combinada; contiene información personal |
| `POST /admin/generate` | Admin | Primera generación de hoy; consume API |
| `POST /admin/test-delivery` | Admin | Imagen sintética de transporte, separada de la edición diaria |
| `GET /cron/generate` | Cron | Generación y mantenimiento |
| `GET /device/manifest` | Device | Última edición completa, hashes, tamaños y próxima hora objetivo |
| `GET /device/editions/:day/page-N.png` | Device | Página de edición publicada |
| `GET /device/editions/:day/edition.json` | Device | Contenido personal de una edición publicada |
| `GET /device/test-cover.png` | Device | Imagen de prueba de transporte |

### Ejemplo: comprobar estado sin exponer el token

Desde `cloud/`, con el archivo local ya configurado (Node 22):

```sh
node --env-file=.env.local --input-type=module <<'JS'
const r = await fetch(process.env.PUBLIC_URL + '/admin/status', {
  headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
});
console.log(r.status, await r.json());
JS
```

Para iniciar consentimiento, usa la misma autenticación con `method: 'POST'` en `/admin/oauth/newsletters` o `/admin/oauth/calendar`; abre la propiedad `url` devuelta. Deja que el propietario seleccione su cuenta y conceda acceso. Comprueba después los tres booleanos de estado y la agenda real.

### Ejemplo: generar una edición

Este comando realiza llamadas pagadas; ejecútalo una vez después de verificar configuración y OAuth:

```sh
node --env-file=.env.local --input-type=module <<'JS'
const r = await fetch(process.env.PUBLIC_URL + '/admin/generate', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
});
console.log(r.status, await r.json());
JS
```

No publiques la salida de `/admin/agenda` ni `edition.json` en un issue o tutorial.

## Publicación, fallos y coste

- Investigación y redacción usan dos llamadas de texto; la portada agrega una tercera llamada Responses con una invocación de imagen. Investigación admite hasta 4 invocaciones de búsqueda. El SDK no reintenta automáticamente; esto limita actividad, no fija una factura.
- Portada: `gpt-image-2.5-flare`, calidad `medium`, PNG; [especificación](../docs/PORTADA.md). Verifica permiso y disponibilidad en tu cuenta.
- Los borradores de editorial/portada se guardan por fecha para reutilizar resultados ya generados. No se consulta memoria visual de ediciones anteriores.
- Páginas y JSON se escriben antes del manifiesto inmutable. Carga parcial no significa edición publicada.
- `/device/manifest` devuelve la última publicación válida incluso después de una interrupción prolongada; `stale` señala que no es de hoy. El consumidor debe verificar bytes y SHA-256 de cada página.
- Repetir la generación de una edición publicada devuelve `already-published`; no corrige retroactivamente su agenda o portada.
- Un fallo conserva la publicación anterior y el estado del intento. Tras revisar la causa, un administrador puede enviar `{"retryFailed":true}` con Content-Type JSON para el reintento permitido. No automatices un bucle ni borres registros para saltarte los límites. El código conserva una excepción acotada para el antiguo error de esquema 400; consulta `publish.js` antes de una recuperación.
- Una interrupción cerca de 300 segundos requiere diagnóstico del hosting y de la etapa; no hay todavía un sistema de trabajos distribuido que garantice terminar tareas más largas.

Retención: 7 días por defecto y protección de la última edición válida aunque sea más antigua. Se limpian únicamente nombres conocidos de ediciones/borradores, registros diarios de más de 30 días y estados OAuth temporales de más de una hora. Un fallo de limpieza no invalida la publicación. Los secretos se conservan.

## Horario y límite del producto

El cron está configurado a `0 12 * * *` (UTC): generación prevista a las 06:00 de Ciudad de México. `next_delivery` indica las 08:00 de esa zona como objetivo para el cliente. Ajusta ambas partes si cambias zona/horario; no prometas precisión del hosting sin comprobar su plan y ejecución.

**El servidor no despierta el Kindle.** Falta completar y probar el cliente que descarga la edición nueva, cambia el documento abierto y programa el despertar. La generación y OAuth se han probado manualmente en producción; no se acredita todavía un ciclo diario completo con el ordenador apagado.

## Referencias

[Google OAuth web](https://developers.google.com/identity/protocols/oauth2/web-server) · [CalendarList](https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list) · [OpenAI imágenes](https://developers.openai.com/api/docs/guides/image-generation) · [Vercel Blob privado](https://vercel.com/docs/vercel-blob/private-storage)

## Panel

Consulta [acceso privado, gestión de fuentes y archivo](../docs/PANEL.md). Incluye sus assets en la función de Vercel; el almacenamiento de ediciones publicadas es permanente, mientras que `RETENTION_DAYS` limpia borradores temporales.
