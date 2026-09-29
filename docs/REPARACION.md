# Reparación offline de KMC

**Estado: paquete íntegro; sin avance de instalación comprobado.** Los 49 archivos de reparación no cambiaron tras el intento. Las fotos sólo muestran descarga MOBI y por USB no hay marcadores o informes de reparación ni postboot; FBInk y `emergency.sh` siguen ausentes. Esto no demuestra que ningún código se iniciara antes del primer punto observable. Se ha preparado una entrada trazable para un único intento después de un reinicio normal completo. Los hashes y resultados se documentan en [REGISTRO.md](REGISTRO.md).

## Diagnóstico confirmado

El probe ejecutado por el disparador del navegador informó `uid=0`, arquitectura `armv7l` y firmware `5.12.2.2`. El acceso root funciona por esa vía, pero KMC está vacío salvo enlaces colgantes. Faltan FBInk, KPM, Gandalf y el hook de arranque; OTA está presente y en ejecución. El comprobante `JAILBROKEN.txt` del primer instalador no acreditaba una instalación completa.

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

## Ejecución prevista y controles

[kindle_repair_offline.sh](../scripts/kindle_repair_offline.sh) sólo acepta Linux, UID 0, `armv7l` y firmware `5.12.2.2`. Comprueba el propietario del directorio de preparación, integridad del paquete, utilidades, espacio en `/var/local` y ausencia de controles o actualizaciones inesperadas. Si encuentra KPM instalado o un `emergency.sh` previo, se detiene para revisar el cambio de estado.

El wrapper usa una guarda de ejecución única y crea un informe privado. Ejecuta la cola con **`RUN_MODE=1` y `JB_SH_DEBUG=0`**, sin debug ni reinicio automático. Usa permisos adecuados para que los procesos del Kindle puedan atravesar los directorios instalados y vuelve a montar la raíz en sólo lectura al terminar, incluso ante salida por error.

El intento posterior a la quinta expulsión no produjo un informe de reparación. La nueva preparación añade [kindle_repair_launch.sh](../scripts/kindle_repair_launch.sh), que registra UID, sistema, arquitectura y `boot_time` antes de invocar el mismo wrapper. Tiene su propia guarda de ejecución única y conserva las guardas e integridad del paquete existente. Se copió como `newspaper-diagnostics/repair-launch-002.sh`, con SHA-256 `1031a9706c87369d03a091c7441c9590f912e0b0e817fc24f1675d33ec9492c1`.

El HTML actual, [winterbreak2_repair_trace.html](../scripts/winterbreak2_repair_trace.html), llama a ese launcher y tiene SHA-256 `5d0bf643c2a45813d61e42ec184e13c7e2afea4755ad71324a52230f58044ff1`. Ambas copias se releyeron y verificaron sin modificar los 49 archivos del paquete. La sexta expulsión segura está confirmada. Se indicó desconectar USB, realizar un reinicio normal completo antes de abrir WB2, conectar Wi-Fi y pulsar una sola vez. Una instancia antigua de Pillow o del diálogo sigue siendo sólo una hipótesis; el resultado de este nuevo intento está pendiente.

Después del intento, `Reparacion lista` indica activar Modo avión, reiniciar completamente y reconectar; `Revision pendiente` o sólo una descarga indican esperar un minuto y reconectar sin reintentar. La aceptación depende de los informes, no sólo del mensaje visible.

Después ejecuta [kindle_check_repair.sh](../scripts/kindle_check_repair.sh). Deben pasar los hashes completos, FBInk, KPM, Gandalf/SUID, permisos, enlaces, dispatcher, hook de arranque, SH_Integration, clave de actualización y bloqueo OTA. KPM puede inicializar su base de datos durante `version`; no se presenta como una operación estrictamente de sólo lectura.

Sólo si esos controles pasan se prepara `emergency.sh`, con un contenido acotado que llama a [kindle_postboot_repair.sh](../scripts/kindle_postboot_repair.sh). El hook oficial lo utiliza después del reinicio para repetir las comprobaciones una sola vez. No es una shell remota ni descarga código. La guarda del probe evita repeticiones posteriores.

## Evidencia requerida

| Fase | Evidencia |
| --- | --- |
| Preparación local | Snapshot correcto, manifiesto y hashes generados. |
| Copia al Kindle | Verificación de todos los archivos transferidos; todavía no implica ejecución. |
| Entrada trazable | `repair-launch-002.txt` con contexto de ejecución y resultado del wrapper; por sí solo no confirma instalación. |
| Reparación | Informe `repair-001.txt`, código cero, controles funcionales completos y `repair_verified_before_reboot=1`. |
| Persistencia | Reinicio físico observado, `boot_time` distinto y `postboot-001.txt` con controles completos y `postboot_verified=1`. |
| Pantalla | Prueba independiente de dibujo y lectura de una portada en el dispositivo. |

Ni un archivo `.success` ni un mensaje en pantalla sustituyen la lectura del informe. Una falta de informe, un control fallido o un código no cero mantiene el resultado pendiente de revisión.

## Validación realizada en el Mac

Las cinco pruebas de [test_repair_checks.py](../tests/test_repair_checks.py) pasan con archivos y comandos simulados: instalación consistente, payload modificado, proceso OTA activo, KPM con código no cero pese a texto válido y KPM sin versiones esperadas pese a código cero. La condición SUID se simula porque el sandbox de macOS elimina ese bit.

Estas pruebas validan la lógica de detección del verificador. **No ejecutan los binarios ARM, no instalan KMC y no prueban su persistencia en el Kindle.** No se ha conectado Gmail o Calendar ni desplegado el periódico cloud como parte de esta reparación. Se mantiene la instrucción del usuario de no respaldar contenido.
