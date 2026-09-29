# Verificación después de WinterBreak2

Objetivo: comprobar el entorno instalado en el Kindle Basic 2014 / KT2 con firmware 5.12.2.2, conservar evidencia técnica por USB y distinguir presencia de archivos, ejecución y persistencia.

## Resultado actual

El probe directo desde el navegador confirmó `uid=0`, arquitectura `armv7l` y firmware `5.12.2.2`. La instalación de KMC está incompleta: el directorio está vacío salvo enlaces colgantes; no están FBInk, KPM, Gandalf ni el hook de arranque. OTA sigue presente y en ejecución. `JAILBROKEN.txt` y el texto `Done` no demostraban una instalación correcta.

La [reparación offline](REPARACION.md) está preparada y copiada con hashes verificados; su ejecución, comprobaciones en ARM y reinicio siguen pendientes. El disparador local ya está configurado para la reparación. Los procedimientos de Biblioteca, búsqueda y probe de este documento conservan el historial de diagnóstico. No se deben interpretar como una secuencia que deba repetirse antes de la reparación.

## Entorno revisado

Se inspeccionó el instalador `jb.sh v1.3.7` del 28 de septiembre de 2026, sin ejecutarlo durante esta revisión. Su SHA-256 es `65a63528fbe9515950cc3aa0d931749548680f37898a3819a4ebc0a740588942`. La URL remota utilizada por WinterBreak2 puede cambiar; este hash identifica únicamente el archivo inspeccionado.

Ese instalador usa el entorno HDNEXT: KPM, SH_Integration y FBInk. Selecciona `kindlepw2` cuando no existe `/lib/ld-linux-armhf.so.3`, como corresponde a este firmware anterior a hard-float. Crea `/var/local/kmc/bin` como enlace a los binarios de esa plataforma y copia FBInk a `/mnt/us/libkh/bin/fbink`. No se requiere añadir KUAL, MRPI ni un hotfix de otra guía para esta prueba.

Su bloqueo OTA renombra `/usr/bin/otaupd` como `/usr/bin/otaupd.bck`; hace lo mismo con `otav3` si existe. La comprobación debe observar esos archivos y los procesos, no deducir el bloqueo de un mensaje de éxito.

El relleno temporal parcial de `.newspaper-ota-guard` **no acredita un bloqueo OTA eficaz**. El KT2 ya utiliza el último firmware que Amazon publica para este modelo. El relleno se conserva hasta verificar el bloqueo real; el diagnóstico no lo elimina ni lo completa.

## Script preparado

[kindle_verify.sh](../scripts/kindle_verify.sh) se ejecuta en el Kindle desde la biblioteca mediante SH_Integration. No debe ejecutarse con `sh` en el Mac. Antes de crear cualquier informe, exige Linux, las rutas esperadas del Kindle y la versión exacta `Kindle 5.12.2.2` en `/mnt/us/system/version.txt`. Rechaza otro firmware y el uso accidental en el Mac.

Produce un archivo nuevo en la raíz USB, `kt2-diagnostic-1.txt`, `kt2-diagnostic-2.txt`, etc. No sobrescribe informes anteriores. No lee ni copia número de serie, claves, Wi-Fi, biblioteca, cuenta ni logs generales del dispositivo.

La prueba ejecuta:

- Comprobaciones de existencia y permisos de los componentes esperados.
- `fbink -e`, descartando los metadatos y guardando su código de salida. Prueba el binario interno si existe, o la copia USB como alternativa, y registra la ruta elegida. Inicializa el framebuffer sin dibujar.
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

El wrapper de reparación exige que todas estas pruebas pasen antes de marcar éxito previo al reinicio y habilitar el diagnóstico de arranque. Este último usa el hook oficial mediante un `emergency.sh` revisado y una guarda de ejecución única; vuelve a ejecutar los mismos controles. No reinicia automáticamente.

El éxito requiere informes separados de instalación y arranque, códigos cero, `failed_checks=0` y evidencia de un reinicio real mediante `boot_time` distinto. El marcador `repair-001.success` aislado tampoco sustituye la inspección de los informes. La copia, ejecución y resultados concretos se registrarán en [REGISTRO.md](REGISTRO.md).

Cinco pruebas del verificador pasaron en el Mac con un sistema de archivos y comandos simulados. Incluyen corrupción de payload, proceso OTA activo y respuestas KPM inválidas. La comprobación SUID se simula por las restricciones del sandbox macOS. Esta validación prueba la lógica del verificador; no prueba ejecución ARM ni comportamiento de arranque en el Kindle.

## Cómo interpretar el informe

| Evidencia | Qué confirma | Qué no confirma |
| --- | --- | --- |
| Informe creado desde Biblioteca y `uid=0` | El scriptlet ejecutó código con privilegios | Que todos los componentes de HDNEXT funcionen |
| `kmc_bin_target=/var/local/kmc/kindlepw2/bin` | Selección de plataforma esperada | Que un binario ejecute correctamente |
| `fbink_initialization_rc=0` | FBInk ejecuta e inicializa el framebuffer | Dibujo de una imagen visible |
| `kpm_version_rc=0` y versiones/plataforma impresas | La CLI y biblioteca KPM cargan y responden | Descargas, repositorio accesible o instalación de paquetes |
| `otaupd_binary_state=renamed` y `otaupd_running=0` | Binario renombrado y daemon no detectado en esa ejecución | Un ensayo de actualización OTA ni protección frente a cambios futuros |
| `otav3_binary_state=neither_present` | No se encontró ninguno de esos dos nombres | Fallo de bloqueo: el firmware puede no incluir ese daemon |
| `boot_hook=1` o `patch_script=1` | Presencia del archivo esperado | Ejecución efectiva del hook |
| `diagnostic_complete=1` | El script llegó al final | Que todas las pruebas hayan pasado |

`original_present`, proceso activo, código no cero, `not_run`, ausencia del informe o del marcador final requieren diagnóstico; no se convierten en éxito. Si falla KPM pero aparece el informe, conservar la salida exacta antes de reinstalar cualquier cosa. Si sólo existe `JAILBROKEN.txt`, el jailbreak sigue sin comprobarse funcionalmente.

Para comprobar persistencia: conservar un informe, expulsar USB, reiniciar completamente y ejecutar otra vez **Diagnostico Kindle**. Comparar el nuevo `boot_time` y el tiempo de actividad, además de `uid=0`, FBInk, KPM y estado OTA. El reloj del Kindle puede estar desajustado: las fechas identifican observaciones y deben acompañarse del reinicio observado. Esta prueba no instala actualizaciones para comprobar supervivencia tras actualizar.

Una vez verificado el bloqueo OTA, podrá retirarse únicamente el relleno creado por este proyecto como una acción separada. La prueba de dibujo de una imagen, salida al lector, suspensión, despertar, Wi-Fi y actualización matutina también son pasos separados. No se consideran resueltos por este informe.

## Fuentes primarias

- [WinterBreak2](https://kindlemodding.org/jailbreaking/WinterBreak2/).
- [HDNEXT y KPM después del jailbreak](https://kindlemodding.org/jailbreaking/whats-next/).
- [Instalación de homebrew actual](https://kindlemodding.org/jailbreaking/whats-next/installing-homebrew.html).
- [Scriptlets y metadatos `Name` y `Author`](https://kindlemodding.org/kindle-dev/scriptlets.html).
- [Launcher SH_Integration del commit incluido en jb.sh](https://github.com/KindleModding/sh_integration/blob/adb7ef5c570a25c76fd64e94837ae0f590bd3b9c/launcher/main.c).
- [KPM CLI del commit incluido](https://raw.githubusercontent.com/KindleModding/KPM/799adf4/cli/main.c) y [efectos de su inicialización](https://raw.githubusercontent.com/KindleModding/KPM/799adf4/src/kpm.c).
- [Manual FBInk: opción `-e`](https://github.com/NiLuJe/FBInk/blob/master/CLI.md).
- [Instalador jb.sh](https://github.com/KindleModding/jb.sh); los nombres de archivos OTA y rutas anteriores se contrastaron además con el contenido empaquetado del instalador cuyo hash se registra arriba.

Validación histórica del script inicial: análisis de sintaxis con `sh -n`. Copiado como `documents/KT2_Diagnostico.sh` y checksum contrastado: `504f188b97840a43efbfc9aa5057bde499b0c66bbe246af076d87872de41607f` (3,995 bytes). Biblioteca y búsqueda no produjeron informes; el diagnóstico posterior por navegador sí confirmó root e instalación incompleta. La validación de la reparación en el dispositivo sigue pendiente.
