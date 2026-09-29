# Reparación offline de KMC

**Estado: jailbreak funcional verificado y primera portada observada.** Los informes 003 y 005 confirman root tras reiniciar y todos los controles del sistema, incluida inicialización FBInk a 600 × 800. `preview-5.txt` registra render con código cero y el usuario confirmó «La Señal». Los informes no alcanzan sus marcadores finales: cierre normal y retorno de pantalla no verificados.

## Diagnóstico confirmado

El probe inicial informó `uid=0`, arquitectura `armv7l` y firmware `5.12.2.2`, pero encontró KMC vacío salvo enlaces colgantes, sin componentes ni hook y con OTA activo. Ese diagnóstico motivó la reparación. El comprobante `JAILBROKEN.txt` del primer instalador no acreditaba una instalación completa. La reparación posterior cambió ese estado; su resultado observado se detalla abajo.

La causa exacta de la extracción fallida no está establecida. El XZ del instalador usa un diccionario de 64 MiB; su tar ocupa 24,330,240 bytes y el diagnóstico observó 26,332 KiB libres en `/tmp`. Son restricciones relevantes de recursos, no una prueba causal. Esta reparación evita la descompresión XZ en el Kindle.

## Origen e integridad

Se utiliza exclusivamente el snapshot inspeccionado de jb.sh **v1.3.7**, SHA-256:

```text
65a63528fbe9515950cc3aa0d931749548680f37898a3819a4ebc0a740588942
```

[build_offline_repair.py](../scripts/build_offline_repair.py) exige ese hash antes de producir salida. Extrae en el Mac 38 archivos oficiales y 10 directorios del archivo embebido; no ejecuta el instalador. Rechaza rutas absolutas, traversal, enlaces, entradas duplicadas y tipos de archivo no admitidos. El destino debe ser un directorio local nuevo, nunca el volumen Kindle.

Produce los archivos ya extraídos, `MANIFEST.json`, hashes de cada archivo en `payload.sha256`, controles de reparación, un manifiesto del paquete `bundle.sha256` y el diff de la adaptación. Los binarios y el snapshot descargado permanecen fuera de Git.

## Adaptación revisada del instalador

El constructor selecciona la cola del instalador oficial desde `00_helpers.sh` hasta antes de su bloque final. Verifica que cada transformación corresponda al número exacto de coincidencias esperado. La adaptación:

- Usa los archivos ya extraídos en `/mnt/us/newspaper-repair/kmc` en lugar de `/tmp/kmc`.
- Omite las limpiezas USB de archivos `.tmp.partial`, `.bin` y documentos `.run_hotfix` del original.
- Comprueba el resultado de copia y restaura los modos exactos del archivo oficial, porque FAT no conserva permisos Unix: 20 archivos a `0755`, 18 a `0644` y 10 directorios a `0755`.
- Verifica los hashes de los 38 archivos antes de que la lógica oficial aplique SUID e inmutabilidad.
- Excluye el bloque final que reinicia la interfaz y escribe `JAILBROKEN.txt`.
- Conserva la lógica oficial de instalación y parches; no añade un `set -e` global que altere sus tolerancias a componentes ausentes.

No realiza reset, formateo, downgrade ni respaldo de contenido. La reparación sí modifica las rutas internas necesarias para instalar KMC y aplicar sus parches, incluido el bloqueo OTA. El diff generado permite revisar esas diferencias respecto de la cola original.

La lógica oficial conserva un archivo interno `factory_reset.bck` como parte del parche del sistema. No es un respaldo de libros, notas, cuenta ni otro contenido del usuario. Esta distinción evita presentar la modificación como si no conservara ningún archivo técnico interno.

La cola adaptada copiada tiene SHA-256 `ee351970a14b5c0c199af4ed5591d3a715c886e50b98a379e81a05d50ab40878`. El manifiesto `bundle.sha256` tiene SHA-256 `ef921ebbb16b06b68387ae0d7abb07cc1757f5ade938a1e911b4076f0e2fae44`, comprobado durante la copia inicial. Sus 48 entradas se verificaron de nuevo sin errores tras el intento. El HTML inicial de reparación tenía SHA-256 `45f23379a96a11fcd038b4e38a931aa609d289ae8a2e799bcefb09beea0aa469`; posteriormente se sustituyó por la entrada trazable descrita abajo.

## Ejecución de la reparación y controles

[kindle_repair_offline.sh](../scripts/kindle_repair_offline.sh) sólo acepta Linux, UID 0, `armv7l` y firmware `5.12.2.2`. Comprueba el propietario del directorio de preparación, integridad del paquete, utilidades, espacio en `/var/local` y ausencia de controles o actualizaciones inesperadas. Si encuentra KPM instalado o un `emergency.sh` previo, se detiene para revisar el cambio de estado.

El wrapper usa una guarda de ejecución única y crea un informe privado. Ejecuta la cola con **`RUN_MODE=1` y `JB_SH_DEBUG=0`**, sin debug ni reinicio automático. Restaura los permisos del archivo oficial e intenta volver a montar la raíz en sólo lectura al terminar, incluso ante salida por error. Ese intento de remount falló con EBUSY en esta ejecución; no se presenta como completado.

El intento posterior a la quinta expulsión no produjo un informe de reparación. La nueva preparación añade [kindle_repair_launch.sh](../scripts/kindle_repair_launch.sh), que registra UID, sistema, arquitectura y `boot_time` antes de invocar el mismo wrapper. Tiene su propia guarda de ejecución única y conserva las guardas e integridad del paquete existente. Se copió como `newspaper-diagnostics/repair-launch-002.sh`, con SHA-256 `1031a9706c87369d03a091c7441c9590f912e0b0e817fc24f1675d33ec9492c1`.

El HTML [winterbreak2_repair_trace.html](../scripts/winterbreak2_repair_trace.html), SHA-256 `5d0bf643c2a45813d61e42ec184e13c7e2afea4755ad71324a52230f58044ff1`, llamó a ese launcher tras la sexta expulsión y el reinicio normal. Su informe confirmó UID 0, Linux, `armv7l`, `boot_time=1790643805` y código 1 del wrapper. La causa del intento anterior sin informe continúa sin establecerse; una instancia antigua de Pillow o del diálogo era sólo una hipótesis.

La foto posterior mostró `Done` y `Revision pendiente`. El informe confirma preflight, hashes y aplicación de permisos, Gandalf, SH_Integration, claves, dispatcher, banderas, hook y renombrado OTA. El instalador devolvió cero; tanto su montaje final como el del wrapper informaron `mount: / is busy`. El wrapper registró `repair_error=root_remount_failed` y `repair_exit_code=1`. No se conoce el proceso específico que causó EBUSY; no se ha forzado el montaje ni repetido la instalación.

El flujo debía ejecutar después [kindle_check_repair.sh](../scripts/kindle_check_repair.sh), pero **no llegó a ejecutarlo**. Tampoco creó `repair-001.success`, resultados postboot ni `emergency.sh`. FBInk USB sí se comprobó: 1,382,536 bytes y hash idéntico al oficial. Se verificaron de nuevo las 48 entradas del paquete y el hash de `bundle.sha256`. Los avisos EIPS sobre texto fuera del área 600 × 800 no prueban daño; ni esos avisos ni `Done` sustituyen los controles funcionales.

La verificación originalmente prevista en [kindle_postboot_repair.sh](../scripts/kindle_postboot_repair.sh) dependía de completar ese flujo. Se conserva su resultado fallido y se utiliza una comprobación independiente, sin crear artificialmente `repair-001.success`.

## Comprobación independiente tras el remount ocupado

[kindle_verify_after_restart.sh](../scripts/kindle_verify_after_restart.sh) exige el informe previo con `installer_exit_code=0` y `repair_error=root_remount_failed`, el paquete íntegro y un `boot_time` distinto. Ejecuta el checker existente sin modificarlo, sin instalar, montar ni cambiar ajustes del sistema. La comprobación de `kpm version` puede inicializar su propia base de datos.

Se copió como `newspaper-diagnostics/verify-after-restart-003.sh`: 1,829 bytes, SHA-256 `3887759199a74e169cef22369fcc01bc6e2bce07143ebd51f9de5d9fd01766a9`. La entrada [kindle_boot_verify_entry.sh](../scripts/kindle_boot_verify_entry.sh) se copió como `emergency.sh`: 153 bytes, SHA-256 `0d9fe0d58a7c78e573b651392fcf0e2a266d380df93f982d22fbbd63f4618015`. Ambas copias se verificaron. La entrada llama únicamente al verificador mediante el hook oficial; la guarda permite una sola ejecución.

Tras la séptima expulsión y el reinicio normal, el informe confirmó UID 0, `verification_boot_time=1790644442` frente a `installation_boot_time=1790643805` y `different_boot=1`. Pasaron los 38 hashes, KPM CLI 1.0.0/libkpm 0.2.2 para `kindlepw2`, Gandalf/SUID, directorios y enlaces, hook, dispatcher, banderas, SH_Integration, extractor, clave, OTA renombrado/detenido y `root_readonly=1`.

Sólo falló el control que usaba `fbink -e`. Se conserva ese resultado parcial sin alterar el fallo original de remount ni crear un éxito global. El diagnóstico 004 y la revisión posterior identificaron el defecto de `state_dump`, documentado en [VERIFICACION.md](VERIFICACION.md). Se retiró el `emergency.sh` propio después de verificar su hash y leer el informe. El relleno temporal se retiró tras confirmar OTA; no se modificó contenido personal.

La [prueba 005](VERIFICACION.md#verificación-y-portada-005--sistema-y-dibujo-confirmados) pasó todos los controles con el chequeo `-v`/EOF y dibujó la portada, confirmada por el usuario. No se cambió FBInk ni el paquete original. Después se dejó una entrada reutilizable en Biblioteca hacia el motor probado; sólo esa nueva entrada tiene verificación de sintaxis y copia, sin otra prueba física. Undécima expulsión confirmada. Wi-Fi, despertar y cloud siguen pendientes.

## Evidencia requerida

| Fase | Evidencia |
| --- | --- |
| Preparación local | Snapshot correcto, manifiesto y hashes generados. |
| Copia al Kindle | Verificación de todos los archivos transferidos; todavía no implica ejecución. |
| Entrada trazable | `repair-launch-002.txt` con contexto de ejecución y resultado del wrapper; por sí solo no confirma instalación. |
| Reparación aplicada | `repair-001.txt` conserva `installer_exit_code=0` y `repair_exit_code=1` por remount ocupado; no se reescribe como éxito. |
| Funcionalidad y persistencia | 003 confirmó root en un arranque distinto; 005 pasó todos los controles corregidos (`failed_checks=0`, `system_check_rc=0`). No se reescribe 003 como éxito global. |
| Pantalla | `preview-5.txt` registra `render_rc=0` y el usuario confirmó «La Señal»; cierre final y restauración no constan. |

Ni un archivo `.success` ni un mensaje en pantalla sustituyen la lectura del informe. Una falta de informe, un control fallido o un código no cero mantiene el resultado pendiente de revisión.

## Validación realizada en el Mac

Las seis pruebas de [test_repair_checks.py](../tests/test_repair_checks.py) pasan con archivos y comandos simulados: instalación consistente, payload modificado, fallo de FBInk, proceso OTA activo y dos respuestas KPM inválidas. La simulación rechaza `-e`; la condición SUID se simula porque el sandbox de macOS elimina ese bit.

Estas pruebas de host validan la lógica del verificador y no ejecutan binarios ARM. La prueba física posterior 003 sí aportó los resultados parciales descritos arriba. No se ha conectado Gmail o Calendar ni desplegado el periódico cloud como parte de esta reparación. Se mantiene la instrucción del usuario de no respaldar contenido.
