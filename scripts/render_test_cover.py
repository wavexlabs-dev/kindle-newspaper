"""Render a synthetic 600 x 800 legibility test. Requires Pillow and local fonts.

This is a static hardware test, not the cloud renderer or a real news edition.
Fonts are supplied by the host and are not redistributed in the repository.
"""

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--font-dir', type=Path,
                        default=Path('/System/Library/Fonts/Supplemental'))
    parser.add_argument('--output', type=Path,
                        default=ROOT / 'examples/cover-test.png')
    args = parser.parse_args()
    scale = 2
    image = Image.new('L', (600 * scale, 800 * scale), 255)
    draw = ImageDraw.Draw(image)

    def font(name, size):
        return ImageFont.truetype(str(args.font_dir / name), size * scale)

    serif = 'Georgia.ttf'
    bold = 'Georgia Bold.ttf'
    sans = 'Arial.ttf'
    sans_bold = 'Arial Bold.ttf'

    def text(value, x, y, size, name=sans):
        chosen = font(name, size)
        box = draw.textbbox((x * scale, y * scale), value, font=chosen, anchor='lt')
        if box[2] > 574 * scale or box[3] > 792 * scale:
            raise ValueError(f'Text exceeds test-page bounds: {value}')
        draw.text((x * scale, y * scale), value, font=chosen, fill=0, anchor='lt')

    def paragraph(value, x, y, width, size, leading, name=serif):
        chosen = font(name, size)
        lines = []
        current = ''
        for word in value.split():
            candidate = (current + ' ' + word).strip()
            if draw.textlength(candidate, font=chosen) > width * scale and current:
                lines.append(current)
                current = word
            else:
                current = candidate
        if current:
            lines.append(current)
        for index, line in enumerate(lines):
            text(line, x, y + index * leading, size, name)
        return y + len(lines) * leading

    def rule(y, weight=1):
        draw.line((28 * scale, y * scale, 572 * scale, y * scale),
                  fill=0, width=weight * scale)

    text('IA · TECNOLOGÍA · TU DÍA', 28, 25, 16, sans_bold)
    text('La Señal', 28, 63, 70, bold)
    rule(147, 4)
    text('LUNES 28 SEP 2026', 28, 162, 16, sans_bold)
    text('EDICIÓN DE PRUEBA', 385, 162, 16, sans_bold)
    rule(192)

    text('UNA MAÑANA CON MENOS RUIDO', 28, 215, 16, sans_bold)
    end = paragraph('Las señales que vale la pena leer.', 28, 250, 535, 41, 49, bold)
    end = paragraph('Un periódico de inteligencia artificial, tecnología y agenda. '
                    'Preparado antes de que empiece tu día.',
                    28, end + 17, 535, 23, 31)
    if end > 459:
        raise ValueError('Lead article overlaps the second section.')
    rule(474, 2)

    text('EN TU RADAR', 28, 492, 16, sans_bold)
    draw.line((300 * scale, 529 * scale, 300 * scale, 646 * scale), fill=0, width=scale)
    paragraph('01 / Inteligencia artificial', 28, 530, 249, 23, 28, bold)
    paragraph('Un anuncio, su contexto y lo que cambia.', 28, 593, 249, 20, 26)
    paragraph('02 / Tecnología', 321, 530, 247, 23, 28, bold)
    paragraph('Una herramienta para mirar con calma.', 321, 593, 247, 20, 26)

    rule(662, 2)
    text('TU AGENDA', 28, 682, 16, sans_bold)
    text('09:00', 28, 716, 22, sans_bold)
    text('Espacio para tu primera cita', 117, 716, 22, serif)
    rule(758)
    text('CONTENIDO FICTICIO · PRUEBA DE PANTALLA', 28, 774, 14, sans_bold)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    image.resize((600, 800), Image.Resampling.LANCZOS).save(args.output)
    print(args.output)


if __name__ == '__main__':
    main()
