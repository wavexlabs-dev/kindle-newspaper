# Jailbreak de Kindle KT2

> Documento histórico de la instalación original. Para el estado vigente y una instalación nueva, empieza por [README](../README.md) y [TUTORIAL](TUTORIAL.md). Las referencias a pendientes describen el momento de cada intervención; no repitas reparaciones automáticamente.

Dispositivo del proyecto: Kindle Basic 2014 / 7.ª generación / KT2, prefijo de identificación `90C6`, firmware `5.12.2.2 (379151 038)`, pantalla 600 × 800. No publicar el número de serie completo.

## Estado

**Jailbreak funcional verificado y primera portada vista.** La reparación y los informes 003/005 confirmaron los 38 hashes, root tras reiniciar, KPM, Gandalf/SUID, integración, OTA renombrado/detenido y raíz en sólo lectura. El chequeo FBInk corregido pasó y el usuario confirmó «La Señal», con render de código cero.

Se corrigieron nuestros controles (`-v`/EOF y sin exigir `xrefresh`) sin cambiar el binario. Los informes no acreditan cierre normal ni retorno automático de pantalla. Biblioteca quedó con una entrada reutilizable al motor probado; la nueva entrada se verificó por sintaxis y copia, sin otra prueba física. Undécima expulsión confirmada. Wi-Fi, despertar autónomo y cloud siguen pendientes. Detalles en [VERIFICACION.md](VERIFICACION.md).

El `dialoger.html` original fue sustituido por una adaptación diagnóstica que ejecutó un probe local. Los hashes de release de esta página identifican el original descargado; no deben usarse para identificar adaptaciones posteriores. La sección del paso físico conserva el procedimiento inicial, ya realizado; no es una indicación de repetir el instalador remoto.

El usuario autorizó comenzar el jailbreak y pidió expresamente **no hacer respaldo**. Confirmó batería suficiente (aproximadamente 50 % o más) y disponibilidad para usar la pantalla física. No se ha reseteado ni formateado el dispositivo.

Las fotos posteriores muestran batería al 30 %. El aviso `Application Error` durante la fase final está contemplado por el instalador: su código pide cerrarlo y seguir esperando. `Restart strategy 3` corresponde a la rama que ejecuta `telinit 5` cuando no detecta los servicios GUI más nuevos; no indica un tercer intento fallido. Esto explica el aviso, pero no prueba por sí solo que todos los pasos anteriores terminaran correctamente.

## Fuentes y versión fijada

- [Guía WinterBreak2](https://kindlemodding.org/jailbreaking/WinterBreak2/).
- [Requisitos generales](https://kindlemodding.org/jailbreaking/).
- [Prevención de actualizaciones durante la preparación](https://kindlemodding.org/jailbreaking/prevent-auto-update/).
- [Matriz de compatibilidad](https://github.com/KindleModding/kindlemodding.github.io/blob/main/static/jailbreaks.json): incluye KT2 y 5.12.2.2.
- [Release v1.1.0](https://github.com/KindleModding/Winterbreak2/releases/tag/v1.1.0), publicada el 22 de agosto de 2026.
- [Paquete oficial wb2.zip](https://github.com/KindleModding/Winterbreak2/releases/download/v1.1.0/wb2.zip), 672 bytes.

SHA-256 de `wb2.zip`, contrastado con el digest de la API de GitHub:

```text
9e85970902a1f2af6b4c3243755d80595dd36404b85083f8be8c65a69d04cfdf
```

El ZIP contiene la carpeta `winterbreak2/` y `winterbreak2/dialoger.html` (627 bytes). SHA-256 del HTML extraído:

```text
9d42a3c880bc6e6a7013a2f59e2d5e8525b369880384384d1c3d856fe7a6bbd5
```

La inspección confirmó que el HTML solicita al Kindle ejecutar el instalador servido en `https://kindlemodding.org/jb.sh`. El ZIP no fija el hash del instalador remoto. Por tanto, verificar el ZIP no verifica por sí solo todos los bytes que se ejecutarán después. Se registró una inspección separada del instalador vigente, sin ejecutarlo en el Mac.

Instalador inspeccionado el 28 de septiembre de 2026: `v1.3.7`, 5,283,938 bytes, SHA-256:

```text
65a63528fbe9515950cc3aa0d931749548680f37898a3819a4ebc0a740588942
```

El hash anterior es una observación local de ese momento; no es una firma publicada por el autor ni garantiza que la URL permanezca igual. No se incluyen los binarios o instaladores descargados en este repositorio.

## Preparación desde el Mac

1. Comprobar que `/Volumes/Kindle` es el volumen USB esperado y que `system/version.txt` conserva la versión identificada.
2. Descargar la release exacta en `.local/`, verificar SHA-256 e inspeccionar las rutas del ZIP antes de extraer.
3. Copiar únicamente `winterbreak2/dialoger.html` a una carpeta nueva `winterbreak2` en la raíz del Kindle. Si ya existe un archivo diferente, detenerse en vez de sobrescribirlo.
4. Comparar el checksum del archivo del Kindle con el archivo verificado.
5. Evaluar la prevención OTA de la guía. Si se utiliza relleno, crearlo en una carpeta propia, dejando aproximadamente 80 MiB libres (dentro del margen de 50–90 MB). No borrar contenido existente ni usar el volumen completo hasta cero bytes.
6. Expulsar el volumen de forma segura.

**Decisión para esta unidad:** se inició el relleno, pero se omitió completarlo tras volver a verificar que [Amazon ofrece 5.12.2.2 para Kindle de 7.ª generación](https://digprjsurvey.amazon.com/csad/help/node/GKMQC26VQQMM8XSW?theme=light), exactamente la versión instalada y compatible con WinterBreak2. El relleno previene descargas OTA; no es una dependencia de ejecución del exploit. Esta decisión es una inferencia técnica basada en el catálogo actual, no una excepción expresamente publicada por KindleModding ni una garantía de que nunca haya otra actualización. No se encontraron archivos de actualización pendientes en la raíz durante la preparación.

El relleno parcial **no constituía un bloqueo OTA efectivo**. Se retiró después de comprobar ambos componentes OTA renombrados y detenidos tras reiniciar; la ausencia de `.newspaper-ota-guard/` quedó confirmada. El script local de preparación comprueba ocupación real, no sólo tamaño aparente; no es necesario volver a crear el relleno para la prueba de pantalla.

## Paso físico en el Kindle

El acceso USB disponible permite copiar archivos; no controla la pantalla del Kindle.

1. Desconectar el cable después de la expulsión.
2. Conectar el Kindle al Wi-Fi.
3. Abrir el navegador experimental.
4. Visitar la dirección indicada en la guía: `https://penguins184.xyz/wb2`.
5. Pulsar **Jailbreak** y esperar a que termine. Registrar literalmente cualquier error; no combinar instrucciones de otros métodos.
6. Comunicar el resultado y reconectar por USB cuando el dispositivo haya terminado y vuelto a responder.

## Verificación posterior

La comprobación tras reiniciar y la prueba corregida 005 verificaron el sistema y el primer dibujo, confirmado por el usuario. No están establecidas la causa exacta del fallo de extracción inicial ni la del remount ocupado anterior. Tampoco se atribuye una causa al corte de los informes antes de su cierre final.

Comprobar `documents/JAILBROKEN.txt` si lo genera el instalador, la versión anotada y cualquier salida de instalación. El marcador por sí solo no basta: verificar que, tras reiniciar, funciona una aplicación o scriptlet compatible y el gestor de paquetes. Inspeccionar el bloqueo OTA antes de retirar el relleno creado por este proyecto. El procedimiento concreto se documenta en [VERIFICACION.md](VERIFICACION.md).

La documentación moderna usa el entorno HDNEXT y KPM. Seguir [What's Next](https://kindlemodding.org/jailbreaking/whats-next/) y la [guía de KOReader](https://kindlemodding.org/jailbreaking/whats-next/getting-koreader/) según los componentes realmente instalados. No añadir KUAL/MRPI o hotfixes de otras generaciones sin diagnosticar primero.

Después: prueba de imagen con FBInk, salida al lector, reinicio, recuperación Wi-Fi y despertar programado. La instalación de jailbreak no demuestra todavía un tablero autónomo.

## Límites y recuperación

- No usar KindleBreak: excluye expresamente 5.12.2.2.
- Si WinterBreak2 falla, conservar el mensaje y consultar la guía; WinterBreak original es una alternativa documentada que exige registro Amazon.
- No realizar reset de fábrica ni downgrade como respuesta automática a un error.
- Sin respaldo por petición expresa del usuario. La preparación actual añade archivos; no elimina la biblioteca.
- Estado y acciones observadas se registran en [REGISTRO.md](REGISTRO.md).
