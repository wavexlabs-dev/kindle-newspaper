# Cliente Wi-Fi de Pablo’s Time · experimental

`pablostime.koplugin` usa KOReader en el KT2/5.12.2.2 auditado. No declara todavía autonomía física verificada.

- Solo se activa al abrir un documento bajo `/mnt/us/newspaper-reader`, con el marcador propietario esperado.
- `wifi-config.json`: `{ "origin": "https://TU-SERVIDOR" }` sin ruta o barra final. `device.curl` contiene el header Authorization del dispositivo; `cacert.pem` valida TLS. Son archivos privados, no se incluyen en Git.
- Descarga manifiesto y CBZ completo, comprueba límites, origen fijo, bytes y SHA-256; conserva edición anterior. Actualiza un puntero local y cambia el documento de KOReader.
- Programa `next_delivery` tanto para el lector despierto como mediante `Device.wakeup_mgr`. El wrapper nativo de KOReader es quien aplica RTC durante ReadyToSuspend. Hay que dejar KOReader abierto; no persiste una alarma independiente si se cierra o reinicia el lector.
- Requiere reloj del dispositivo a menos de 5 minutos del servidor. La configuración actual usa CDMX; el fallback de reintentos también está fijado a las 08:00 UTC-6.
- Menú Pablo’s Time: actualizar ahora y probar alarma en 3 minutos. Suspender con una pulsación breve; no tocar ni conectar USB durante la prueba. El servidor recibe confirmaciones de descarga/apertura con el tipo de disparador. Abrir una imagen no equivale a confirmación visual humana.
- Tras fallos de conexión hace hasta tres reintentos a intervalos de 5 minutos y luego vuelve al próximo horario. Curl tiene timeout; una transferencia puede bloquear brevemente el hilo del lector. Es una primera implementación acotada, no una interfaz final.
- Los logs están en `wifi-reader.log`; salir de KOReader antes de conectar USB. No se borra caché vieja desde este prototipo; revisar espacio durante el ensayo.

## Prueba completa

1. Publicar una revisión nueva real con identificador de 13 dígitos vía `/admin/generate`, conservando la publicación diaria original.
2. Instalar plugin y configuración, conservar un documento de partida y copiar el lanzador actualizado.
3. Sin USB: abrir periódico, observar descarga y portada nueva, avanzar páginas; verificar recibo del servidor.
4. Menú → Probar alarma en 3 minutos, suspender y esperar. Verificar disparador `test_alarm` y portada visible sin interacción.
5. Dejar lector abierto y Wi-Fi configurado; verificar la siguiente mañana a las 08:00 y luego 24–48 h con Mac apagado.

El cron cloud genera a las 06:00 CDMX; la alarma del lector apunta a las 08:00. Nunca comunicar que los pasos 4–5 pasaron solo porque se instaló el plugin.
