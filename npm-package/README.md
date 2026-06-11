# hacecuentas-datos-latam

**Datos fiscales y laborales 2026 de LATAM + EE.UU.**, en una sola dependencia, verificados contra organismos oficiales y listos para usar en cualquier app de sueldos, impuestos, RRHH o fintech.

Compilado y mantenido por **[hacecuentas.com](https://hacecuentas.com)** — el conjunto de calculadoras fiscales de Latinoamérica.

[![npm](https://img.shields.io/npm/v/hacecuentas-datos-latam.svg)](https://www.npmjs.com/package/hacecuentas-datos-latam)
[![license](https://img.shields.io/badge/license-CC--BY--4.0-blue.svg)](./LICENSE)

---

## Por qué existe

Cada año hay que volver a buscar el salario mínimo, los topes del INSS, las tarifas del ISR, las categorías del monotributo, la UVT, la UIT… repartidos en boletines oficiales, PDFs y resoluciones. Este paquete los junta, los **verifica contra la fuente oficial** y los expone como JSON tipado, con la fecha de vigencia (`dataAsOf`) y la cita de cada dato.

Son los **mismos datos que mueven las calculadoras de [hacecuentas.com](https://hacecuentas.com)** — fuente única, sin valores inventados.

## Instalación

```bash
npm install hacecuentas-datos-latam
```

## Uso (JavaScript / TypeScript)

```js
import { datasets, meta } from 'hacecuentas-datos-latam';

// Monotributo Argentina 2026
const ar = datasets['argentina-monotributo'];
console.log(ar.TOPES.K);            // 108357084.05  (tope anual categoría K)
console.log(ar.CUOTA_SERVICIOS.A);  // 42386.74      (cuota mensual cat. A, servicios)

// Brasil 2026
const br = datasets['brasil'];
console.log(br.SALARIO_MINIMO);     // salário mínimo 2026
console.log(br.INSS_TETO);          // teto do INSS 2026

// Metadatos de cita (país, vigencia, fuente oficial)
console.log(meta.find(d => d.slug === 'brasil'));
// { country: 'Brasil', dataAsOf: '2026-06-05', source: 'Receita Federal / INSS ...', ... }
```

También podés importar un país puntual:

```js
import { argentinaMonotributo, mexico, chile } from 'hacecuentas-datos-latam';
```

## Uso sin instalar (CDN / cualquier lenguaje)

Cada dataset queda servido como JSON por jsDelivr y unpkg — útil desde Python, Go, una hoja de cálculo o un agente:

```
https://cdn.jsdelivr.net/npm/hacecuentas-datos-latam/data/argentina-monotributo.json
https://cdn.jsdelivr.net/npm/hacecuentas-datos-latam/data/mexico.json
https://cdn.jsdelivr.net/npm/hacecuentas-datos-latam/data/index.json   ← manifiesto
```

```python
import requests
ar = requests.get("https://cdn.jsdelivr.net/npm/hacecuentas-datos-latam/data/argentina-monotributo.json").json()
print(ar["TOPES"]["K"])
```

## Datasets incluidos

| Dataset | País | Vigencia | Fuente oficial |
|---|---|---|---|
| `argentina-monotributo` | 🇦🇷 Argentina | 2026-02-01 | ARCA (ex AFIP) |
| `argentina-feriados` | 🇦🇷 Argentina | 2026 | Boletín Oficial — Ley 27.399 + Res. 164/2025 |
| `brasil` | 🇧🇷 Brasil | 2026 | Receita Federal / INSS / Decreto 12.797/2025 |
| `chile` | 🇨🇱 Chile | 2026 | Ley 21.751 / Superintendencia de Pensiones / SII |
| `colombia` | 🇨🇴 Colombia | 2026 | DIAN (Res. 000238/2025) / Min. Trabajo |
| `ecuador` | 🇪🇨 Ecuador | 2026 | SRI / IESS / Ministerio del Trabajo |
| `mexico` | 🇲🇽 México | 2026 | SAT (Anexo 8 RMF 2026) / IMSS |
| `peru` | 🇵🇪 Perú | 2026 | SUNAT / MTPE / EsSalud |
| `usa` | 🇺🇸 EE.UU. | 2026 | IRS Notice 2025-67 |

Cada archivo trae un bloque `$meta` con `country`, `dataAsOf`, `source`, `sourceUrl`, `license` y `attribution`.

> **Nota sobre tramos:** en las tablas de impuesto a la renta progresivo, el último tramo usa `null` como límite superior (= sin tope).

## Cómo citar

> Datos fiscales y laborales LATAM 2026. hacecuentas.com. https://hacecuentas.com

Si usás estos datos en un producto o publicación, una atribución a **[hacecuentas.com](https://hacecuentas.com)** es suficiente (ver licencia).

## Aviso

Los valores se compilan de fuentes oficiales y se verifican periódicamente, pero **no constituyen asesoramiento fiscal ni legal**. Antes de usarlos en producción crítica, contrastá contra el organismo oficial vigente (la fecha de vigencia de cada dato está en `dataAsOf`).

## Licencia

Datos bajo [CC-BY-4.0](./LICENSE) — libre uso con atribución a hacecuentas.com.

---

Hecho por **[hacecuentas.com](https://hacecuentas.com)** · [Calculadora de sueldo](https://hacecuentas.com) · [Monotributo](https://hacecuentas.com) · [Holerite CLT](https://hacecuentas.com)
