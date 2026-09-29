# Kindle Newspaper

Un periódico personal de IA y tecnología que llega cada mañana a un Kindle dedicado: la pantalla amanece con la nueva portada, sin abrir un documento y sin encender el Mac.

El servicio en la nube investigará a partir de newsletters seleccionadas de Gmail, contrastará las noticias con fuentes originales y añadirá la agenda de Google Calendar. El Kindle recibirá la edición por Wi-Fi y permitirá recorrer sus páginas con una interfaz propia.

## Estado del proyecto

**Jailbreak y entrega de una portada por Wi-Fi verificados en el Kindle.** La segunda prueba inalámbrica registró red conectada, respuesta HTTPS 200 con validación del certificado, checksum de imagen coincidente, render con código cero y cierre correcto. El usuario confirmó haber visto «Una señal que llega por Wi-Fi».

El servicio está desplegado en Vercel y entrega imágenes mediante una credencial limitada al dispositivo. La portada probada es contenido sintético, no una edición generada desde las cuentas personales. Siguen pendientes la autorización de Gmail/Calendar, la clave de OpenAI, el lector de varias páginas, el despertar programado y la prueba diaria con el Mac apagado.

El jailbreak se comprobó después de reiniciar: integridad de 38 archivos, KPM, parches, OTA detenido y raíz en sólo lectura. FBInk funciona a 600 × 800. «Prueba WiFi» y `;log runme` ejecutan actualmente la descarga de prueba; no programan actualizaciones diarias.

El proyecto está documentado en el repositorio privado [wavexlabs-dev/kindle-newspaper](https://github.com/wavexlabs-dev/kindle-newspaper). El historial y las evidencias de cada intervención están en [docs/REGISTRO.md](docs/REGISTRO.md).

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
- [Diagnóstico, reparación offline y resultados](docs/REPARACION.md).
- [Registro de intervenciones y pruebas](docs/REGISTRO.md).

El jailbreak, la descarga HTTPS de prueba y la portada física están verificados. Falta validar el despertar desde reposo y la entrega automática de ediciones reales con el Mac apagado.

## Privacidad y costes

Este repositorio documenta el proyecto; no almacena correos, newsletters completas, eventos personales, ediciones reales, credenciales, tokens, números de serie completos ni archivos extraídos del Kindle. Los ejemplos y futuras pruebas del repositorio utilizarán contenido sintético.

Las credenciales de Gmail, Calendar y OpenAI vivirán en el servicio cloud. El Kindle sólo necesitará acceso restringido a su edición. La agenda es información personal y también debe protegerse en los archivos renderizados y en los registros.

Los supuestos de costes se mantienen en [PLAN-KINDLE.md](PLAN-KINDLE.md#comparación-de-costes-de-operación), para evitar cifras duplicadas. Aún no hay consumo real medido ni una suscripción nueva contratada como parte del proyecto.

## Portada de prueba

[examples/cover-test.png](examples/cover-test.png) es una imagen en escala de grises de 600 × 800 px con texto ficticio y el nombre provisional «La Señal». El usuario confirmó haberla visto en el Kindle; no es una edición generada desde las cuentas ni una entrega inalámbrica automatizada.

Se regenera con `python3 scripts/render_test_cover.py`. Requiere Pillow y, por defecto, las fuentes Georgia y Arial locales de macOS. El parámetro `--font-dir` permite indicar otra carpeta que contenga esos archivos; no se redistribuyen fuentes.

El motor [kindle_preview_cover.sh](scripts/kindle_preview_cover.sh) inicializó FBInk y dibujó el PNG con código cero, confirmado visualmente. El informe posterior `preview-8.txt` confirma cierre normal. La interfaz nativa sigue activa; no se promete restauración automática de pantalla.

## Referencias

- [Glanceboard](https://github.com/google-gemini/glanceboard): referencia del patrón servidor → imagen → pantalla; su firmware no corresponde a este Kindle.
- [KindleModding](https://kindlemodding.org/): documentación de modificación del dispositivo.
- [FBInk](https://github.com/NiLuJe/FBInk): instalado y probado para mostrar la portada en tinta electrónica.
- [KOReader](https://github.com/koreader/koreader): candidato para lectura de la edición completa.

El servicio cloud está implementado y desplegado; la generación con las cuentas personales aún no está autorizada ni probada. KOReader todavía no está instalado en el dispositivo.
