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
7. Volumen expulsado de forma segura mediante macOS, con respuesta `Disk /Volumes/Kindle ejected`. Se indicó al usuario desconectar, abrir `https://penguins184.xyz/wb2` en el navegador experimental y pulsar Jailbreak.
8. El usuario aportó fotos con salida de jb.sh v1.3.7, `Done`, `Restarting GUI` y `Restart strategy 3`, junto con `Application Error`. El código del instalador contempla ese aviso durante el reinicio GUI. Las fotos muestran batería al 30 %; no se incorporan al repositorio porque incluyen contenido personal de la biblioteca.
9. Tras la reconexión USB se comprobó firmware sin cambios y `documents/JAILBROKEN.txt` (108 bytes), identificando jb.sh v1.3.7 y Winterbreak2. Existe `libkh/bin` pero está vacío: falta la copia esperada de FBInk. El espacio libre es 1,918,722,048 bytes en esa comprobación. No se había generado ningún informe de diagnóstico.
10. Actualizado el diagnóstico para probar FBInk interno si está disponible. Copiado `documents/KT2_Diagnostico.sh`, 3,995 bytes, SHA-256 `504f188b97840a43efbfc9aa5057bde499b0c66bbe246af076d87872de41607f`; igualdad entre original y copia comprobada. Sólo se añadió ese archivo, sin reinstalar ni borrar componentes.
11. Segunda expulsión segura confirmada. Se indicó Modo avión, reinicio completo, abrir `Diagnostico Kindle` desde Biblioteca y reconectar USB. Resultado pendiente.
12. El usuario transcribió el texto del comprobante `JAILBROKEN.txt`. Se aclaró que es distinto de `Diagnostico Kindle`. Confirmó que este último no aparece en Biblioteca y reconectó por USB. El archivo de diagnóstico mantiene el checksum correcto y no hay informes nuevos; FBInk USB continúa ausente.
13. Preparado el acceso alternativo desde búsqueda, revisando `dispatch.sh` del payload y el registro de comandos. Copiado `RUNME.sh` (889 bytes, SHA-256 `3dd8d0471cdf891c6f0cdf4a0a7f6dc9cceb8abd5da7d72b1d160915300f5991`) sin sobrescribir un archivo anterior. Ejecuta únicamente el diagnóstico existente y registra el resultado técnico. Sintaxis local y copia verificadas.
14. Tercera expulsión segura confirmada. Se indicó escribir `;log runme` en búsqueda, esperar 15 segundos y reconectar USB. Resultado pendiente.
15. El usuario confirmó la prueba y reconectó. No hay informes de diagnóstico ni de lanzamiento. Se comprobó que ambos scripts conservan sus hashes y son ejecutables desde el montaje USB. FBInk USB sigue ausente. La ausencia de informe no permite distinguir entre un disparador sin configurar y una salida previa al registro por las guardas del script.
16. Preparada una comprobación directa mediante el disparador de navegador ya utilizado. `newspaper-diagnostics/probe-001.sh` registra el inicio antes de comprobar la versión, identifica privilegios, herramientas de descompresión, espacio y rutas técnicas; después intenta el diagnóstico existente. Tiene bloqueo idempotente para evitar repeticiones por reintentos de transferencia. No instala, reinicia, abre shell de red ni cambia configuración del sistema.
17. Copiados y comprobados: `probe-001.sh` (3,205 bytes, SHA-256 `6d940c7d024a7a4877a36596fe613111fe4a8ee5e48aeb3f0cdadc61d33ff48b`) y `newspaper-diagnostics/OWNER.txt`. Reemplazado únicamente el `winterbreak2/dialoger.html` conocido, después de verificar su hash original, por la adaptación diagnóstica (624 bytes, SHA-256 `d595054d9d28422b42c6cfc1888d3af666fccd09c99ca65abbc7570ff6836fc6`). Su comando llama al probe local; ya no descarga ni ejecuta jb.sh. No se creó una copia de respaldo del archivo del dispositivo.
18. Sintaxis shell y JavaScript comprobadas sin ejecutar el probe. Cuarta expulsión segura confirmada. Se indicó Wi-Fi, abrir la misma página WB2 y pulsar una vez su botón para ejecutar el diagnóstico local; esperar unos 30 segundos y reconectar. Informe pendiente.
19. El informe del probe ejecutado desde el navegador confirmó `uid=0`, `armv7l` y firmware `5.12.2.2`. KMC está vacío salvo enlaces colgantes: faltan FBInk, KPM, Gandalf y el hook de arranque. Los componentes OTA están presentes y en ejecución. Queda confirmado acceso root por el disparador, no una instalación funcional ni persistente de KMC.
20. Revisado el archivo embebido en jb.sh: usa un diccionario XZ de 64 MiB y produce un tar de 24,330,240 bytes; el diagnóstico observó 26,332 KiB libres en `/tmp`. Son restricciones relevantes, pero no establecen la causa exacta del fallo inicial de extracción. No se presenta una hipótesis como causa confirmada.
21. Preparada una reparación offline mediante `scripts/build_offline_repair.py`, a partir de jb.sh v1.3.7 con SHA-256 `65a63528fbe9515950cc3aa0d931749548680f37898a3819a4ebc0a740588942`. Incluye 38 archivos oficiales ya extraídos, manifiesto, checksums y un diff de la adaptación de la cola del instalador. Se omiten las limpiezas USB del original y su bloque final de reinicio/marcador; se añaden comprobaciones de copia, integridad y funcionamiento.
22. Preparados un wrapper root con `RUN_MODE=1`, sin debug ni reinicio automático, y una comprobación de una sola ejecución tras reiniciar mediante el hook oficial y `emergency.sh`. Se habilita esta última sólo si pasan las comprobaciones previas. Detalles en [REPARACION.md](REPARACION.md). La preparación no demuestra que se hayan copiado ni ejecutado esos controles en el Kindle.
23. Validación en host del verificador: 5/5 pruebas pasan, incluidas detección de payload alterado, OTA activo y respuestas KPM inválidas. La prueba de SUID está simulada porque el sandbox de macOS elimina ese bit. No son ejecuciones de los binarios ARM ni validación de la reparación en el dispositivo.
24. Antes de copiar, se añadió restauración explícita de modos Unix porque el volumen FAT no los conserva: 20 archivos a `0755`, 18 a `0644` y 10 directorios a `0755`, según el archivo oficial, antes de aplicar SUID e inmutabilidad. SHA-256 de la cola adaptada: `ee351970a14b5c0c199af4ed5591d3a715c886e50b98a379e81a05d50ab40878`.
25. Copiado el paquete completo a `/Volumes/Kindle/newspaper-repair`: 49 archivos y 24,331,704 bytes. Todos se releyeron desde el dispositivo y se verificaron con hashes. SHA-256 de `bundle.sha256`: `ef921ebbb16b06b68387ae0d7abb07cc1757f5ade938a1e911b4076f0e2fae44`.
26. Después de verificar el paquete se configuró `winterbreak2/dialoger.html` para ejecutar la reparación local. SHA-256 de esta adaptación: `45f23379a96a11fcd038b4e38a931aa609d289ae8a2e799bcefb09beea0aa469`. Esto confirma preparación del disparador, no ejecución de la reparación. Instalación y verificación posterior al reinicio siguen pendientes.
27. Quinta expulsión segura confirmada: `Disk /Volumes/Kindle ejected`. Se indicó desconectar USB, conectar Wi-Fi y pulsar una vez el botón de WB2 para ejecutar la reparación local. Si aparece `Reparacion lista`, activar Modo avión, reiniciar completamente y reconectar; si aparece `Revision pendiente`, reconectar sin reiniciar. El resultado de ese paso todavía está pendiente.

## Relleno temporal y decisión OTA

Se inició `.newspaper-ota-guard` con el objetivo de dejar aproximadamente 80 MiB libres. Después se omitió completar esa medida al confirmar de nuevo que Amazon ofrece 5.12.2.2 para este modelo, igual que la versión instalada. La decisión y su fundamento se detallan en [JAILBREAK.md](JAILBREAK.md). El relleno es material creado para esta intervención; no es una copia de contenido personal.

La escritura inicial de ceros resultó lenta. Se interrumpió de forma controlada con SIGINT después de tres bloques de 128 MiB, conservando el relleno ya creado. Se reanudó mediante `truncate` y verificación de asignación real: una prueba de 16 MiB confirmó 16 MiB asignados en 4.714 segundos. La escritura por bloques grandes siguió siendo lenta. Se detuvo el segundo proceso con SIGINT y se esperó su salida antes de continuar.

Comprobación al terminar: 8 archivos de relleno, 956,301,312 bytes de contenido temporal; 1,919,115,264 bytes libres. No hay archivos `update*` en la raíz y el checksum del HTML vuelve a coincidir. **Este relleno parcial no bloquea las actualizaciones.** Permanece hasta verificar el bloqueo OTA del jailbreak y retirarlo.

## Estado actual

- Diagnóstico: lectura USB y ejecución root por navegador confirmadas.
- Paquete WinterBreak2: descargado y verificado.
- Copia al Kindle: realizada y checksum verificado.
- Expulsión segura: quinta expulsión confirmada; instrucciones de reparación y ramas de resultado entregadas al usuario.
- Relleno temporal: detenido y parcial; decisión de no completarlo documentada.
- Ejecución del payload: observada en las fotos y corroborada por el marcador USB.
- Jailbreak funcional: instalación incompleta confirmada; KMC sin sus archivos y sin hook de arranque.
- Bloqueo OTA: no instalado; componentes presentes y en ejecución en el diagnóstico.
- Verificación post-jailbreak: Biblioteca y búsqueda no produjeron informes; el probe directo sí confirmó root y expuso la instalación incompleta.
- Reparación offline: preparada, copiada y releída con hashes; disparador configurado. Ejecución y reinicio pendientes.
- Causa del fallo de extracción inicial: no establecida.
- Repositorio GitHub: privado, creado y primera subida a `main` verificada.
- Backups: ninguno, por instrucción del usuario.
- Reset y extracción de contenido personal: no realizados.
- Portada sintética: PNG 600 × 800 en escala de grises generado e inspeccionado visualmente en el Mac. Prueba en la pantalla física pendiente.
- Scripts de verificación: el probe directo ejecutó y produjo evidencia; la verificación integral de la reparación sigue pendiente.
- Disparador local WB2: el diagnóstico ejecutó; posteriormente se sustituyó el HTML por la adaptación de reparación verificada. La reparación todavía no se ha ejecutado.

Se actualizará este registro con resultados observados, separando archivos preparados, ejecución y funcionamiento verificado.
