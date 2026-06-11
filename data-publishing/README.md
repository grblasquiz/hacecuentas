---
license: cc-by-4.0
language:
  - es
  - pt
pretty_name: Datos fiscales y laborales LATAM 2026
tags:
  - finance
  - taxes
  - payroll
  - latam
  - argentina
  - brasil
  - mexico
size_categories:
  - n<1K
---

# Datos fiscales y laborales LATAM + EE.UU. 2026

Parámetros fiscales y laborales **2026** de 8 países, verificados contra organismos oficiales y mantenidos por **[hacecuentas.com](https://hacecuentas.com)**. Son los mismos datos que mueven las calculadoras del sitio (fuente única, sin valores inventados).

## Cobertura

| Dataset | País | Contenido | Fuente |
|---|---|---|---|
| `argentina-monotributo` | 🇦🇷 | 11 categorías, topes y cuotas | ARCA |
| `argentina-feriados` | 🇦🇷 | feriados, trasladables, puentes | Boletín Oficial |
| `brasil` | 🇧🇷 | salário mínimo, INSS, IRRF, FGTS, MEI | Receita Federal / INSS |
| `chile` | 🇨🇱 | IMM, topes imponibles, 2ª categoría | Ley 21.751 / SII |
| `colombia` | 🇨🇴 | UVT, retención, renta, laboral | DIAN / Min. Trabajo |
| `ecuador` | 🇪🇨 | SBU, IESS, tabla de renta | SRI / IESS |
| `mexico` | 🇲🇽 | ISR, subsidio al empleo, IMSS | SAT / IMSS |
| `peru` | 🇵🇪 | RMV, UIT, IGV, renta 5ta | SUNAT / MTPE |
| `usa` | 🇺🇸 | IRS 401(k) & IRA limits | IRS Notice 2025-67 |

Cada archivo incluye un bloque `$meta` con `country`, `dataAsOf`, `source` y `license`.

## Archivos de datos

Los JSON viven en este mismo repo de datos (copiados de `npm-package/data/` del proyecto) y también están servidos en vivo:

- npm: `npm install hacecuentas-datos-latam`
- CDN: `https://cdn.jsdelivr.net/npm/hacecuentas-datos-latam/data/<dataset>.json`
- CSV en vivo (Argentina): `https://hacecuentas.com/datos/<slug>.csv`

## Uso

```python
from datasets import load_dataset
# o directo:
import json, urllib.request
url = "https://cdn.jsdelivr.net/npm/hacecuentas-datos-latam/data/argentina-monotributo.json"
ar = json.load(urllib.request.urlopen(url))
print(ar["TOPES"]["K"])
```

## Licencia y cita

CC-BY-4.0. Atribución: **hacecuentas.com — https://hacecuentas.com**

> No constituye asesoramiento fiscal ni legal. Verificá contra la fuente oficial (ver `dataAsOf`) antes de usar en producción crítica.
