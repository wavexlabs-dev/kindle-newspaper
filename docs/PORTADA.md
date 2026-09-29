# Portadas de Pablo’s Time

[← Inicio](../README.md) · [Tutorial](TUTORIAL.md)

![Primera portada en resolución Kindle](images/01-cover.png)

## Dirección de arte

**Referencia:** la ilustración editorial conceptual y el humor sutil de *The New Yorker*. La portada debe ser original: no copiar una cubierta existente, un personaje recurrente ni su logotipo.

| Elemento | Especificación |
| --- | --- |
| Cabecera | `Pablo's Time`, serif editorial alta, con jerarquía clara |
| Composición | Vertical, márgenes amplios, ilustración protagonista |
| Concepto | Una metáfora visual derivada de las noticias de esa edición |
| Texto | Nombre, fecha y una línea breve de portada en español |
| Tono | Humano, contemplativo, ingenioso; sin estética de anuncio tecnológico |
| Color | Negro sobre blanco, grises moderados, siluetas claras |
| Tinta electrónica | Evitar microtexto, contrastes débiles y texturas que se vuelvan manchas |
| Excluir | Logos ajenos, mockups de dispositivos, datos del calendario, correos completos |

La portada inicial, **«Antes de dejarlo volar»**, representa la supervisión humana de agentes: un editor sostiene una cinta que une aves mensajeras de papel antes de dejarlas salir por la ventana.

## Dos formas de generar

### Diseño inicial con la herramienta Image Gen de Codex

Se usó la herramienta incorporada para la portada mostrada en este tutorial. Esa herramienta no expuso un selector de modelo: **no atribuimos su salida a una versión interna no confirmada**.

- [Imagen original](../assets/covers/pablos-time-2026-09-29.png).
- [Prompt íntegro utilizado](../assets/covers/pablos-time-2026-09-29.prompt.txt).
- [Adaptación 600×800](images/01-cover.png).

### Generación diaria en el servidor

Implementada en [cloud/src/cover.js](../cloud/src/cover.js) y conectada a la publicación en [publish.js](../cloud/src/publish.js).

| Parámetro real del código | Valor |
| --- | --- |
| API | Responses, herramienta `image_generation` |
| Modelo de orquestación | `OPENAI_MODEL`, por defecto `gpt-6-luna` |
| Modelo de imagen explícito | `gpt-image-2.5-flare` |
| Calidad | `medium` |
| Tamaño pedido a la API | `1024x1536` |
| Formato | PNG |
| Límite de invocaciones de imagen | 1 por llamada |
| Reintentos automáticos del SDK | 0 |
| Timeout de imagen | 120 segundos |
| Persistencia de Responses | `store: false` |
| Página final | 600×800, blanco, escala de grises, encaje `contain` |

`contain` conserva la imagen entera y puede añadir márgenes. El tamaño solicitado a la API tiene proporción 2:3 y la pantalla 3:4; no se promete ilustración a sangre en todas las salidas. Para otra pantalla, adapta generador, render, manifiesto y lector juntos.

Se verificó una generación API real con este modelo. Eso no acredita por sí solo un ciclo diario de entrega al Kindle.

## Cómo cambia cada mañana

El prompt recibe **fecha, titular y títulos/resúmenes de las noticias**. Pide una metáfora nueva y prohíbe repetir siempre la misma escena. La agenda y el correo original no se incluyen. La portada final se coloca antes de la apertura/editorial y de la agenda.

El servidor guarda editorial e imagen en un borrador privado por fecha. Al reutilizar un resultado ya generado evita volver a pagar por él. Las ediciones publicadas son inmutables: no se genera otra portada del mismo día por recargar una página.

**Límites actuales:** no hay memoria visual de portadas anteriores, detector de similitud ni revisión automática de ortografía de la imagen. “Diferente cada mañana” es una instrucción al modelo, no una garantía matemática de unicidad. El masthead y la fecha están dibujados por el modelo y deben inspeccionarse. La entrega automática al lector sigue pendiente.

## Brief reutilizable

```text
Diseña una portada editorial original para [NOMBRE], edición [FECHA].
Inspírate en la inteligencia visual de una revista literaria ilustrada.
Elige una sola metáfora a partir de [TITULAR Y RESÚMENES VERIFICADOS].

Nombre exacto y legible, fecha visible y una línea breve en español.
Ilustración dominante, márgenes generosos, negro sobre blanco,
gris contenido y formas legibles en una pantalla de tinta electrónica.
Sin mockup, logos ajenos, microtexto ni datos personales.
No repitas automáticamente el concepto de la edición anterior.
```

El prompt ejecutable completo es `coverPrompt()`; el de la primera ilustración está enlazado arriba. Cambiar solo este documento no cambia lo que envía el backend.

## Checklist de revisión

- Nombre y fecha correctos; relación reconocible con las noticias.
- Imagen original, sin afirmar que es una portada oficial de la revista de referencia.
- Texto legible a 600×800, sin recortes y con buen contraste.
- Agenda/correos privados ausentes.
- Una portada completa disponible antes de publicar el manifiesto.
- Prueba física adicional para evaluar grises y refresco en el Kindle.

## Coste

Registra tokens y uso de imágenes por edición; el backend conserva el uso de la portada en el almacenamiento privado de borradores. La investigación, búsqueda, redacción, imagen y hosting se cobran por separado según el proveedor. No hay todavía una cifra real mensual validada.

Documentación del proveedor: [Generación de imágenes](https://developers.openai.com/api/docs/guides/image-generation). Comprueba modelos, permisos y tarifas vigentes antes de configurar una cuenta nueva.
