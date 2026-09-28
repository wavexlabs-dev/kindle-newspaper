# Registro de ejecución

Fecha: 28 de septiembre de 2026. Zona del usuario: America/Mexico_City.

## Autorización y alcance

- Usuario: comenzar por el jailbreak y documentar todo en un repositorio GitHub.
- Instrucción vigente: no respaldar nada.
- Objetivo de producto: portada matutina visible automáticamente, periódico con interfaz propia, Wi-Fi, procesamiento cloud y Mac apagado durante uso diario.
- Confirmación del usuario: batería de al menos aproximadamente 50 % y Kindle a mano para el paso en pantalla.
- Sin contratación de servicios, despliegue cloud ni acceso nuevo a Gmail/Calendar en esta fase.

## Hechos verificados

1. Volumen `/Volumes/Kindle` accesible por USB; firmware confirmado de nuevo como 5.12.2.2.
2. Creado el repositorio privado [wavexlabs-dev/kindle-newspaper](https://github.com/wavexlabs-dev/kindle-newspaper). Primera subida a `main` verificada: commit `ed7cf1af24c185717f466afabe49ed49b1b7bf50`.
3. Descargado `wb2.zip` de la release oficial v1.1.0 en `.local/jailbreak/winterbreak2-v1.1.0/`. Checksum comparado con el digest de GitHub: coincide.
4. ZIP extraído e inspeccionado en el Mac, sin ejecutar su código. Contiene un HTML de arranque que obtiene el instalador oficial por HTTPS.
5. Copiado `/Volumes/Kindle/winterbreak2/dialoger.html`. SHA-256 del archivo en el dispositivo: `9d42a3c880bc6e6a7013a2f59e2d5e8525b369880384384d1c3d856fe7a6bbd5`; coincide con el archivo preparado.
6. Preparadas exclusiones Git para descargas, datos, credenciales, ediciones privadas y logs.
7. Volumen expulsado de forma segura mediante macOS, con respuesta `Disk /Volumes/Kindle ejected`. Se indicó al usuario desconectar, abrir `https://penguins184.xyz/wb2` en el navegador experimental y pulsar Jailbreak. Resultado y reconexión USB pendientes.

## Relleno temporal y decisión OTA

Se inició `.newspaper-ota-guard` con el objetivo de dejar aproximadamente 80 MiB libres. Después se omitió completar esa medida al confirmar de nuevo que Amazon ofrece 5.12.2.2 para este modelo, igual que la versión instalada. La decisión y su fundamento se detallan en [JAILBREAK.md](JAILBREAK.md). El relleno es material creado para esta intervención; no es una copia de contenido personal.

La escritura inicial de ceros resultó lenta. Se interrumpió de forma controlada con SIGINT después de tres bloques de 128 MiB, conservando el relleno ya creado. Se reanudó mediante `truncate` y verificación de asignación real: una prueba de 16 MiB confirmó 16 MiB asignados en 4.714 segundos. La escritura por bloques grandes siguió siendo lenta. Se detuvo el segundo proceso con SIGINT y se esperó su salida antes de continuar.

Comprobación al terminar: 8 archivos de relleno, 956,301,312 bytes de contenido temporal; 1,919,115,264 bytes libres. No hay archivos `update*` en la raíz y el checksum del HTML vuelve a coincidir. **Este relleno parcial no bloquea las actualizaciones.** Permanece hasta verificar el bloqueo OTA del jailbreak y retirarlo.

## Estado actual

- Diagnóstico: verificado por lectura USB.
- Paquete WinterBreak2: descargado y verificado.
- Copia al Kindle: realizada y checksum verificado.
- Expulsión segura: confirmada; instrucciones del paso físico entregadas al usuario.
- Relleno temporal: detenido y parcial; decisión de no completarlo documentada.
- Ejecución del payload: no realizada; pendiente del paso físico.
- Jailbreak: no confirmado.
- Verificación post-jailbreak: pendiente.
- Repositorio GitHub: privado, creado y primera subida a `main` verificada.
- Backups: ninguno, por instrucción del usuario.
- Reset y extracción de contenido personal: no realizados.
- Portada sintética: PNG 600 × 800 en escala de grises generado e inspeccionado visualmente en el Mac. Prueba en la pantalla física pendiente.
- Script de verificación: preparado localmente, sintaxis validada con `sh -n`; todavía no copiado ni ejecutado en el Kindle.

Se actualizará este registro con resultados observados, separando archivos preparados, ejecución y funcionamiento verificado.
