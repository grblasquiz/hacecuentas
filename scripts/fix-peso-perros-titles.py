#!/usr/bin/env python3
"""
Mejora titles + descriptions de calcs peso-ideal-{raza} con data específica.
Ya tenemos contenido único (commit anterior) — ahora optimizamos CTR.
"""
import json
import re
from pathlib import Path

CALCS = Path('src/content/calcs')

# Data específica por raza: rango peso macho/hembra + expectativa vida
BREED_DATA = {
    'beagle': {'nom': 'Beagle', 'm': '10-16 kg', 'h': '9-14 kg', 'vida': '13 años'},
    'bulldog-frances': {'nom': 'Bulldog francés', 'm': '9-14 kg', 'h': '8-13 kg', 'vida': '11 años'},
    'bulldog-ingles': {'nom': 'Bulldog inglés', 'm': '23-25 kg', 'h': '18-23 kg', 'vida': '9 años'},
    'caniche-poodle': {'nom': 'Caniche', 'm': '20-32 kg', 'h': '18-27 kg', 'vida': '14 años'},
    'chihuahua': {'nom': 'Chihuahua', 'm': '1.5-3 kg', 'h': '1.5-3 kg', 'vida': '15 años'},
    'dachshund-salchicha': {'nom': 'Salchicha', 'm': '7-14 kg', 'h': '7-14 kg', 'vida': '13 años'},
    'golden-retriever': {'nom': 'Golden Retriever', 'm': '29-34 kg', 'h': '25-29 kg', 'vida': '12 años'},
    'husky-siberiano': {'nom': 'Husky siberiano', 'm': '20-27 kg', 'h': '16-23 kg', 'vida': '13 años'},
    'labrador-retriever': {'nom': 'Labrador', 'm': '29-36 kg', 'h': '25-32 kg', 'vida': '12 años'},
    'pastor-aleman': {'nom': 'Pastor alemán', 'm': '30-40 kg', 'h': '22-32 kg', 'vida': '11 años'},
    'pitbull': {'nom': 'Pitbull', 'm': '16-30 kg', 'h': '14-27 kg', 'vida': '12 años'},
    'rottweiler': {'nom': 'Rottweiler', 'm': '50-60 kg', 'h': '35-48 kg', 'vida': '10 años'},
    'boxer': {'nom': 'Boxer', 'm': '27-32 kg', 'h': '25-29 kg', 'vida': '11 años'},
    'shih-tzu': {'nom': 'Shih Tzu', 'm': '4-7.5 kg', 'h': '4-7.5 kg', 'vida': '13 años'},
    'yorkshire-terrier': {'nom': 'Yorkshire', 'm': '2-3.2 kg', 'h': '2-3.2 kg', 'vida': '14 años'},
}

fixed = 0
for raza, data in BREED_DATA.items():
    slug = f'calculadora-peso-ideal-{raza}'
    f = CALCS / f'peso-ideal-{raza}.json'
    if not f.exists():
        # Probar otros patterns
        f = CALCS / f'{slug}.json'
    if not f.exists():
        continue
    d = json.loads(f.read_text())
    nom = data['nom']
    # Title atractivo (<60 chars antes del pipe)
    d['title'] = f'Peso ideal {nom} adulto 2026 — Tabla por sexo | Hacé Cuentas'
    d['h1'] = f'Peso ideal del {nom} adulto'
    # Description con data directa (CTR booster: hace match con query exacta)
    d['description'] = (
        f'🐶 ¿Cuánto debe pesar un {nom} adulto? Macho: {data["m"]} · Hembra: {data["h"]}. '
        f'Expectativa de vida: {data["vida"]}. Tabla por edad + dieta + ejercicio recomendado.'
    )[:160]
    f.write_text(json.dumps(d, ensure_ascii=False, indent=2))
    fixed += 1
    print(f'✓ {slug}')

print(f'\nTotal razas actualizadas: {fixed}')
