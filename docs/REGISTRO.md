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
39. Resultado `verify-after-restart-003`: UID 0 al arrancar, `verification_boot_time=1790644442` frente a `installation_boot_time=1790643805` y `different_boot=1`. Los 38 hashes coinciden. KPM funciona: CLI 1.0.0, libkpm 0.2.2, plataforma `kindlepw2`. Pasan Gandalf/SUID, directorios y enlaces, hook, dispatcher, banderas, SH_Integration (registros SQL 2/1), extractor y clave. Ambos componentes OTA están renombrados y detenidos; `root_readonly=1`.
40. Único fallo: `fbink_initializes=0`; `failed_checks=1`, `restart_verification_rc=1` y sin marcador de éxito. El checker descartaba stderr de FBInk, así que este informe no establece la causa. La revisión del binario identifica FBInk 1.25.0 con KT2/C6 explícitamente soportado; no prueba una incompatibilidad de dependencias. Quedan confirmados root tras reiniciar, KPM y OTA; no FBInk ni el dibujo del periódico.
41. Copiado `scripts/kindle_probe_display.sh` como `documents/Pantalla_Kindle.sh`: 2,657 bytes, SHA-256 `36358d8a5786efb8a754073a51d397fabf4d5f389e2741cc0dec06653054023c`, metadatos `Name: Diagnostico pantalla`, `Author: Kindle Newspaper` y `DontUseFBInk`. Recoge datos técnicos de CPU/kernel, framebuffer, loader y errores/códigos de FBInk con y sin ruta de bibliotecas; limita stdout a dimensiones y no recoge seriales. No instala, cambia servicios ni monta sistemas de archivos.
42. Tras verificar el hash del `RUNME.sh` propio anterior, se sustituyó por `scripts/kindle_run_display_probe.sh`: 125 bytes, SHA-256 `9fb2ee51e87262d94c181f2c8d21de986ad8b7954ff45233b200b8e6dcd70567`. Ambos archivos se comprobaron con `sh -n` y se releyeron por USB con hashes coincidentes.
43. Retirado el `emergency.sh` propio del diagnóstico 003 después de leer su informe y verificar su hash. Tras confirmar OTA se retiraron 956,301,312 bytes de relleno del proyecto. La eliminación automática de un AppleDouble provocó un `FileNotFound` en el primer pase; se continuó únicamente con nombres y tamaños ya comprobados y se confirmó la ausencia de `.newspaper-ota-guard`. No se alteró contenido del usuario.
44. Octava expulsión segura confirmada. Se indicó usar Inicio → lupa → `;log runme` → Enter, esperar 15 segundos y reconectar USB; si aparece una búsqueda normal, abrir `Diagnostico pantalla` desde Biblioteca. Sin reinicio ni WB2. Resultado `display-004` pendiente. El script de vista previa con `DontUseFBInk` está preparado localmente, sin copiar al Kindle.
45. Llegó `display-004`: UID 0, kernel `3.0.35-lab126`, ARMv7/NEON Wario y framebuffer `mxc_epdc` presente. El loader y `fbink --help` devuelven cero; `fbink -e` falla con segmentación y código 139 tanto con `LD_LIBRARY_PATH` como sin esa variable. Esto localiza el fallo en la ruta probada; no demuestra que FBInk no pueda inicializar o dibujar.
46. La revisión del código y del ELF exacto identificó un defecto en `state_dump` de FBInk 1.25.0: 57 conversiones de formato y 56 argumentos en la rama Kindle por un booleano omitido en `isTolino`/`isSunxi`. El `%s` de `pixelFormat` recibe un booleano como puntero (`1`). Referencia fijada: [fbink.c](https://github.com/NiLuJe/FBInk/blob/83110d3d278cf9cd44cc1d16237e284a89f72633/fbink.c#L5908).
47. Corregido nuestro checker: sustituye `-e` por `fbink -v </dev/null`, que pasa por apertura, inicialización, EOF y cierre sin dibujar; ahora conserva stderr. No se cambió el binario FBInk, el sistema ni el paquete original de 49 archivos. Las pruebas host pasan 6/6, incluida detección de fallo de FBInk; la simulación rechaza el uso de `-e`.
48. Copiados y releídos los controles separados de la prueba 005, el PNG y la vista previa con `DontUseFBInk`. El checker va fuera del paquete original como `newspaper-diagnostics/check-installed-005.sh`. La vista previa usa `-v`/EOF para comprobar 600 × 800, intenta dibujar el PNG durante 15 segundos y restaura la GUI desde el trap, conservando los errores de render. Los hashes de las seis copias constan en la tabla siguiente; no hay resultado 005 todavía.
49. Novena expulsión segura confirmada. Se indicó `;log runme`, observar «La Señal» durante 15 segundos, esperar 30 segundos y reconectar USB. No se afirma aún que FBInk inicialice correctamente ni que la portada se haya visto.
50. El usuario abrió `Portada_de_prueba` directamente desde Biblioteca. El informe `newspaper-test/preview-1.txt`, UTC `2026-09-29T01:34:54Z`, confirma `uid=0`, `firmware_match=1`, `error=xrefresh_missing_or_not_executable`, `preview_complete=0` y código 1. No existe informe `display-005`: el flujo completo no quedó demostrado. Sí se confirmó lanzamiento root por SH_Integration desde Biblioteca. La vista previa se detuvo en nuestro preflight, antes de inicializar FBInk o dibujar.
51. Se está corrigiendo el script para eliminar la dependencia innecesaria de `xrefresh`, conservar la GUI original activa y permitir recuperación manual mediante USB o suspensión/despertar. La promesa previa de restauración automática queda retirada. La copia de esta revisión, sus hashes y una nueva expulsión todavía no se dan por realizadas.
52. Revisión ampliada: `preview-1.txt` a `preview-4.txt` muestran el mismo fallo `xrefresh_missing_or_not_executable` con UID 0; `display-005.txt` sigue ausente. El script local ya elimina `xrefresh`. Se preparó una entrada común con metadatos de Biblioteca (`Name: Portada de prueba`, `Author: Kindle Newspaper`, `DontUseFBInk`) para `RUNME.sh` y `documents/Portada_de_prueba.sh`; ambas llamarán al controlador 005. Éste ejecutará el checker y luego el motor `newspaper-test/preview.sh`. Copia y nueva expulsión todavía pendientes.
53. La nueva vista previa conserva la GUI original activa y un periodo de observación de 15 segundos. La imagen puede permanecer después hasta un redibujado nativo. La recuperación mediante USB o suspensión/despertar es manual y aún no está probada; no se declara restauración automática.
54. Copiada y releída la revisión sin `xrefresh`; hashes en la tabla de revisión siguiente. Antes de copiar no había informe ni lock `display-005`. El checker 005 y el PNG no cambiaron. Pasaron `sh -n` para los tres scripts modificados y las seis pruebas host en 9.055 segundos. La revisión del [launcher oficial](https://github.com/KindleModding/sh_integration/blob/adb7ef5c570a25c76fd64e94837ae0f590bd3b9c/launcher/main.c#L180) confirma que detiene su propia aplicación antes de intentar un `xrefresh` opcional cuyo resultado ignora; no se modificó el launcher ni el sistema.
55. Décima expulsión segura confirmada por `diskutil`. Se indicó abrir **Portada de prueba** desde Biblioteca, esperar 30 segundos y reconectar USB. Resultado de checker, inicialización, render y observación de portada todavía pendientes.
56. El usuario confirmó visualmente que vio «La Señal» y reconectó USB. El informe nuevo `display-005.txt` registra todos los controles correctos: 38 hashes, Gandalf/SUID, permisos, enlaces, dispatcher, hook, SH_Integration, KPM, OTA renombrado/detenido y raíz en sólo lectura. FBInk con `-v` informa Basic/C6, 600 × 800, 8 bpp/Y8; `fbink_initializes=1`, `failed_checks=0`, `system_check_rc=0`, `system_verification_passed=1` y `display-005.system-success` presente. El informe se corta después de ese punto, sin código final del controlador.
57. `preview-5.txt`, UTC `2026-09-29T01:43:05Z`, confirma UID 0, hash de imagen correcto, inicialización código cero, 600 × 800, GUI activa y `render_rc=0`. Registra `observation_seconds=15`, `gui_restore=usb_or_sleepwake` y `gui_restored=unverified`, pero termina sin `preview_complete` ni código final. Render correcto y observación del usuario acreditan la primera portada física. No se acredita espera completa, cierre normal ni restauración; la causa del corte del informe no está establecida. Los resultados 003 y 005 juntos verifican el jailbreak funcional tras reiniciar.
58. Después de comprobar el éxito del sistema 005 y el render, se sustituyó únicamente la entrada de Biblioteca por `scripts/kindle_show_cover.sh`, copiada como `documents/Portada_de_prueba.sh`: 201 bytes, SHA-256 `346f9cfe77fab2e7e699f8d9dae750fb5b2a0990ee6afd43fcf22b2546c1fd62`. Se verificó el hash anterior, la sintaxis y la copia releída. Conserva nombre, autor y `DontUseFBInk`; llama directamente al motor `newspaper-test/preview.sh` de 6,290 bytes, sin cambios desde el render confirmado. Es un acceso reutilizable que evita la guarda 005; la nueva entrada no recibió otra prueba física. `RUNME.sh` conserva el wrapper 005 de 211 bytes y no debe usarse para repetir la demo.
59. Undécima expulsión segura confirmada por `diskutil`. No se solicitó una nueva prueba física. Se cierra la fase de jailbreak verificado y primera portada observada; entrega Wi-Fi, despertar autónomo, contenido real y cloud siguen pendientes. Cierre normal de preview y retorno de pantalla no comprobados.

### Revisión de la prueba 005 sin xrefresh

Copias verificadas para la ejecución 005; el checker y PNG conservan los hashes de la tabla inicial. Después del resultado, sólo la entrada de Biblioteca se sustituyó por el acceso reutilizable de 201 bytes descrito en el punto 58; `RUNME.sh` conserva su hash de esta tabla.

| Archivo | Bytes | SHA-256 |
| --- | ---: | --- |
| `RUNME.sh` y `documents/Portada_de_prueba.sh` | 211 cada uno | `f3f4ffa61411d61175c24be7a0b9bc55735f979de6a57007117e63b6a925f8f4` |
| `newspaper-diagnostics/display-005.sh` | 1,314 | `2e2c7c68bf7ca43850d73fd53c500d1559680672922b1049ea10fe595208a0a0` |
| `newspaper-test/preview.sh` | 6,290 | `49fa69254e6b3326c1d6bc0925e79ffd9258cc3537a8903d2e6770afbe8cf76b` |

### Archivos iniciales de la prueba 005 — historial

Rutas relativas a la raíz USB del Kindle. Los hashes son SHA-256. Las entradas de `RUNME.sh`, `display-005.sh` y `Portada_de_prueba.sh` se sustituyeron por la revisión sin `xrefresh` documentada arriba.

| Archivo | Bytes | Hash |
| --- | ---: | --- |
| `newspaper-test/OWNER.txt` | 34 | `4a445bf38190cf753274cac4721a325d4761beab806920f231f26acbb626a845` |
| `newspaper-test/cover-test.png` | 50,863 | `674ef64967bc45b710e88b169814c243d08a87f58314b7dea5466f2172b1f937` |
| `newspaper-diagnostics/check-installed-005.sh` | 4,616 | `476e6db993f25779ae92f7ff8851740c1de4f4b93f6f72b9205763d8571d83f0` |
| `newspaper-diagnostics/display-005.sh` | 1,319 | `f732900336f26f14d422ab9de7e931bc620c96e0890028e01fa613c814e74a0b` |
| `documents/Portada_de_prueba.sh` | 6,518 | `f92b865cd602bca511426b8f23f9be506e86779099a3b6851f30bc06774aff98` |
| `RUNME.sh` | 147 | `7e4d4a4c5ce6d2fd41b31bcf152248454d1c10da342d73e182f89c571a7165f8` |

## Relleno temporal y decisión OTA

Se inició `.newspaper-ota-guard` con el objetivo de dejar aproximadamente 80 MiB libres. Después se omitió completar esa medida al confirmar de nuevo que Amazon ofrece 5.12.2.2 para este modelo, igual que la versión instalada. La decisión y su fundamento se detallan en [JAILBREAK.md](JAILBREAK.md). El relleno es material creado para esta intervención; no es una copia de contenido personal.

La escritura inicial de ceros resultó lenta. Se interrumpió de forma controlada con SIGINT después de tres bloques de 128 MiB, conservando el relleno ya creado. Se reanudó mediante `truncate` y verificación de asignación real: una prueba de 16 MiB confirmó 16 MiB asignados en 4.714 segundos. La escritura por bloques grandes siguió siendo lenta. Se detuvo el segundo proceso con SIGINT y se esperó su salida antes de continuar.

Comprobación al terminar la preparación inicial: 8 archivos de relleno, 956,301,312 bytes de contenido temporal; 1,919,115,264 bytes libres. No había archivos `update*` en la raíz y el checksum del HTML coincidía. **Ese relleno parcial no bloqueaba las actualizaciones.** Se retiró después de confirmar ambos componentes OTA renombrados y detenidos en el diagnóstico 003; la carpeta ya no existe.

## Estado actual

- Diagnóstico: lectura USB y ejecución root por navegador confirmadas.
- Paquete WinterBreak2: descargado y verificado.
- Copia al Kindle: realizada y checksum verificado.
- Expulsión segura: undécima expulsión confirmada tras dejar la entrada reutilizable de Biblioteca.
- Relleno temporal: retirado después de confirmar OTA; ausencia de la carpeta comprobada.
- Ejecución del payload: observada en las fotos y corroborada por el marcador USB.
- Instalación KMC: jailbreak funcional verificado mediante 003 y 005; 38 hashes correctos, root tras reiniciar, KPM, Gandalf/SUID y parches comprobados.
- Bloqueo OTA: ambos componentes renombrados y detenidos, comprobados después de reiniciar.
- Verificación post-jailbreak: Biblioteca y búsqueda no produjeron informes; el probe directo sí confirmó root y expuso la instalación incompleta.
- Reparación offline: ejecutada; el wrapper salió con código 1 por `root_remount_failed` antes del checker. Paquete íntegro y FBInk USB coincide con el oficial.
- Raíz en sólo lectura: `root_readonly=1` confirmado después del reinicio. La causa del EBUSY anterior sigue desconocida; no se forzó montaje ni reinstalación.
- Verificación tras reiniciar: 003 confirmó persistencia y 005 pasó todos los controles con el chequeo FBInk corregido; `system-success` presente. El controlador no registra su cierre final.
- Diagnóstico de pantalla: 004 identificó el defecto de `-e`; 005 inicializa con `-v`, confirma 600 × 800 y dibuja correctamente.
- Causa del fallo de extracción inicial: no establecida.
- Repositorio GitHub: privado, creado y primera subida a `main` verificada.
- Backups: ninguno, por instrucción del usuario.
- Reset y extracción de contenido personal: no realizados.
- Portada sintética: preview 5 registra `render_rc=0` y el usuario confirma verla; cierre normal y retorno de pantalla no comprobados.
- Scripts de verificación: 6/6 pruebas host y todos los controles ARM de 005 correctos; se conservan los informes sin inventar sus marcadores finales ausentes.
- Disparadores: Biblioteca usa ahora la entrada reutilizable al motor probado; sintaxis y copia verificadas, sin nueva prueba física de la entrada. `RUNME.sh` conserva 005 y su guarda de una sola ejecución.
- Próxima fase: Wi-Fi, despertar autónomo y cloud pendientes; no se confunden con la portada local ya observada.

Se actualizará este registro con resultados observados, separando archivos preparados, ejecución y funcionamiento verificado.

## Fase cloud y autonomía — continuación del 28 de septiembre

- El usuario confirmó las cuentas separadas de newsletters y calendario y la entrega a las **08:00 America/Mexico_City**. Las direcciones concretas se conservan en configuración privada, no en este registro.
- Lectura posterior de `newspaper-test/preview-8.txt`: `render_rc=0`, `preview_complete=1`, `preview_exit_code=0`. Esto sí acredita cierre normal de una ejecución posterior de la entrada reutilizable; no demuestra restauración automática de la interfaz.
- El diagnóstico de autonomía inicial se copió y verificó, pero no apareció `autonomy-006.txt` en la primera reconexión. No se interpreta esto como un fallo de HTTPS, RTC o suspensión: todavía no hay resultado de esas comprobaciones.
- Se preparó una alternativa usando la entrada ya conocida `Portada de prueba`. El wrapper ejecuta primero el diagnóstico de solo lectura y después el motor de portada probado. Se fijó PATH y se adelantó el registro de errores de UID/firmware.
- Copias verificadas: `newspaper-diagnostics/autonomy-006.sh` y `documents/Diagnostico_autonomia.sh`, 2,778 bytes, SHA-256 `93480603fd9afe305e1e5c692e182655e0b99dc406a6e2cca4c3126c1b667e4f`; wrapper `documents/Portada_de_prueba.sh`, 261 bytes, SHA-256 `def1c5ad47376c2d5e9c724fb77b79c4111f870e5f66627244efb9c2757126e7`. Decimotercera expulsión confirmada por `diskutil`.
- El usuario informó ejecutar la alternativa y reconectar. La comprobación siguiente no encontró volumen ni dispositivo externo Kindle; se solicitó verificar `USB Drive Mode`. No se repitió jailbreak ni se modificaron servicios del dispositivo.
- Descargado paquete oficial KOReader `koreader-kindlepw2-v2026.07.1.zip`, 40,715,224 bytes. SHA-256 cotejado con la release: `ea1f575c54492a2c679d128b7f3210fd7d6a87e5f5a1ff1f7a7fe2080ff68f86`. Extraído bajo `.local` después de validar rutas. **No instalado**. Se estudia su soporte de Kindle Basic y programación de `rtcWakeup` durante `readyToSuspend`; esto no demuestra autonomía en el aparato.
- Implementado `cloud/`: Express, OAuth de dos cuentas con comprobación de identidad, credenciales cifradas, consultas de Gmail limitadas a remitentes configurados, Calendar separado del modelo, investigación con OpenAI Responses, redacción con esquema y URLs recuperadas, render SVG/PNG con Noto Serif y publicación por manifiesto inmutable.
- Seis pruebas Node pasaron: autenticación/cifrado, hora local, procedencia de fuentes, render 600 × 800, publicación incompleta invisible y separación de credenciales de dispositivo/administrador. Las seis pruebas Python anteriores también pasaron. Las pruebas HTTP locales requirieron salir del sandbox para escuchar en loopback; no fue un fallo funcional del servicio.
- Revisión visual de la portada sintética producida por el nuevo maquetador. Las muestras están etiquetadas como prueba y no contienen noticias o agenda reales.
- Creado proyecto Vercel `kindle-newspaper`, vinculado al repositorio privado existente. Primer despliegue detectó Express automáticamente y falló en `/` por falta de default export; corregido export y configuración explícita de función. Segundo despliegue `dpl_EfZH74XUhzsjY8CtyLevGQqVC5Yo` listo.
- URL https://kindle-newspaper.vercel.app: comprobados `/` y `/health` con 200; `/device/manifest`, `/admin/status` y `/cron/generate` sin credenciales devuelven 401. Esto verifica servicio y controles HTTP, **no** generación ni entrega real.
- Vercel: raíz del proyecto ajustada a `cloud`; creado almacén `la-senal-private` de acceso privado y conectado solo a producción. La cuenta existente permitió el despliegue; no se contrató otro plan ni se realizó un pago.
- OpenAI: creado proyecto separado `La Señal — Kindle Newspaper`. Clave restringida a Responses preparada en el navegador, todavía **sin crear** a la espera de confirmación exigida por la herramienta al conceder acceso nuevo.
- Cron definido para 12:00 UTC (06:00 local), con margen para la entrega de las 08:00. La generación exige configuración completa y ambas autorizaciones Google antes de adquirir el bloqueo diario. OAuth real, generación real, descarga Kindle, paginación física, retención y despertar siguen pendientes.
- Se configuraron en producción secretos distintos de administrador, dispositivo, cron y cifrado, junto con la URL, modelo y cuentas confirmadas. No se imprimieron ni se guardaron en Git. `/admin/status` autenticado devolvió 200, ambas conexiones Google falsas y ninguna edición o ejecución diaria. `/device/manifest` con la credencial de dispositivo devolvió 503 «No published edition», estado correcto antes de la primera edición.
- Código y documentación subidos: `b8aea83af494e8206a5adb58f3015ec119edf2d4`. La integración Git de Vercel construyó desde `cloud` y produjo `dpl_8nEB8eK5Bsm7RvtmG8t1Kx3bxKZt` en estado READY.
- Añadida prueba de entrega privada explícita en `6c4ed54`, independiente del manifiesto diario. El POST administrativo a `/admin/test-delivery` devolvió 200; generó y almacenó un PNG de **27,540 bytes**, SHA-256 `35cec4a1d0b69c8a05fa102115557813b6d2252b99206db0041246d61cfdc1ca`. Descarga por `/device/test-cover.png` con la credencial del dispositivo: 200, longitud y SHA-256 coincidentes. Revisada visualmente la imagen descargada: texto legible y etiqueta «PRUEBA DE ENTREGA». Prueba realizada desde el Mac, **no desde el Kindle**. No se publicó una edición ficticia como periódico real.
- Google Cloud pidió verificación de identidad de la cuenta seleccionada; se dejó abierta la pestaña para que el usuario completara ese paso. Cliente OAuth aún no creado. No se solicitó ni se recibió una contraseña en el chat.

### Conservación y recuperación cloud

- Corregida la búsqueda de última edición: la versión inicial solo examinaba siete fechas y podía dejar de ofrecer la última publicación tras una interrupción prolongada. Ahora enumera manifiestos inmutables, valida fecha, dimensiones, orden, rutas y hashes declarados, descarta manifiestos malformados y conserva la última edición válida con indicador `stale`.
- Retención automática después de la generación: siete días por defecto, configurable de dos a treinta, protegiendo siempre la última edición válida. Solo elimina rutas conocidas de ediciones caducadas, estados OAuth temporales de más de una hora y registros de ejecución de más de treinta días. Las credenciales y archivos no reconocidos quedan fuera de la limpieza.
- Diez pruebas Node correctas, incluidas interrupción de carga en la segunda página, conservación de una edición de más de una semana, rechazo de manifiestos con JSON inválido, rutas externas o páginas nulas, y limpieza que mantiene la última edición, las credenciales y los archivos desconocidos. Estas son pruebas de lógica del servidor, no de la caché del Kindle.
- Nueva comprobación de dependencias externas: el volumen Kindle continúa ausente y Google Cloud continúa en la verificación de identidad. No se ha recibido aprobación para crear la clave de OpenAI. Se continúa con esas acciones pendientes, sin considerar terminado el periódico autónomo.

### Reconexión USB y entrada directa al diagnóstico

- En la siguiente reconexión anunciada por el usuario, `/Volumes/Kindle` volvió a estar disponible. `autonomy-006.txt` y su lock siguen ausentes; el último informe de portada es `preview-8.txt`. No hay evidencia de ejecución de la prueba posterior y no se atribuye todavía a una causa concreta.
- La entrada `RUNME.sh` conservaba el wrapper 005 con guarda ya consumida. Se verificó su hash y se sustituyó exclusivamente ese archivo por `scripts/kindle_run_autonomy_probe.sh`: 1,112 bytes, SHA-256 `440486bba010f95f87694abc4179e33e951a0c43ed9e57de387bd2cb7a78253f`. Copia releída y sintaxis comprobadas.
- El nuevo comando `;log runme` deja un informe independiente `autonomy-launch-N.txt` con UID, hora y código del probe, muestra un aviso de ejecución y llama al diagnóstico de solo lectura ya preparado. No reinstala jailbreak, modifica servicios ni accede a libros. Resultado de ejecución pendiente.

### Diagnóstico de autonomía recibido y prueba de red preparada

- Recibido `autonomy-006.txt`: ejecución UID 0, inicio `2026-09-29T05:13:39Z`, `autonomy_probe_complete=1`. Confirma curl 7.76.1 con OpenSSL 1.0.2q, herramientas LIPC y propiedad `rtcWakeup` de powerd. Su presencia no verifica todavía el despertar autónomo.
- La conexión de diagnóstico falló en DNS (`curl` código 6, HTTP 000); el estado Wi-Fi era `NA`. No hubo negociación TLS y no se atribuye el fallo a certificados. No apareció un informe `autonomy-launch-N.txt`, por lo que el mecanismo exacto de lanzamiento sigue sin confirmarse.
- Preparada `scripts/kindle_test_network.sh`: descarga HTTPS autenticada, certificado y hostname verificados, tiempos y tamaño limitados, checksum de imagen y render FBInk con comprobación 600×800. No modifica servicios, RTC ni conectividad. Registros numerados independientes.
- Bundle de CA obtenido de https://curl.se/ca/cacert.pem y comparado con https://curl.se/ca/cacert.pem.sha256: `a41b5d356aea97a529fe27e0f7316d2f9d946d75927476cf9cf1b90637d00505`. Uso acotado a esta prueba; almacén de certificados del sistema intacto.
- Comprobación actual desde el Mac: `/device/test-cover.png` devuelve la misma imagen de prueba, SHA-256 `35cec4a1d0b69c8a05fa102115557813b6d2252b99206db0041246d61cfdc1ca`. No es aún evidencia de descarga desde el Kindle.
- Copiados y releídos en el dispositivo: directorio propio `newspaper-network`, certificado, configuración privada de curl, checksum esperado y lanzador. `RUNME.sh` y `documents/Prueba_WiFi.sh` contienen la prueba, SHA-256 `cca85f7b1a977970429e0902b0ae6055ecd21c8bcb01807865a0fabe567afd6b`. La credencial no se registra en Git ni en diagnósticos. Pendiente ejecución física con Wi-Fi conectado y confirmación de pantalla.

### Primera ejecución física de la prueba Wi-Fi

- `network-1.txt`, inicio `2026-09-29T05:30:12Z`: el lanzador se ejecutó; `wifi_state=NA`, curl código 6 (`Could not resolve host: kindle-newspaper.vercel.app`), HTTP 000, salida 1. No hubo imagen descargada ni render. `ssl_verify_result=0` no demuestra validación TLS porque falló DNS antes de establecer conexión.
- El usuario confirmó que no había revisado si la red figuraba conectada en Ajustes. Próximo paso: conectar/verificar la red desde la interfaz nativa y repetir la misma prueba, sin cambiar certificados, DNS ni servicios.

### Entrega inalámbrica verificada en el Kindle

- `network-2.txt`, inicio `2026-09-29T05:33:47Z`: `wifi_state=CONNECTED`, HTTP 200, `ssl_verify_result=0`, `download_rc=0`, checksum coincidente, `render_rc=0`, `network_test_complete=1` y salida 0.
- El usuario confirmó visualmente: «Sí llegó Una señal que llega por WI-FI». La evidencia conjunta verifica descarga HTTPS autenticada desde Vercel y presentación física de la imagen de prueba sin cable durante la ejecución.
- No demuestra todavía despertar desde suspensión, actualización a las 08:00 ni generación de noticias/agenda reales. Esos estados siguen pendientes. La interfaz nativa se mantuvo en ejecución.
- Revisado el mecanismo de despertar de KOReader: programa `rtcWakeup` durante `readyToSuspend`, no arbitrariamente en estado activo, y discrimina reanudaciones manuales de alarmas. Fuente: https://github.com/koreader/koreader/blob/master/frontend/device/kindle/powerd.lua . No se han escrito alarmas ni modificado los ajustes de energía del Kindle.

### Clave de OpenAI autorizada, creada y verificada

- Con autorización explícita del propietario, creada «La Señal — producción» en el proyecto dedicado de OpenAI. Permisos restringidos a Responses; los demás recursos permanecen sin acceso. Estado activo, sin caducidad según configuración aprobada.
- Guardada como `OPENAI_API_KEY` de Production en Vercel, tipo Secret. El valor se transfirió mediante configuración local excluida de Git y no figura en documentos, comandos ni capturas de evidencia.
- Prueba mínima de Responses con `gpt-6-luna`, `store:false`: HTTP 200, estado completed y salida `OK`. Uso: 11 tokens de entrada y 5 de salida. No se enviaron newsletters ni calendario en esta prueba.
- Esta verificación acredita clave, permisos y acceso al modelo. Gmail/Calendar y la generación editorial completa siguen pendientes.

### Proyecto de Google y APIs preparados

- Verificada en la consola la creación del proyecto `la-senal-kindle-newspaper` dentro de la organización del propietario. Google Auth mostró `OAuth configuration created!`; la aceptación de la política había sido autorizada expresamente.
- Gmail API (`gmail.googleapis.com`) y Google Calendar API (`calendar-json.googleapis.com`) habilitadas; ambas muestran estado `Enabled`. No se vinculó facturación ni se contrataron servicios de pago durante estas acciones.
- Formulario del cliente web «La Señal — Vercel» preparado con una sola URI de retorno: `https://kindle-newspaper.vercel.app/oauth/callback`. Sin orígenes JavaScript. Creación de credencial y guardado en Vercel pendientes de confirmación explícita solicitada.
- Las APIs habilitadas y la configuración OAuth no equivalen a acceso al correo: siguen pendientes credencial, usuarios de prueba y consentimientos individuales de Gmail/Calendar.

### Credencial Google configurada en Vercel

- El propietario completó la creación del cliente «La Señal — Vercel». Verificado en la consola el cliente web habilitado y la URI exacta `/oauth/callback` del servicio, sin orígenes JavaScript adicionales.
- Identificador y secreto guardados como variables sensibles `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` de producción en Vercel. Ningún valor secreto se incluye en Git.
- El acceso efectivo de las cuentas requiere todavía finalizar los consentimientos y comprobar los tokens desde el servicio. La aplicación está en modo Testing; no se declara operación diaria permanente.

### Conexiones reales y diagnóstico del primer periódico

- Servicio verificado con ambas cuentas Google conectadas. La lectura real obtuvo 9 newsletters y 1 evento del calendario; no se guardó su contenido en Git.
- La generación falló en etapa editorial con HTTP 400. Una petición aislada con datos ficticios confirmó `invalid_json_schema`: Structured Outputs rechaza el formato JSON Schema `uri` en las fuentes.
- Corregido el esquema enviado a OpenAI para usar cadenas HTTPS; se conserva la validación completa de URLs y su pertenencia a las fuentes investigadas después de recibir la respuesta.
- Una petición mínima con la misma clave respondió HTTP 200, completed, 14 tokens. No hay evidencia de que este fallo sea por saldo; la prueba no consulta el balance de facturación.
- Aún no hay una edición real publicada. Los dos intentos fallidos permanecen registrados y la protección contra reintentos ilimitados sigue activa.
- El esquema corregido fue aceptado con HTTP 200 en una prueba sintética limitada a 32 tokens (respuesta incompleta por ese límite deliberado). Se habilita una única recuperación manual adicional solamente para el intento 2 fallido con HTTP 400 en etapa editorial; cron no reintenta y el intento 3 vuelve a quedar bloqueado si falla.

### Primera edición real publicada y prueba física preparada

- Tras corregir el esquema, el intento 3 terminó HTTP 200: `published`, fecha 2026-09-29, seis páginas. Insumos: nueve newsletters seleccionadas y un evento del calendario conectado.
- Las seis páginas se descargaron mediante la credencial del dispositivo; tamaños, SHA-256 y dimensiones 600×800 coinciden con el manifiesto. Portada inspeccionada visualmente en el Mac, legible y sin cortes. No equivale a recepción física en el Kindle.
- Preparado `scripts/kindle_test_real_edition.sh`, prueba acotada a la portada de esta fecha. Copiado en el directorio propio `newspaper-real-test`, `RUNME.sh` y `documents/Periodico_real.sh`, con credencial privada, certificado y checksum esperado fuera de Git. Lanzador releído: `de2c37713704f258296033e917873012eb72c3fca23534139572403b07c0e073`.
- Pendiente abrir «Periodico real» o ejecutar `;log runme` con Wi-Fi y sin USB, confirmar la portada y revisar el registro numerado. No se ha instalado todavía un lector multipágina ni confirmado despertar autónomo.

### Navegación entre páginas: preparación de KOReader

- El usuario confirmó la portada real en el dispositivo y reportó que no podía avanzar de 1/6. La prueba anterior solo dibujaba `page-1.png` mediante FBInk: no contenía manejo de gestos. Los informes hasta `network-8.txt` confirman descarga/render con salida 0; no demuestran navegación.
- Preparada la edición completa como CBZ: seis PNG originales, ordenados, con cada tamaño y SHA-256 cotejado con el manifiesto; archivo ZIP validado. Se almacena localmente fuera de Git porque contiene información personal.
- Lector seleccionado: KOReader oficial v2026.07.1, paquete `kindlepw2`, compatible con Kindle Basic según su código. Release: https://github.com/koreader/koreader/releases/tag/v2026.07.1 . SHA-256 del ZIP verificado otra vez: `ea1f575c54492a2c679d128b7f3210fd7d6a87e5f5a1ff1f7a7fe2080ff68f86`.
- Añadido `scripts/kindle_open_newspaper.sh`: valida propietario, firmware y checksum del CBZ, abre el documento con el wrapper oficial y registra salida. No usa `--framework_stop`, no programa RTC ni modifica arranque. El wrapper oficial pausa temporalmente servicios de interfaz/USB y los restaura al salir; antes de reconectar USB se debe salir de KOReader.
- Configuración inicial en español, ajuste de página completa y pie adicional desactivado. La edición ya lleva numeración impresa. Tocar zona media derecha avanza y zona media izquierda retrocede; tocar arriba abre el menú del lector.
- Esta primera prueba del lector usa la edición precargada por USB. La descarga inalámbrica completa, actualización diaria dentro del lector y despertar automático siguen pendientes.
- Instalación USB completada: 1,029 archivos del paquete oficial copiados y releídos con comparación SHA-256 individual; seis páginas CBZ instaladas y lanzador verificado. No había instalación previa de KOReader. El resultado funcional táctil queda pendiente de la prueba del usuario.

### Recuperación de documento y Pablo’s Time

- Tras el reporte de borrado accidental, `current.cbz` estaba ausente. KOReader registró apertura correcta y cierre con código 0; el wrapper restauró interfaz y USB. El fallo no fue una corrupción del lector.
- Restaurada una nueva edición CBZ de siete páginas y verificado su SHA-256 desde el Kindle: portada Image Gen, índice/editorial, agenda de tres eventos y cuatro noticias. La agenda se obtuvo mediante el conector de Google, consultando los cuatro calendarios, incluido el de festivos sin eventos ese día. No se incluyen datos personales en Git.
- Configurado `end_document_action = "goto_beginning"`: al terminar vuelve al inicio, evitando el menú de fin que incluía «Delete file». Se conserva acceso al menú normal para salir. No es un bloqueo total de la gestión de archivos.
- Primera portada de Pablo’s Time creada con la herramienta incorporada Image Gen y guardada con su prompt en `assets/covers/`. Ilustración editorial monocroma inspirada en The New Yorker, concepto «Antes de dejarlo volar». No se atribuye a la herramienta un modelo interno no confirmado.
- Probada además la integración cloud real con Responses y herramienta `image_generation`, modelo explícito `gpt-image-2.5-flare`, calidad medium, una imagen. Resultado completado y normalizado a 600×800, 382136 bytes. Uso guardado fuera de Git. La agenda no se envía al generador.
- Próximas generaciones: investigación/editorial, portada basada en noticias y agenda completa; caché privada diaria de editorial/portada para no repetir resultados ya generados. Borradores sujetos a la misma ventana de retención. Si falla la portada, no se publica una edición incompleta.
- Google Calendar requiere permiso adicional `calendar.calendarlist.readonly`. Implementada enumeración paginada de calendarios, eventos recurrentes, orden CDMX y deduplicación por iCalUID/ocurrencia. Pendiente consentimiento y prueba cloud de la lista ampliada.
- Fuentes técnicas: https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list y https://developers.openai.com/api/docs/guides/image-generation .
