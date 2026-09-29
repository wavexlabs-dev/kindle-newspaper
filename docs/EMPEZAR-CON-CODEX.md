# Empieza con Codex

Dale a Codex acceso a tu copia del repositorio, conecta tu Kindle por USB y pega este mensaje. El agente necesitará colaboración física para tocar la pantalla y consentimiento del propietario en Google.

## Prompt listo para copiar

```text
Quiero implementar mi propio periódico de tinta electrónica usando este repositorio.

Lee README.md, docs/TUTORIAL.md, docs/PORTADA.md y cloud/README.md. No trates los informes históricos de Pablo como el estado de mi dispositivo o de mis cuentas.

Primero identifica, sin modificar nada, el modelo y firmware de mi Kindle, resolución, batería, conexión USB y si ya tiene jailbreak o KOReader. Comprueba la compatibilidad actual en las fuentes oficiales. Dime qué partes del repositorio sirven sin cambios y cuáles requieren adaptación. No ejecutes scripts de reparación ni payloads específicos de otro equipo.

Usa mis propias cuentas, claves y servicio cloud. Pregúntame lo imprescindible: cuenta de Gmail, cuenta de Calendar, remitentes de newsletters, idioma, nombre del periódico, zona horaria y hora deseada. Incluye todos mis calendarios accesibles, no solo primary. No reutilices cuentas, dominios, secretos ni excepciones de la instalación original.

Confirma conmigo qué contenido del Kindle quiero conservar y mi preferencia de respaldo antes de cualquier limpieza. No asumas la decisión de “sin respaldo” de Pablo. No hagas un reset ni un downgrade automáticamente. Los pasos físicos y los consentimientos de Google los haré yo cuando me indiques.

Construye y prueba por etapas: muestra local ficticia; servicio privado; OAuth y lecturas reales; primera edición; instalación compatible del lector; navegación; descarga Wi-Fi con checksums; recuperación ante fallos; actualización y despertar automático. Guarda secretos fuera de Git y no me pidas pegarlos en el chat. Documenta lo realizado en mi repositorio.

Usa la dirección de arte de docs/PORTADA.md. Si está disponible Image Gen, crea una primera portada con esa herramienta; para las portadas diarias usa la integración API con el modelo explícito configurado. No envíes mi calendario al generador de imágenes. Revisa legibilidad en la resolución real del dispositivo.

El repositorio aún no implementa por completo la descarga automática dentro del lector ni acredita el despertar a las 08:00. Si mi objetivo es operación autónoma, implementa esas partes pendientes, prueba con mi dispositivo y documenta los resultados. No declares completado el sistema basándote solo en archivos copiados, un log de instalación o una portada manual. Verifica una actualización con el ordenador apagado y después un ciclo de 24–48 horas.

Empieza con la inspección y continúa con los pasos autorizados que no dependan de mis respuestas.
```

## Información que conviene tener preparada

| Dato | Ejemplo ficticio |
| --- | --- |
| Nombre | Mi Diario |
| Cuenta de newsletters | lector@example.com |
| Cuenta de Calendar | agenda@example.com |
| Remitentes exactos | boletin@example.com, noticias@example.org |
| Zona horaria | America/Mexico_City |
| Hora de lectura | 08:00 |
| Idioma | Español |
| Dispositivo | Modelo y firmware por identificar |
| Hosting | Cuenta propia de Vercel u otro proveedor |

No escribas claves API ni contraseñas en esa ficha.

## Resultado que debe entregar el agente

- Diagnóstico de compatibilidad y registro de cambios de tu equipo.
- Configuración privada del servidor y conexiones a tus propias cuentas.
- Edición renderizada, descargada y leída en el dispositivo.
- Instrucciones cortas para abrir, avanzar, regresar, salir y recuperar el documento.
- Estado explícito de automatización: implementada/probada/pendiente, con evidencia.
- Lista de dependencias y costes medidos; no una cifra inventada.

El prompt es un punto de partida reproducible para un agente, no una promesa de instalación automática en cualquier Kindle.
