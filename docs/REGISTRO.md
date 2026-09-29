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
28. Tras el intento, las fotos sólo muestran la descarga MOBI. En la siguiente revisión USB no existen `repair-001.lock`, `repair-001.txt`, `repair-001.success` ni resultados `postboot-*`; tampoco FBInk USB ni `emergency.sh`. No hay avance de instalación comprobado. La ausencia de estas señales no permite afirmar de forma absoluta que ningún código haya comenzado a ejecutarse antes del primer punto observable.
29. Se verificaron sin errores las 48 entradas de `bundle.sha256`. El HTML conserva el hash `45f23379a96a11fcd038b4e38a931aa609d289ae8a2e799bcefb09beea0aa469` y el informe anterior del probe sigue intacto, SHA-256 `87ff38b68eedcf7d752f232c0d7d31d2656e1b256eefdd25f5e7c1c000872377`.
30. Se preparó una entrada trazable con `scripts/kindle_repair_launch.sh`, copiada como `newspaper-diagnostics/repair-launch-002.sh`: 1,208 bytes, SHA-256 `1031a9706c87369d03a091c7441c9590f912e0b0e817fc24f1675d33ec9492c1`. Registra UID, sistema, arquitectura y `boot_time` antes de llamar al wrapper; mantiene sus controles de integridad y ejecución única.
31. Tras comprobar el hash anterior, se sustituyó el HTML por `scripts/winterbreak2_repair_trace.html`: 625 bytes, SHA-256 `5d0bf643c2a45813d61e42ec184e13c7e2afea4755ad71324a52230f58044ff1`. Launcher y HTML se releyeron y verificaron; los 49 archivos de reparación no cambiaron. Se propone un reinicio normal completo y un único intento, siguiendo la línea de troubleshooting de WB2. Una instancia antigua de Pillow o del diálogo es una hipótesis, no una causa confirmada. Sexta expulsión todavía pendiente al registrar esta preparación.
32. Sexta expulsión segura confirmada: `Disk /Volumes/Kindle ejected`. Se indicó desconectar, reiniciar normalmente y por completo antes de abrir WB2, conectar Wi-Fi y pulsar una sola vez. Si aparece `Reparacion lista`, activar Modo avión, reiniciar y reconectar USB; si aparece `Revision pendiente` o sólo descarga, esperar un minuto y reconectar sin reintentar. El resultado de la nueva entrada sigue pendiente.
33. Tras el reinicio y el intento trazable, el usuario aportó una foto con `Done` y `Revision pendiente`. El informe `repair-launch-002.txt` confirma UID 0, Linux, `armv7l`, `boot_time=1790643805` y `repair_wrapper_rc=1`.
34. `repair-001.txt` confirma preflight correcto y los 38 hashes del payload. La cola del instalador aplicó permisos, Gandalf, SH_Integration, claves, dispatcher, banderas, parches de arranque y renombrado OTA; terminó con `installer_exit_code=0`. Tanto el montaje final del instalador como el del wrapper informaron `mount: / is busy`; el wrapper registró `repair_error=root_remount_failed` y `repair_exit_code=1`. Se detuvo antes de las comprobaciones funcionales: no se ejecutaron y no hay `repair-001.success`, resultados postboot ni `emergency.sh` procedente de ese flujo.
35. FBInk USB ahora existe, ocupa 1,382,536 bytes y su hash coincide con el oficial. Se verificaron de nuevo las 48 entradas de `bundle.sha256` y el hash del manifiesto `ef921ebbb16b06b68387ae0d7abb07cc1757f5ade938a1e911b4076f0e2fae44`. La causa específica de EBUSY no está establecida. Los avisos EIPS de texto fuera de las coordenadas de la pantalla 600 × 800 no prueban daño; el código cero del instalador tampoco sustituye la verificación funcional.
36. Preparados `scripts/kindle_verify_after_restart.sh` y `scripts/kindle_boot_verify_entry.sh` para una comprobación independiente mediante el hook de arranque oficial. Exige el log de instalador con código cero y error de remount, integridad del paquete y `boot_time` diferente. Ejecuta el checker existente sin reinstalar, forzar montajes ni crear un `repair-001.success` artificial. `kpm version` puede inicializar su propia base de datos. Preparación de copia en curso; el siguiente paso previsto es Modo avión, reinicio normal completo, esperar un minuto y reconectar USB, sin WB2.
37. Copiados y verificados `newspaper-diagnostics/verify-after-restart-003.sh` (1,829 bytes, SHA-256 `3887759199a74e169cef22369fcc01bc6e2bce07143ebd51f9de5d9fd01766a9`) y `emergency.sh` (153 bytes, SHA-256 `0d9fe0d58a7c78e573b651392fcf0e2a266d380df93f982d22fbbd63f4618015`). No se modificó el paquete de reparación ni se creó un marcador artificial de éxito.
38. Séptima expulsión segura confirmada. Se indicó desconectar, activar Modo avión, reiniciar normalmente desde el menú, esperar a Inicio más un minuto y reconectar USB. No se utiliza WB2 en este paso. Prueba `verify-after-restart-003` pendiente.

## Relleno temporal y decisión OTA

Se inició `.newspaper-ota-guard` con el objetivo de dejar aproximadamente 80 MiB libres. Después se omitió completar esa medida al confirmar de nuevo que Amazon ofrece 5.12.2.2 para este modelo, igual que la versión instalada. La decisión y su fundamento se detallan en [JAILBREAK.md](JAILBREAK.md). El relleno es material creado para esta intervención; no es una copia de contenido personal.

La escritura inicial de ceros resultó lenta. Se interrumpió de forma controlada con SIGINT después de tres bloques de 128 MiB, conservando el relleno ya creado. Se reanudó mediante `truncate` y verificación de asignación real: una prueba de 16 MiB confirmó 16 MiB asignados en 4.714 segundos. La escritura por bloques grandes siguió siendo lenta. Se detuvo el segundo proceso con SIGINT y se esperó su salida antes de continuar.

Comprobación al terminar: 8 archivos de relleno, 956,301,312 bytes de contenido temporal; 1,919,115,264 bytes libres. No hay archivos `update*` en la raíz y el checksum del HTML vuelve a coincidir. **Este relleno parcial no bloquea las actualizaciones.** Permanece hasta verificar el bloqueo OTA del jailbreak y retirarlo.

## Estado actual

- Diagnóstico: lectura USB y ejecución root por navegador confirmadas.
- Paquete WinterBreak2: descargado y verificado.
- Copia al Kindle: realizada y checksum verificado.
- Expulsión segura: séptima expulsión confirmada; entregadas instrucciones de Modo avión y reinicio normal para verificación, sin WB2.
- Relleno temporal: detenido y parcial; decisión de no completarlo documentada.
- Ejecución del payload: observada en las fotos y corroborada por el marcador USB.
- Instalación KMC: aplicada por la reparación, con 38 hashes correctos y `installer_exit_code=0`; verificación funcional aún no ejecutada.
- Bloqueo OTA: renombrado aplicado según el log; estado de procesos y persistencia pendientes de comprobar tras reiniciar.
- Verificación post-jailbreak: Biblioteca y búsqueda no produjeron informes; el probe directo sí confirmó root y expuso la instalación incompleta.
- Reparación offline: ejecutada; el wrapper salió con código 1 por `root_remount_failed` antes del checker. Paquete íntegro y FBInk USB coincide con el oficial.
- Raíz en sólo lectura: no confirmada; el remount devolvió EBUSY. Causa específica desconocida, sin montaje forzado ni reinstalación.
- Verificación tras reiniciar: `verify-after-restart-003` y entrada de arranque copiados y verificados; resultado independiente pendiente.
- Causa del fallo de extracción inicial: no establecida.
- Repositorio GitHub: privado, creado y primera subida a `main` verificada.
- Backups: ninguno, por instrucción del usuario.
- Reset y extracción de contenido personal: no realizados.
- Portada sintética: PNG 600 × 800 en escala de grises generado e inspeccionado visualmente en el Mac. Prueba en la pantalla física pendiente.
- Scripts de verificación: el probe directo ejecutó y produjo evidencia; la verificación integral de la reparación sigue pendiente.
- Disparador local WB2: `repair-launch-002.sh` ejecutó como root. El siguiente paso utiliza el hook de arranque; no requiere volver a WB2.

Se actualizará este registro con resultados observados, separando archivos preparados, ejecución y funcionamiento verificado.
