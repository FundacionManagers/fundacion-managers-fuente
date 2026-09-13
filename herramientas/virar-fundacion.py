#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Trata una fotografía para la paleta de Fundación Managers.

Adaptado de `virar.py` de la skill escenas-iconeialabs. Aquel vira a cian: es
la paleta de ICONE ialabs y aquí pelearia con el dorado de la fundación. Este
mantiene el calor de la foto y solo la hunde para que el texto blanco gane.

    python herramientas/virar-fundacion.py <entrada> <salida> [--modo duo|calido]
                                           [--ancho 1600] [--alto 1000] [--foco 0.5]
"""
import argparse, pathlib
from PIL import Image, ImageOps, ImageEnhance

# Rampa dorada: sombra navy de marca, medios bronce, altas oro palido.
RAMPA = [(0.00, (8, 11, 16)),
         (0.30, (40, 35, 30)),
         (0.60, (104, 82, 45)),
         (0.85, (186, 147, 72)),
         (1.00, (242, 226, 186))]


def _lut():
    r, g, b = [], [], []
    for i in range(256):
        t = i / 255
        for k in range(len(RAMPA) - 1):
            t0, c0 = RAMPA[k]; t1, c1 = RAMPA[k + 1]
            if t0 <= t <= t1:
                f = 0 if t1 == t0 else (t - t0) / (t1 - t0)
                r.append(round(c0[0] + (c1[0] - c0[0]) * f))
                g.append(round(c0[1] + (c1[1] - c0[1]) * f))
                b.append(round(c0[2] + (c1[2] - c0[2]) * f))
                break
    return r + g + b


LUT = _lut()


def duotono(im, gamma=0.78, contraste=1.14, techo=0.94):
    g = ImageOps.grayscale(im)
    g = g.point(lambda v: round(255 * ((v / 255) ** (1 / gamma)) * techo))
    g = ImageEnhance.Contrast(g).enhance(contraste)
    return Image.merge('RGB', (g, g, g)).point(LUT)


def calido(im, gamma=0.72, contraste=1.10, saturacion=0.92):
    """Conserva el color de la foto y solo la hunde. Un empujon calido minimo
       para que los ambares de la escena rimen con el dorado de la marca."""
    im = im.point(lambda v: round(255 * ((v / 255) ** (1 / gamma))))
    im = ImageEnhance.Contrast(im).enhance(contraste)
    im = ImageEnhance.Color(im).enhance(saturacion)
    r, g, b = im.split()
    r = r.point(lambda v: min(255, round(v * 1.04)))
    b = b.point(lambda v: round(v * 0.95))
    return Image.merge('RGB', (r, g, b))


def recortar(im, prop, foco=0.5, focox=0.5):
    w, h = im.size
    if w / h > prop:
        nw = round(h * prop); x = round((w - nw) * focox)
        return im.crop((x, 0, x + nw, h))
    nh = round(w / prop); y = round((h - nh) * foco)
    return im.crop((0, y, w, y + nh))


def main():
    p = argparse.ArgumentParser()
    p.add_argument('entrada'); p.add_argument('salida')
    p.add_argument('--modo', default='calido', choices=['duo', 'calido'])
    p.add_argument('--ancho', type=int, default=1600)
    p.add_argument('--alto', type=int, default=1000)
    p.add_argument('--foco', type=float, default=0.5)
    p.add_argument('--focox', type=float, default=0.5)
    p.add_argument('--gamma', type=float, default=None)
    p.add_argument('--calidad', type=int, default=62)
    a = p.parse_args()

    im = Image.open(a.entrada).convert('RGB')
    im = recortar(im, a.ancho / a.alto, a.foco, a.focox)
    im = im.resize((a.ancho, a.alto), Image.LANCZOS)
    if a.modo == 'duo':
        im = duotono(im, **({'gamma': a.gamma} if a.gamma else {}))
    else:
        im = calido(im, **({'gamma': a.gamma} if a.gamma else {}))
    sal = pathlib.Path(a.salida); sal.parent.mkdir(parents=True, exist_ok=True)
    im.save(sal, quality=a.calidad, method=6)
    print(f'{sal} · {im.size[0]}x{im.size[1]} · {sal.stat().st_size // 1024} KB · modo {a.modo}')


if __name__ == '__main__':
    main()
