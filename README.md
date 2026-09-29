# Kindle Newspaper

Un periódico personal de IA y tecnología que llega cada mañana a un Kindle dedicado: la pantalla amanece con la nueva portada, sin abrir un documento y sin encender el Mac.

El servicio en la nube investigará a partir de newsletters seleccionadas de Gmail, contrastará las noticias con fuentes originales y añadirá la agenda de Google Calendar. El Kindle recibirá la edición por Wi-Fi y permitirá recorrer sus páginas con una interfaz propia.

## Estado del proyecto

**Acceso root confirmado; instalación incompleta.** El diagnóstico ejecutado desde el navegador confirma `uid=0`, arquitectura `armv7l` y firmware `5.12.2.2`. KMC está vacío salvo enlaces colgantes; faltan FBInk, KPM, Gandalf y el hook de arranque. Los componentes OTA siguen presentes y en ejecución. El marcador `JAILBROKEN.txt` no demostraba una instalación funcional.

La [reparación offline](docs/REPARACION.md) sigue íntegra en el Kindle, pero el intento sólo mostró la descarga MOBI y no dejó marcadores o informes de reparación. **No hay avance de instalación comprobado.** Se preparó un nuevo disparador que registra el contexto antes de llamar al wrapper existente, para repetir una sola vez después de un reinicio normal completo. La verificación funcional y posterior al reinicio siguen pendientes. Las cinco pruebas del verificador pasaron en el Mac con componentes simulados; no son pruebas de ejecución ARM en el Kindle.

El proyecto está documentado en el repositorio privado [wavexlabs-dev/kindle-newspaper](https://github.com/wavexlabs-dev/kindle-newspaper). **El marcador del instalador todavía no demuestra un jailbreak funcional.** Tampoco están conectadas las cuentas, desplegado el servicio cloud ni probada la actualización automática. El estado de cada intervención se registra en [docs/REGISTRO.md](docs/REGISTRO.md).

| Dispositivo auditado | Valor |
| --- | --- |
| Modelo | Kindle básico de 7.ª generación, 2014; KT2 |
| Identificación de familia | Prefijo `90C6`; se omite el número de serie completo |
| Firmware | `5.12.2.2` |
| Pantalla | 600 × 800 píxeles, vertical |

**Decisión del propietario: no realizar respaldos.** Esto no equivale a un borrado inmediato. Las acciones de limpieza y modificación deben quedar descritas en el registro, junto con su resultado observado.

## Experiencia prevista

- Portada nueva visible a la hora matutina configurada, con fecha de edición reconocible.
- Noticias en español, seleccionadas por relevancia, sin duplicados y con fuentes.
- Agenda del día y un anticipo breve de mañana.
- Páginas legibles en tinta electrónica, disponibles sin conexión después de descargarse.
- Navegación propia del periódico y una salida de mantenimiento.
- Última edición conservada si falla el servicio o el Wi-Fi.

El Mac sirve para la preparación inicial y el mantenimiento. La operación diaria depende del servicio cloud, del Wi-Fi y de la batería del Kindle.

## Documentación

- [Diagnóstico, decisiones y presupuesto](PLAN-KINDLE.md).
- [Arquitectura y criterios de aceptación](docs/ARQUITECTURA.md).
- [Preparación y procedimiento del jailbreak](docs/JAILBREAK.md).
- [Verificación de ejecución, reinicio y bloqueo OTA](docs/VERIFICACION.md).
- [Diagnóstico y reparación offline preparada](docs/REPARACION.md).
- [Registro de intervenciones y pruebas](docs/REGISTRO.md).

La primera fase es habilitar y verificar la ejecución de software propio en esta unidad. La siguiente prueba decisiva es que despierte desde reposo, descargue una portada y la muestre de forma fiable. La compatibilidad indicada por una guía no sustituye esa prueba física.

## Privacidad y costes

Este repositorio documenta el proyecto; no almacena correos, newsletters completas, eventos personales, ediciones reales, credenciales, tokens, números de serie completos ni archivos extraídos del Kindle. Los ejemplos y futuras pruebas del repositorio utilizarán contenido sintético.

Las credenciales de Gmail, Calendar y OpenAI vivirán en el servicio cloud. El Kindle sólo necesitará acceso restringido a su edición. La agenda es información personal y también debe protegerse en los archivos renderizados y en los registros.

Los supuestos de costes se mantienen en [PLAN-KINDLE.md](PLAN-KINDLE.md#comparación-de-costes-de-operación), para evitar cifras duplicadas. Aún no hay consumo real medido ni una suscripción nueva contratada como parte del proyecto.

## Portada de prueba

[examples/cover-test.png](examples/cover-test.png) es una imagen en escala de grises de 600 × 800 px con texto ficticio y el nombre provisional «La Señal». Se utiliza para comprobar legibilidad y refresco; no es una edición generada desde las cuentas ni una entrega ya validada en el Kindle.

Se regenera con `python3 scripts/render_test_cover.py`. Requiere Pillow y, por defecto, las fuentes Georgia y Arial locales de macOS. El parámetro `--font-dir` permite indicar otra carpeta que contenga esos archivos; no se redistribuyen fuentes. El diseño se ha inspeccionado en el Mac y sigue pendiente la prueba física.

## Referencias

- [Glanceboard](https://github.com/google-gemini/glanceboard): referencia del patrón servidor → imagen → pantalla; su firmware no corresponde a este Kindle.
- [KindleModding](https://kindlemodding.org/): documentación de modificación del dispositivo.
- [FBInk](https://github.com/NiLuJe/FBInk): candidato para mostrar imágenes en tinta electrónica.
- [KOReader](https://github.com/koreader/koreader): candidato para lectura de la edición completa.

Estos componentes son referencias y candidatos. Su inclusión no significa que ya estén instalados o validados en la unidad.
