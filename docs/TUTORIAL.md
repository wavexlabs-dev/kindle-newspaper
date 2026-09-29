# Tutorial: tu propio periódico en un Kindle

[← Inicio](../README.md) · [Prompt para Codex](EMPEZAR-CON-CODEX.md) · [Portadas](PORTADA.md)

**Alcance:** reproduce el prototipo probado y ofrece una ruta para completar la autonomía. No hay instalador universal. Las fases 1–6 describen preparación y lectura manual; la fase 7 presenta un cliente experimental cuya autonomía todavía requiere prueba física.

## 1. Identifica el Kindle antes de modificarlo

Conecta el cable de datos. En macOS, comprueba que aparece como volumen y lee su versión; no confundas cargar la batería con una conexión USB de datos. Codex debe anotar modelo, firmware, resolución y componentes ya instalados, sin publicar el número de serie.

La unidad de referencia es KT2/Basic 2014 con firmware 5.12.2.2 y pantalla 600×800. Si la tuya difiere, verifica la [guía de KindleModding](https://kindlemodding.org/jailbreaking/) y adapta la instalación. No cambies un control de firmware en un script solo para que deje de detenerse.

Antes de limpiar contenido, el propietario debe decidir qué conservar y si quiere respaldo. **La decisión original de Pablo de no respaldar no se hereda.** No se necesita un reset de fábrica para seguir el prototipo.

**Resultado de la fase:** diagnóstico escrito y método compatible identificado. Si no hay método compatible, detén las modificaciones del dispositivo; aún puedes probar la parte cloud y el diseño.

## 2. Clona y prueba el diseño sin cuentas

Necesitas acceso al repositorio privado. Usa tu propio fork o copia de trabajo para los cambios de tu instalación.

```sh
git clone https://github.com/wavexlabs-dev/kindle-newspaper.git
cd kindle-newspaper/cloud
npm ci
npm test
node scripts/render-tutorial.js
```

Node 22 es la versión fijada. Las pruebas no necesitan claves reales; una de ellas abre un servidor en loopback. Si el sandbox del agente impide abrir el puerto, ese error es de permisos de ejecución, no evidencia de fallo del backend.

![Muestra de apertura de la edición](images/02-editorial-demo.png)

**Resultado:** pruebas correctas y cuatro PNG en `docs/images/`. Esta muestra usa contenido ficticio y la ilustración ya incluida; no ejecuta generación pagada.

## 3. Prepara tu servidor privado

Sigue [cloud/README.md](../cloud/README.md) para los valores exactos.

1. Crea tu proyecto de hosting. En Vercel, configura **Root Directory: `cloud`**. El resto del repositorio contiene documentación y utilidades de dispositivo, no el punto de entrada del servidor.
2. Conecta **Vercel Blob privado** y expón su token solamente al backend.
3. Usa tu cliente OAuth de Google, tu clave OpenAI y secretos aleatorios independientes para administrador, dispositivo y cron.
4. Configura `PUBLIC_URL` con tu URL real, sin barra final. Despliega y comprueba `/health`.
5. Comprueba que `/admin/status` exige el token de administrador y que `/device/manifest` exige el token de dispositivo. Un 503 antes de publicar la primera edición es esperado: todavía no hay contenido.

La clave OpenAI necesita acceso a Responses y a los modelos/herramientas del proyecto. El backend usa `gpt-6-luna` por defecto para texto y `gpt-image-2.5-flare` para portada; verifica disponibilidad y facturación en tu cuenta. No sustituye una suscripción ChatGPT.

No despliegues con `LOCAL_DATA_DIR`: es únicamente para desarrollo local. No reutilices la URL ni secretos de Pablo.

**Resultado:** servidor propio accesible y almacenamiento privado; todavía no equivale a tener cuentas conectadas.

## 4. Autoriza Gmail y todos tus calendarios

En tu proyecto Google Cloud:

1. Habilita **Gmail API** y **Google Calendar API**.
2. Configura Google Auth y un cliente **Web application**.
3. Registra exactamente `https://TU-DOMINIO/oauth/callback` como URI autorizada.
4. En modo Testing, agrega las cuentas que van a consentir como usuarios de prueba, según el tipo de audiencia de tu aplicación.
5. Configura `NEWSLETTER_ACCOUNT`, `CALENDAR_ACCOUNT` y `NEWSLETTER_SENDERS` en el servidor. Pueden ser dos cuentas distintas o la misma.
6. Inicia cada consentimiento mediante `POST /admin/oauth/newsletters` y `POST /admin/oauth/calendar`; abre las URLs devueltas y permite que el propietario complete Google.

Los permisos solicitados son `openid`, `email` y:

| Conexión | Permisos de solo lectura |
| --- | --- |
| Newsletters | `gmail.readonly` |
| Agenda | `calendar.events.readonly` y `calendar.calendarlist.readonly` |

La aplicación verifica que la cuenta autorizada coincida con la configurada. Si falta el permiso de lista, tener Calendar conectado no significa que pueda enumerar todos los calendarios.

Consulta `/admin/status`: comprueba `newsletters`, `calendar` y `all_calendars_authorized`. Después consulta `/admin/agenda` y contrasta títulos, horas y calendarios con Google Calendar. Incluye un evento compartido y uno de día completo cuando existan.

![Agenda ficticia de varios calendarios](images/03-agenda-demo.png)

Se incluyen calendarios compartidos y ocultos con acceso de lectura de eventos. Un calendario del que solo conoces libre/ocupado no permite recuperar títulos. Se combinan copias por `iCalUID` y ocurrencia, no por coincidencia de título. La zona inicial es Ciudad de México.

**Resultado:** lectura comprobada desde tu backend, no solo desde un conector de Codex. Revisa con Google la duración de los permisos en modo Testing antes de depender del sistema diariamente.

## 5. Genera la primera edición

1. Ejecuta `POST /admin/generate` con tu token administrativo. Esto **sí consume API**.
2. Consulta `/admin/status`. No vuelvas a llamar en un bucle si falla.
3. Cuando aparezca `published`, descarga `/device/manifest` usando `DEVICE_TOKEN`.
4. Descarga cada PNG indicado, comprueba bytes y SHA-256 contra el manifiesto y revisa legibilidad y contenido. No envíes el token a otro dominio ni sigas redirecciones con él.
5. Empaqueta las páginas, en orden, como ZIP sin compresión y extensión `.cbz`, por ejemplo `page-01.png`…`page-07.png`. No metas el manifiesto, claves ni agenda JSON en el CBZ.

Codex debe guardar la descarga y la edición en `.local/`, no en la galería de GitHub. El repositorio aún no tiene un comando único de descarga+instalación: el agente debe realizar y verificar esos pasos, respetando el contrato del manifiesto en `cloud/src/edition.js`.

La portada se genera a partir de las noticias redactadas. La agenda entra directamente en el render. Una edición ya publicada es inmutable: ejecutar `/admin/generate` otra vez devuelve `already-published`, **no** actualiza los eventos ni la portada de ese día.

![Página interior con contenido ficticio](images/04-article-demo.png)

**Resultado:** una edición completa comprobada en el Mac, todavía no entrega física autónoma.

## 6. Prepara el lector y ábrelo en el Kindle

Esta fase requiere tocar la pantalla. Sigue las instrucciones vigentes para tu modelo; [JAILBREAK.md](JAILBREAK.md) y [REGISTRO.md](REGISTRO.md) son evidencia histórica de la unidad KT2, no una orden de repetir reparaciones.

1. Completa un jailbreak compatible, si hace falta, y verifica ejecución de una aplicación después de reiniciar. Un mensaje “You are jailbroken” por sí solo no acredita todo el entorno.
2. Descarga KOReader de su [repositorio oficial](https://github.com/koreader/koreader/releases), elige el paquete de tu dispositivo y verifica el archivo. En el KT2 de referencia se usó `kindlepw2` 2026.07.1. No redistribuimos sus binarios aquí.
3. Verifica que el lector abre un documento y sale normalmente antes de adaptar su lanzamiento.
4. Para la unidad de referencia, se crearon los archivos siguientes. Solo configura rutas equivalentes después de comprobar que no pertenecen a otra instalación:

```text
/mnt/us/koreader/                         # KOReader oficial
/mnt/us/newspaper-reader/
  OWNER.txt                              # Kindle Newspaper reader v1
  current.cbz                            # Edición privada, no está en Git
  current.sha256                         # HASH  current.cbz
  launch.sh                              # kindle_open_newspaper.sh
  current.sdr/metadata.cbz.lua            # Ajuste inicial por documento
/mnt/us/documents/Leer_La_Senal.sh         # Nombre histórico del acceso
/mnt/us/RUNME.sh                          # Acceso mediante ;log runme en esta unidad
```

`/mnt/us` es la ruta dentro del Kindle; en el Mac, el volumen de referencia es `/Volumes/Kindle`. El lanzador comprueba Linux, root, marcador propietario, firmware, existencia del lector y checksum del documento. No es un instalador de KOReader.

El documento usa página completa y lectura paginada. Fusiona —sin sobrescribir otras preferencias— estos valores en la configuración Lua correspondiente:

```lua
-- KOReader/settings.reader.lua (tabla existente)
["language"] = "es",
["end_document_action"] = "goto_beginning",
-- Documento: current.sdr/metadata.cbz.lua
-- Configuración inicial, antes de que KOReader guarde su propio estado:
return { zoom_mode = "page", page = 1, kopt_page_scroll = 0, kopt_trim_page = 0 }
```

El bloque anterior muestra **dos archivos diferentes**; no lo pegues entero en uno. El pie adicional de KOReader puede desactivarse porque las páginas ya llevan numeración.

Expulsa USB y abre el acceso al periódico. Si tu instalación dispone de la integración de comandos probada, `;log runme` es la alternativa; no es universal para todo Kindle con jailbreak.

### Controles y recuperación

- Tocar a media altura a la derecha: avanzar. A la izquierda: regresar.
- Tocar arriba: menú de KOReader. Salir desde el menú antes de conectar USB.
- Al final del documento: volver a la portada mediante `goto_beginning`. Evita el diálogo de fin que ofrece «Eliminar archivo»; no bloquea todas las opciones de gestión del lector.
- Si borras el CBZ: sal del lector, conecta USB, restaura la edición completa verificada y su checksum. No hace falta repetir el jailbreak.
- Si no responde como se esperaba: registra pantalla y logs antes de reiniciar o modificar. No recurras a reset/downgrade automáticamente.

**Resultado:** lectura y navegación comprobadas físicamente. Esta primera edición se carga por USB.

## 7. Entrega inalámbrica y autonomía: ensayo experimental

El plugin [Pablo’s Time](../kindle/README.md) descarga el CBZ completo por HTTPS, verifica bytes y SHA-256, conserva la edición anterior y solicita a KOReader abrir la nueva. Programa una alarma mediante la API de KOReader para el próximo horario de entrega. Debe permanecer abierto; aún no hay recuperación autónoma tras reiniciar o cerrar el lector.

Sigue la instalación y prueba de tres minutos descritas en su README. Los archivos de credenciales y certificados van en el dispositivo, nunca en Git. Los recibos autenticados del servidor distinguen apertura manual y alarma; confirma también la pantalla física.

**Estado:** entrega completa, despertar de suspensión y apertura de una edición distinta comprobados en una prueba de tres minutos (recibo `test_alarm` y confirmación visual del usuario). La ejecución diaria a las 08:00 y el funcionamiento durante 24–48 horas siguen pendientes de observación. Los scripts antiguos de una sola portada son diagnósticos históricos, no el cliente nuevo.

El cron cloud prepara contenido a las 06:00 CDMX. `next_delivery` indica las 08:00 al plugin; el servidor por sí solo no despierta la pantalla. Si KOReader se cierra, hay que volver a abrir el periódico.

## Personaliza tu versión

| Qué quieres cambiar | Dónde hacerlo |
| --- | --- |
| Cuenta y remitentes de newsletters | Variables `NEWSLETTER_ACCOUNT`, `NEWSLETTER_SENDERS` |
| Cuenta de calendario | `CALENDAR_ACCOUNT`; requiere consentimiento de esa cuenta |
| Nombre y estilo de portada | `cloud/src/cover.js` y cabecera en `cloud/src/render.js` |
| Idioma editorial | Prompts de `cloud/src/editor.js`, fecha/render y configuración del lector |
| Zona y hora objetivo | `ZONE`, `nextDelivery` en `cloud/src/edition.js` |
| Hora del servidor | Cron UTC de `cloud/vercel.json`; adapta cambios estacionales si tu zona los tiene |
| Resolución | Render, `normalizeCover`, manifiesto y validadores del cliente; no basta con cambiar un PNG |
| Número/longitud de noticias | Esquemas en `cloud/src/edition.js` y límites/prompt en `editor.js` |
| Retención | `RETENTION_DAYS` (2–30); se protege la última edición válida |

No hay aún una variable única para el nombre, tamaño o hora. Pide al agente cambios coherentes entre archivos y verificación en tu dispositivo.

## Cómo saber si terminaste

Marca por separado: compatible, jailbreak probado, nube configurada, OAuth verificado, edición publicada, navegación real, Wi-Fi completo, despertar, operación sin ordenador. No marques las tres últimas solo porque la portada se vea bonita.
