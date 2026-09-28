# Kindle Newspaper

Un periódico personal de IA y tecnología que llega cada mañana a un Kindle dedicado: la pantalla amanece con la nueva portada, sin abrir un documento y sin encender el Mac.

El servicio en la nube investigará a partir de newsletters seleccionadas de Gmail, contrastará las noticias con fuentes originales y añadirá la agenda de Google Calendar. El Kindle recibirá la edición por Wi-Fi y permitirá recorrer sus páginas con una interfaz propia.

## Estado del proyecto

**En preparación.** Se ha identificado el dispositivo y documentado la arquitectura. El jailbreak todavía no se ha ejecutado; tampoco están conectadas las cuentas, desplegado el servicio cloud ni probada la actualización automática. El estado de cada intervención se registra en [docs/REGISTRO.md](docs/REGISTRO.md).

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
- [Registro de intervenciones y pruebas](docs/REGISTRO.md).

La primera fase es habilitar y verificar la ejecución de software propio en esta unidad. La siguiente prueba decisiva es que despierte desde reposo, descargue una portada y la muestre de forma fiable. La compatibilidad indicada por una guía no sustituye esa prueba física.

## Privacidad y costes

Este repositorio documenta el proyecto; no almacena correos, newsletters completas, eventos personales, ediciones reales, credenciales, tokens, números de serie completos ni archivos extraídos del Kindle. Los ejemplos y futuras pruebas del repositorio utilizarán contenido sintético.

Las credenciales de Gmail, Calendar y OpenAI vivirán en el servicio cloud. El Kindle sólo necesitará acceso restringido a su edición. La agenda es información personal y también debe protegerse en los archivos renderizados y en los registros.

Los supuestos de costes se mantienen en [PLAN-KINDLE.md](PLAN-KINDLE.md#comparación-de-costes-de-operación), para evitar cifras duplicadas. Aún no hay consumo real medido ni una suscripción nueva contratada como parte del proyecto.

## Referencias

- [Glanceboard](https://github.com/google-gemini/glanceboard): referencia del patrón servidor → imagen → pantalla; su firmware no corresponde a este Kindle.
- [KindleModding](https://kindlemodding.org/): documentación de modificación del dispositivo.
- [FBInk](https://github.com/NiLuJe/FBInk): candidato para mostrar imágenes en tinta electrónica.
- [KOReader](https://github.com/koreader/koreader): candidato para lectura de la edición completa.

Estos componentes son referencias y candidatos. Su inclusión no significa que ya estén instalados o validados en la unidad.
