# Verificación después de WinterBreak2

Objetivo: comprobar el entorno instalado en el Kindle Basic 2014 / KT2 con firmware 5.12.2.2, conservar evidencia técnica por USB y distinguir presencia de archivos, ejecución y persistencia.

## Resultado actual

**Root al arrancar, KPM, parches y bloqueo OTA confirmados.** El informe 003 ejecutó con UID 0 y `boot_time=1790644442`, distinto del de instalación `1790643805`. Verificó los 38 archivos; KPM CLI 1.0.0/libkpm 0.2.2 para `kindlepw2`; Gandalf/SUID, permisos/enlaces, hook, dispatcher, banderas, SH_Integration (SQL 2/1), extractor y clave; ambos OTA renombrados y detenidos; y `root_readonly=1`.

El único control fallido del informe 003 usaba `fbink -e`: `failed_checks=1`, `restart_verification_rc=1`. El diagnóstico 004 confirmó código 139 en esa opción. La revisión del código y del ELF identifica un defecto en `state_dump` de FBInk 1.25.0: la rama Kindle pasa 56 argumentos para 57 conversiones de formato, al omitir un booleano en `isTolino`/`isSunxi`; el `%s` de `pixelFormat` recibe el valor `1` como puntero. [Código fijado](https://github.com/NiLuJe/FBInk/blob/83110d3d278cf9cd44cc1d16237e284a89f72633/fbink.c#L5908).

La prueba corregida 005 ya pasó todos los controles: `fbink_initializes=1`, `failed_checks=0`, `system_check_rc=0` y marcador `display-005.system-success`. FBInk con `-v` confirmó Basic/C6, 600 × 800, 8 bpp/Y8. Después, `preview-5.txt` registró inicialización y render con código cero; el usuario confirmó que vio «La Señal». El binario, el sistema y el paquete original de reparación no cambiaron.

**Límite de la evidencia:** `display-005.txt` termina después de `system_verification_passed=1`, sin código final del controlador. `preview-5.txt` termina después de registrar 15 segundos de observación y recuperación manual no verificada, sin `preview_complete` ni código final. No está comprobada la espera completa, la terminación normal ni la restauración de pantalla; la causa del corte es desconocida. La ejecución root tras reiniciar y el primer dibujo físico sí están acreditados.

## Verificación y portada 005 — sistema y dibujo confirmados

[kindle_verify_and_preview.sh](../scripts/kindle_verify_and_preview.sh) ejecutó el checker corregido, separado como `newspaper-diagnostics/check-installed-005.sh`, y después el motor [kindle_preview_cover.sh](../scripts/kindle_preview_cover.sh) en `newspaper-test/preview.sh`. Para esa prueba, Biblioteca y `RUNME.sh` compartían la entrada [kindle_run_verified_preview.sh](../scripts/kindle_run_verified_preview.sh). El resultado de sistema y dibujo está confirmado arriba; su cierre final no consta.

La primera versión copiada pretendía comprobar 600 × 800 desde `-v`/EOF y mostrar `cover-test.png` durante 15 segundos, pero su preflight exigía `xrefresh` para restaurar la GUI. Ese requisito detuvo la prueba antes de inicializar o renderizar. Los controles, PNG y `RUNME.sh` sí se copiaron y releyeron; hashes históricos en [REGISTRO.md](REGISTRO.md#archivos-iniciales-de-la-prueba-005--historial). El paquete original de 49 archivos permanece intacto.

Después de la novena expulsión, el usuario abrió la vista previa desde Biblioteca. Los informes `preview-1.txt` a `preview-4.txt` registran UID 0 y `error=xrefresh_missing_or_not_executable`, antes de inicializar o dibujar. El primero tiene UTC `2026-09-29T01:34:54Z`, firmware correcto, `preview_complete=0` y código 1. Quedó confirmado lanzamiento root por SH_Integration. En ese momento `display-005.txt` no existía: aún no se había recorrido la ruta completa de checker más preview.

La revisión copiada elimina `xrefresh` y conserva la GUI original activa. Da 15 segundos para observar la portada, pero la imagen puede persistir después hasta un redibujado nativo. La recuperación mediante USB o suspensión/despertar es manual y no está probada; **no se promete restauración automática**. El launcher oficial no requiere cambios: detiene su propia aplicación antes de intentar el `xrefresh` opcional e ignora su resultado. [Código revisado](https://github.com/KindleModding/sh_integration/blob/adb7ef5c570a25c76fd64e94837ae0f590bd3b9c/launcher/main.c#L180).

Después de la décima expulsión, el usuario abrió «Portada de prueba», confirmó «La Señal» y reconectó USB. El informe de sistema pasa todos los controles; `preview-5.txt` (UTC `2026-09-29T01:43:05Z`) confirma UID 0, hash correcto, `fbink_initialization_rc=0`, 600 × 800, GUI activa y `render_rc=0`. Los marcadores finales ausentes impiden afirmar cierre normal. Hashes de la revisión en [REGISTRO.md](REGISTRO.md#revisión-de-la-prueba-005-sin-xrefresh).

**Acceso final en Biblioteca:** tras validar esos resultados, `documents/Portada_de_prueba.sh` se sustituyó por [kindle_show_cover.sh](../scripts/kindle_show_cover.sh), que conserva los metadatos y `DontUseFBInk`, y llama directamente al motor ya probado. Evita la guarda de una sola ejecución del diagnóstico 005. La entrada nueva tiene sintaxis y copia verificadas, sin otra prueba física. `RUNME.sh` conserva el diagnóstico 005; no se indica repetirlo. Undécima expulsión segura confirmada.

Las seis pruebas host del checker pasan, incluida detección de fallo de FBInk; la simulación prohíbe `-e`. Esto valida el control propio, no sustituye la prueba ARM 005.

## Diagnóstico de pantalla 004 — completado

[kindle_probe_display.sh](../scripts/kindle_probe_display.sh) se copió como `documents/Pantalla_Kindle.sh`, nombre visible **Diagnostico pantalla**, autor **Kindle Newspaper**, con `DontUseFBInk` para evitar que su lanzamiento dependa de FBInk. SHA-256: `36358d8a5786efb8a754073a51d397fabf4d5f389e2741cc0dec06653054023c` (2,657 bytes).

El probe registra UID, kernel, capacidades de CPU, dispositivos framebuffer y dependencias del loader. Captura stderr y códigos de `fbink --help` y `fbink -e`, este último con y sin `LD_LIBRARY_PATH`; de stdout conserva sólo dimensiones, sin seriales. No instala, usa red, cambia servicios ni monta sistemas de archivos. El aviso visible usa `eips`.

El `RUNME.sh` anterior del proyecto se sustituyó tras verificar su hash por [kindle_run_display_probe.sh](../scripts/kindle_run_display_probe.sh), 125 bytes y SHA-256 `9fb2ee51e87262d94c181f2c8d21de986ad8b7954ff45233b200b8e6dcd70567`. Ambas copias y sintaxis shell están comprobadas.

Después de la octava expulsión, `display-004` confirmó UID 0, kernel `3.0.35-lab126`, ARMv7/NEON Wario y framebuffer `mxc_epdc` presente. El loader y `fbink --help` devuelven cero; `-e` produce un fallo de segmentación con código 139 tanto con `LD_LIBRARY_PATH` como sin esa variable. Esa evidencia condujo a la corrección del checker descrita arriba.

Los procedimientos siguientes son historial. Los controles y la primera portada física están confirmados con los límites de cierre descritos arriba; Wi-Fi, despertar matutino y cloud siguen pendientes.

## Entorno revisado

Se inspeccionó el instalador `jb.sh v1.3.7` del 28 de septiembre de 2026, sin ejecutarlo durante esta revisión. Su SHA-256 es `65a63528fbe9515950cc3aa0d931749548680f37898a3819a4ebc0a740588942`. La URL remota utilizada por WinterBreak2 puede cambiar; este hash identifica únicamente el archivo inspeccionado.

Ese instalador usa el entorno HDNEXT: KPM, SH_Integration y FBInk. Selecciona `kindlepw2` cuando no existe `/lib/ld-linux-armhf.so.3`, como corresponde a este firmware anterior a hard-float. Crea `/var/local/kmc/bin` como enlace a los binarios de esa plataforma y copia FBInk a `/mnt/us/libkh/bin/fbink`. No se requiere añadir KUAL, MRPI ni un hotfix de otra guía para esta prueba.

Su bloqueo OTA renombra `/usr/bin/otaupd` como `/usr/bin/otaupd.bck`; hace lo mismo con `otav3` si existe. La comprobación debe observar esos archivos y los procesos, no deducir el bloqueo de un mensaje de éxito.

El relleno parcial de `.newspaper-ota-guard` no acreditaba un bloqueo OTA eficaz. Se retiró como acción separada después de confirmar OTA en el informe 003; su carpeta ya no existe. También se retiró el `emergency.sh` propio del diagnóstico de arranque tras verificar su hash.

## Script inicial — historial

[kindle_verify.sh](../scripts/kindle_verify.sh) se ejecuta en el Kindle desde la biblioteca mediante SH_Integration. No debe ejecutarse con `sh` en el Mac. Antes de crear cualquier informe, exige Linux, las rutas esperadas del Kindle y la versión exacta `Kindle 5.12.2.2` en `/mnt/us/system/version.txt`. Rechaza otro firmware y el uso accidental en el Mac.

Produce un archivo nuevo en la raíz USB, `kt2-diagnostic-1.txt`, `kt2-diagnostic-2.txt`, etc. No sobrescribe informes anteriores. No lee ni copia número de serie, claves, Wi-Fi, biblioteca, cuenta ni logs generales del dispositivo.

La prueba ejecuta:

- Comprobaciones de existencia y permisos de los componentes esperados.
- El script inicial usaba `fbink -e`, descartando metadatos y guardando su código de salida. Esa opción quedó invalidada para esta prueba por el defecto de `state_dump`; el checker 005 usa `-v` con EOF y conserva stderr.
- `kpm version`, guardando versión, plataforma y código de salida. No usa la red ni instala paquetes.
- Comprobaciones de los nombres originales y `.bck` de OTA, y de si sus procesos están activos.

**Efecto de KPM:** incluso `version` inicializa su base de datos antes de procesar el comando. Puede crear tablas y actualizar el registro del repositorio oficial y del propio KPM. Esta comprobación funcional está dentro de la intervención autorizada; no es una operación estrictamente de sólo lectura. El script no modifica firmware, cuenta, configuración OTA ni otros paquetes. Su escritura propia es el informe técnico USB.

## Preparación y paso físico

1. Después de que WinterBreak2 termine y el Kindle responda, cerrar cualquier error de aplicación indicado por el instalador y esperar a volver a Inicio. No repetir el jailbreak por ver ese diálogo durante el reinicio de la interfaz.
2. Activar **Modo avión** y realizar un reinicio completo desde **Configuración → menú de tres puntos → Reiniciar**. En algunas interfaces aparece como **Configuración → Opciones del dispositivo → Reiniciar**. No elegir Restablecer.
3. Conectar al Mac. Conservar el contenido de `documents/JAILBROKEN.txt`, si existe, y comprobar `libkh/bin/fbink`. Son indicios; no constituyen la verificación funcional.
4. Copiar el script preparado como `/Volumes/Kindle/documents/KT2_Diagnostico.sh`. Comparar el SHA-256 del original y de la copia. Este documento no realiza esa copia.
5. Expulsar el volumen desde el Mac y desconectar el cable.
6. En el Kindle, abrir **Biblioteca**, quitar filtros que oculten documentos y tocar **Diagnostico Kindle**, autor **Kindle Newspaper**. No se escribe ningún comando en la búsqueda para ejecutarlo.
7. Esperar a volver a Biblioteca. Conectar por USB y leer el nuevo `/Volumes/Kindle/kt2-diagnostic-N.txt`.

Para reducir ciclos USB, puede precolocarse `KT2_Diagnostico.sh` antes de ejecutar WinterBreak2. Un `.sh` con ese nombre normal no tiene una ruta de ejecución automática en el instalador revisado. Sin embargo, no se verificó que todos los escáneres antiguos reindexen retroactivamente archivos con una extensión que antes no reconocían. Si no aparece, comprobar filtros e integridad del archivo antes de elegir otra vía. Los nombres especiales `emergency.sh` y `RUNME.sh` requieren revisar expresamente su contenido y mecanismo de activación; no se usan como sustitutos arbitrarios del nombre del script.

## Alternativa manual desde búsqueda

El usuario confirmó que no aparece `Diagnostico Kindle` en Biblioteca. Se volvió a comprobar por USB que `documents/KT2_Diagnostico.sh` mantiene el hash esperado y que no existe ningún informe. El texto que sí pudo abrir era `documents/JAILBROKEN.txt`, creado por el instalador; no ejecuta la prueba.

Se preparó [kindle_run_diagnostic.sh](../scripts/kindle_run_diagnostic.sh), que sólo invoca el diagnóstico conocido y registra el inicio y código de salida en un archivo nuevo `kt2-diagnostic-launch-N.txt`. No instala componentes, reinicia ni usa la red.

El `dispatch.sh` incluido en el instalador revisado dirige el argumento `runme` a `/mnt/us/RUNME.sh`. `patch_system.sh` instala ese dispatcher como `/usr/bin/logThis.sh`, activa la bandera necesaria y registra `;log` en los comandos de búsqueda. Esta ruta depende de que esos parches hayan aplicado; no se presupone que funcionen. No necesita crear `jb.sh.debug` ni activar telnet.

Comprobada la ausencia de un `RUNME.sh` previo, se copió el wrapper: 889 bytes, SHA-256 `3dd8d0471cdf891c6f0cdf4a0a7f6dc9cceb8abd5da7d72b1d160915300f5991`. Se comparó con el original y se expulsó el volumen de forma segura.

Paso manual: mantener Modo avión, escribir exactamente `;log runme` en la búsqueda y pulsar Enter; esperar unos 15 segundos y reconectar USB. Puede no haber aviso visible. Leer los informes para verificar ejecución. Una búsqueda normal con «Sin resultados» o la ausencia de informes no acreditan éxito. No repetir comandos automáticamente ni reinstalar como respuesta a esa ausencia.

Esta prueba comprueba ejecución a través del dispatcher. Aunque funcione, no confirma que SH_Integration esté registrado ni que el archivo aparezca en Biblioteca. La copia de `RUNME.sh` queda identificada como temporal para retirarla cuando se haya recogido la evidencia.

**Resultado observado:** después de la prueba y reconexión no existe ningún informe. Los scripts siguen íntegros y ejecutables desde el montaje USB. No se ha demostrado que el dispatcher funcione; tampoco puede descartarse una salida temprana por las guardas anteriores al registro.

## Comprobación directa desde el navegador — historial

Para obtener evidencia sin depender del dispatcher, KPM o SH_Integration, se prepararon [kindle_probe_direct.sh](../scripts/kindle_probe_direct.sh) y [winterbreak2_diagnostic.html](../scripts/winterbreak2_diagnostic.html). El servidor WB2 abre el `dialoger.html` local, según [su código](https://raw.githubusercontent.com/KindleModding/Winterbreak2/master/api/index.js). La adaptación conserva ese mecanismo y sustituye el comando de instalación por una llamada al probe copiado en USB.

El probe sólo acepta Linux y el directorio propio con su marcador `OWNER.txt`. Crea un bloqueo `run-001.lock` para impedir ejecuciones repetidas, y guarda `newspaper-diagnostics/report-001.txt` antes de comprobar la versión. Recoge UID, arquitectura, disponibilidad de utilidades, espacio de `/tmp`, `/var/local` y USB, y metadatos de rutas concretas de KMC/OTA. No vuelca versiones completas, seriales, claves, red, libros ni logs generales. Después intenta el diagnóstico existente; éste puede inicializar la DB de KPM si el componente funciona, como ya está documentado.

La copia USB de `winterbreak2/dialoger.html` ya no contiene `curl` ni `jb.sh`. Su comando usa únicamente el script local, con salida redirigida a los informes y un identificador de transferencia nuevo. Conserva la URL de transferencia loopback del mecanismo original; no envía el informe al sitio web, no abre puertos ni shell remota.

Pasos utilizados para el diagnóstico: expulsar, conectar Wi-Fi, abrir `https://penguins184.xyz/wb2` y pulsar una vez su botón **Jailbreak**; esperar unos 30 segundos y reconectar USB. El probe podía dibujar `Diagnostico guardado. Conecta USB.`; el informe con `uid=0` aportó la evidencia de root. **Ese HTML fue sustituido después por el de reparación: el mismo botón ya no ejecuta el diagnóstico anterior.** Las instrucciones de esta sección son históricas.

**Resultado:** el informe confirmó ejecución root y la instalación incompleta descrita arriba. El tar embebido ocupa 24,330,240 bytes, el XZ declara un diccionario de 64 MiB y el diagnóstico midió 26,332 KiB libres en `/tmp`. Esas restricciones justifican evitar la descompresión en el dispositivo en la reparación preparada, pero no demuestran cuál fue la causa del fallo inicial. No se dispone de una traza de ese fallo que la establezca.

## Verificación de la reparación preparada

[kindle_check_repair.sh](../scripts/kindle_check_repair.sh) compara los 38 archivos instalados contra sus hashes y comprueba ejecutables, permisos y enlaces de plataforma; inicialización de FBInk; salida válida y código cero de KPM; copia USB de FBInk; hook de arranque; dispatcher; registro de SH_Integration; clave de actualización; OTA renombrado y detenido; y raíz montada en sólo lectura. La ejecución de `kpm version` conserva el efecto de inicialización de base de datos descrito anteriormente.

El flujo original exigía todas estas pruebas antes de marcar éxito y habilitar su diagnóstico de arranque. No llegó a esa fase por el remount ocupado. La nueva comprobación utiliza el hook oficial mediante un `emergency.sh` revisado y una guarda de ejecución única, con sus propias precondiciones y resultado independiente. No reinicia automáticamente, no fuerza montajes ni reinstala.

El informe independiente 003 se obtuvo y conservó `repair_exit_code=1` como hecho histórico. Confirma `different_boot=1`, pero termina con un fallo de FBInk y código 1; no hay éxito global. Los controles que sí pasaron sustentan los resultados parciales arriba. La copia, ejecución y resultados concretos se registran en [REGISTRO.md](REGISTRO.md).

Seis pruebas del verificador pasan en el Mac con archivos y comandos simulados: incluyen corrupción de payload, fallo de FBInk, OTA activo y respuestas KPM inválidas. La comprobación SUID se simula por las restricciones del sandbox macOS. Esta validación prueba la lógica del verificador; los resultados físicos de cada ejecución se registran por separado.

## Cómo interpretar el informe

| Evidencia | Qué confirma | Qué no confirma |
| --- | --- | --- |
| Informe creado desde Biblioteca y `uid=0` | El scriptlet ejecutó código con privilegios | Que todos los componentes de HDNEXT funcionen |
| `kmc_bin_target=/var/local/kmc/kindlepw2/bin` | Selección de plataforma esperada | Que un binario ejecute correctamente |
| `fbink_initialization_rc=0` mediante `-v`/EOF en 005 | FBInk ejecuta e inicializa el framebuffer sin dibujar | Dibujo de una imagen visible; no aplica al chequeo histórico con `-e` |
| `kpm_version_rc=0` y versiones/plataforma impresas | La CLI y biblioteca KPM cargan y responden | Descargas, repositorio accesible o instalación de paquetes |
| `otaupd_binary_state=renamed` y `otaupd_running=0` | Binario renombrado y daemon no detectado en esa ejecución | Un ensayo de actualización OTA ni protección frente a cambios futuros |
| `otav3_binary_state=neither_present` | No se encontró ninguno de esos dos nombres | Fallo de bloqueo: el firmware puede no incluir ese daemon |
| `boot_hook=1` o `patch_script=1` | Presencia del archivo esperado | Ejecución efectiva del hook |
| `diagnostic_complete=1` | El script llegó al final | Que todas las pruebas hayan pasado |

`original_present`, proceso activo, código no cero, `not_run`, ausencia del informe o del marcador final requieren diagnóstico; no se convierten en éxito. Si falla KPM pero aparece el informe, conservar la salida exacta antes de reinstalar cualquier cosa. Si sólo existe `JAILBROKEN.txt`, el jailbreak sigue sin comprobarse funcionalmente.

Para comprobar persistencia: conservar un informe, expulsar USB, reiniciar completamente y ejecutar otra vez **Diagnostico Kindle**. Comparar el nuevo `boot_time` y el tiempo de actividad, además de `uid=0`, FBInk, KPM y estado OTA. El reloj del Kindle puede estar desajustado: las fechas identifican observaciones y deben acompañarse del reinicio observado. Esta prueba no instala actualizaciones para comprobar supervivencia tras actualizar.

Tras verificar OTA se retiró únicamente el relleno del proyecto. El primer dibujo ya está confirmado; salida al lector, suspensión, despertar, Wi-Fi y actualización matutina siguen siendo pruebas separadas y pendientes.

## Fuentes primarias

- [WinterBreak2](https://kindlemodding.org/jailbreaking/WinterBreak2/).
- [HDNEXT y KPM después del jailbreak](https://kindlemodding.org/jailbreaking/whats-next/).
- [Instalación de homebrew actual](https://kindlemodding.org/jailbreaking/whats-next/installing-homebrew.html).
- [Scriptlets y metadatos `Name` y `Author`](https://kindlemodding.org/kindle-dev/scriptlets.html).
- [Launcher SH_Integration del commit incluido en jb.sh](https://github.com/KindleModding/sh_integration/blob/adb7ef5c570a25c76fd64e94837ae0f590bd3b9c/launcher/main.c).
- [KPM CLI del commit incluido](https://raw.githubusercontent.com/KindleModding/KPM/799adf4/cli/main.c) y [efectos de su inicialización](https://raw.githubusercontent.com/KindleModding/KPM/799adf4/src/kpm.c).
- [Manual FBInk: opción `-e`](https://github.com/NiLuJe/FBInk/blob/master/CLI.md).
- [Instalador jb.sh](https://github.com/KindleModding/jb.sh); los nombres de archivos OTA y rutas anteriores se contrastaron además con el contenido empaquetado del instalador cuyo hash se registra arriba.

Validación histórica del script inicial: `sh -n` y copia `documents/KT2_Diagnostico.sh` con SHA-256 `504f188b97840a43efbfc9aa5057bde499b0c66bbe246af076d87872de41607f` (3,995 bytes). El navegador permitió diagnosticar la instalación incompleta. Después de repararla, 003 verificó root, KPM, OTA y parches; 004 localizó el fallo en `-e`; 005 pasó todos los controles corregidos y dibujó la portada, confirmada por el usuario. El cierre final no consta en los informes.

## Entrega HTTPS observada en el dispositivo

La prueba `network-2.txt` confirmó conexión Wi-Fi, HTTP 200, validación TLS satisfactoria, checksum exacto de la portada, render FBInk correcto y cierre normal. El propietario confirmó haber visto «Una señal que llega por Wi-Fi». Esto acredita la entrega de una imagen de prueba desde el servicio privado de Vercel al Kindle sin cable durante la prueba. No acredita aún actualización automática, despertar programado ni generación a partir de Gmail y Calendar.
