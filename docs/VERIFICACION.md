# Verificación después de WinterBreak2

Objetivo: comprobar el entorno instalado en el Kindle Basic 2014 / KT2 con firmware 5.12.2.2, conservar evidencia por USB y distinguir presencia de archivos de funcionamiento. Este documento describe una prueba pendiente; su existencia no demuestra que el dispositivo esté modificado.

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
- `fbink -e`, descartando los metadatos y guardando su código de salida. Inicializa el framebuffer sin dibujar.
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

Para reducir ciclos USB, puede precolocarse `KT2_Diagnostico.sh` antes de ejecutar WinterBreak2. Un `.sh` con ese nombre normal no tiene una ruta de ejecución automática en el instalador revisado. Sin embargo, no se verificó que todos los escáneres antiguos reindexen retroactivamente archivos con una extensión que antes no reconocían. Si después del jailbreak y del reinicio no aparece, reconectar USB y copiarlo con un nombre nuevo, por ejemplo `KT2_Diagnostico_2.sh`, conservando los mismos metadatos. Expulsar y revisar Biblioteca de nuevo. No usar los nombres especiales `emergency.sh` o `runme.sh` como atajo.

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

Validación local del script: análisis de sintaxis con `sh -n`. La prueba en el Kindle sigue pendiente hasta obtener y revisar los informes.
