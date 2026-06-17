# Auditoría SEO temporal 2025-2026 — hacecuentas.com
**Fecha:** 2026-06-17 · **Alcance:** contenido y datos fechados con años 2025/2026 · **Universo:** 2.852 calcs

> Eje de la auditoría: estamos en **junio 2026**. El riesgo SEO/YMYL no es el string "2025" en un título (eso está limpio), sino **"2026" en el título con un dato viejo debajo**. Todo lo de abajo está verificado contra fuentes oficiales jun-2026 (no solo contra el código).

---

## Resumen ejecutivo

| Eje | Estado | Detalle |
|---|---|---|
| Títulos/H1 con año | ✅ Sano | Solo 4 títulos con "2025" (torneos deportivos legítimos). 1.576 con "2026". 3 inconsistencias title/H1 menores. |
| Frescura declarada (lastReviewed) | ✅ Honesta | 0/30 inflados — el `lastReviewed` nunca es más nuevo que el commit que tocó el dato. |
| Promesa de frescura `monthly` | ⚠️ Incumplida | **84 calcs** dicen actualización mensual pero llevan 50-63 días sin tocarse (última 26-28 abr). |
| **Datos regulatorios AR 2026** | 🔴 **Con errores** | **~20 calcs** con datos stale/incorrectos pese a decir "2026". Es el grueso del problema. |
| Eventos caducados (2024/2025) | 🟠 Revisar | Copa América 2024, Mundial Clubes 2025 (×2, posible duplicado). |

---

## 🔴 BLOQUE A — Datos regulatorios AR incorrectos (YMYL, prioridad máxima)

Verificado contra ANSES, ARCA, iProfesional, c5n, Infobae, Boletín Oficial (jun-2026).

### A1. ANSES / Previsional — 5 errores
El "cluster bueno" (haber mínimo $403.318, máximo $2.713.948, PUAM $322.654, desempleo $181.500/$363.000, asignación buena $72.474, SMVM $367.800) está **clavado al dato oficial jun-2026**. Pero hay duplicados con base vieja:

| Calc / archivo | Valor en código | Real jun-2026 | Severidad |
|---|---|---|---|
| `asignacion-familiar-anses-2026-tramos-ingreso.ts:28-33` | tramos $90k/$135k/$180k, $18.500/hijo | tope indiv. ~$2,97M, **$72.488/hijo** | 🔴 ~4× bajo (datos ~2023) |
| `asignacion-universal-hijo-auh-2026-monto.ts:23-24` | AUH $105.640 / disc $354.280 | **$144.562 / $472.095** | 🔴 |
| `pension-invalidez-anses-no-contributiva-2026-cuantia.ts:20` | base $264.228 | **$403.318** (cuantía 70% = $282.323) | 🔴 |
| `puam-pension-universal-adulto-mayor-anses-2026.ts:20` | base $273.750 | **$403.318** (PUAM 80% = $322.654) | 🔴 |
| `jubilacion-haber-minimo-movilidad.ts:50` | $340.000 | $403.318 | ⚠️ menor (es fallback) |
| `auh-asignacion-universal-hijo-monto-2026.ts:5` | $144.931 | $144.562 | ⚠️ leve (+0,25%) |

**Causa raíz:** no hay fuente única para el haber mínimo. Recomendación: consolidar `$403.318` en `smvm-ar-2026.ts` (o un `previsional-ar-2026.ts`) e importarlo, para que el drift mensual no se repita. Estas calcs son tráfico orgánico/Bing (no Ads) → fix de bajo riesgo, alto impacto.

### A2. Ganancias 4ta categoría — MNI mal (afecta ~8 calcs core)
`_ganancias-escala.ts:33` usa `MNI_MENSUAL_BASE = 1_931_926`, calculado con la **deducción especial apartado 1** (3,5×GNI = $18.031.308, la de autónomos). Los empleados en relación de dependencia usan el **apartado 2** (4,8×GNI = $24.728.652).

- **Correcto:** (5.151.802,50 + 24.728.652,02) / 12 = **`2_490_038`**
- **Validación oficial:** con el valor corregido, el piso de Ganancias da ~$3.000.000 bruto / ~$2.490.000 neto para soltero — coincide con iProfesional e ignacioonline jun-2026. Con el valor actual, **el sitio sobre-retiene** a todo empleado entre ~$2,33M y $3,0M bruto.
- **Calcs afectadas:** `calculadora-impuesto-ganancias-sueldo`, `sueldo-en-mano-argentina`, `simulador-recibo-de-sueldo-argentina`, `calculadora-ganancias-4ta-categoria-2026`, `calculadora-ganancias-tramos-empleado-mensual-2026`, `calculadora-cuarta-categoria-empleado-empresa-argentina`, `calculadora-retencion-ganancias-siradig-trabajador`, `calculadora-ganancias-aguinaldo-sac-retencion`.
- ⚠️ **Alto tráfico, varias son landing de Google Ads.** Tocar resultados visibles del funnel → requiere OK de Martin (regla CLAUDE.md #3/#5).
- ✅ Lo demás de Ganancias está OK: escala art. 94, GNI, cónyuge/hijo, **tope SIPA `4_414_652,38` SÍ es de junio** (Res 139/2026).
- 🐛 Aparte: `cuarta-categoria-empleado-empresa-argentina.ts` es un stub Potemkin (alícuota plana 25%, no usa la escala progresiva). Reescribir con el módulo compartido.

### A3. Autónomos — valores de abril (faltan 2 actualizaciones)
`autonomos-categorias-2026-aportes.ts:7` y `autonomos-categoria-monto-2026.ts:6` tienen valores de abril. Faltan mayo (+3,38%, Res 110/2026) y junio (+2,58%, Res 139/2026).
- General I-V jun (derivado): 72.446 / 101.423 / 144.890 / 231.825 / 318.759.
- ⚠️ Valores **derivados** (mayo×1,0258); mayo está verificado verbatim. Confirmar contra tabla ARCA antes de hardcodear junio.

### A4. Inmobiliario / ITI — divergencia canónica grave (cluster ~13 calcs)
**Verdad canónica jun-2026 (verificada):** la venta de inmuebles por persona humana **NO tributa NINGÚN impuesto nacional a la ganancia**:
- ITI derogado por **Ley 27.743** (2024) — afectaba pre-2018.
- Impuesto cedular 15% **eximido por Ley 27.802** (Reforma Laboral, vigente 1/1/2026) — afectaba desde-2018.
- Siguen vigentes: sellos provinciales, honorarios escribano, comisión inmobiliaria.

⚠️ **El sitio tiene 3 versiones distintas de la verdad conviviendo:**
- 🔴 **2 fórmulas cobran ITI 1,5% vigente** (desinformación dura): `costo-escritura-inmueble-porcentaje-valor.ts:7` (`iti=v*0.015`, encima lo llama "provincial" — era nacional) y `gastos-escritura-compraventa.ts:41` (`iti = !esComprador ? valor*0.015 : 0`).
- 🟠 **11 calcs** mencionan el ITI como vigente en prosa/FAQ (fórmula limpia): estampillado-sellado, comisión-inmobiliaria-4%, honorarios-escribano-caba, alquiler-vs-comprar, divorcio-express, sucesion-costo, honorarios-abogado, propiedad-tasacion-m2, precio-m2-zona, sellos-compra-inmueble, patente-cordoba (cross-link).
- 🟡 **"Modelo" pero ya desactualizado:** `gastos-escritura-compra-inmueble`, `plusvalia-inmueble-pba`, `renta-financiera-cedular-personas` dicen "vendedor desde 2018 paga cedular 15%" → **era cierto hasta dic-2025, ahora eximido por Ley 27.802**.
- ✅ **La más correcta:** `impuesto-transferencia-itu-iti-inmueble` ya refleja la exención por Ley 27.802. Mantener (no 301): captura la búsqueda residual "ITI".

**Acción:** reconciliar TODO el cluster a "venta PF = sin impuesto nacional (ITI derogado + cedular eximido)". Es un mini-proyecto, no un fix suelto.

---

## ⚠️ BLOQUE B — Frescura: 84 calcs "monthly" vencidas
Declaran `frequency: monthly` pero su `lastUpdated` es 26-28 abril 2026 (50-63 días). No mueve el sitemap (usa el lastUpdated real → Google las ve con fecha de abril), pero incumple la promesa de frescura. Mayoría son precios de mercado (cloud, APIs de IA, freelance, coworking, CCT gastronómico, Uber). Opciones: (a) revisar+bumpear las que tengan tráfico, (b) bajar la frecuencia declarada a `quarterly` donde el dato no cambia tan rápido (más honesto).

---

## 🟠 BLOQUE C — Eventos caducados y cosméticos

| Ítem | Problema | Acción |
|---|---|---|
| `calculadora-premios-mundial-clubes-2025-fifa-32-equipos` + `calculadora-premios-mundial-clubes-fifa-2025-2026` | Posible **duplicado/canibalización**; título "FIFA 2025 2026" confuso | Revisar cuál tiene tráfico → consolidar con 301 al ganador (regla #1 CLAUDE.md) |
| `calculadora-premios-copa-america-2024` | Evento de jul-2024 | Mantener (tráfico histórico); no degradar |
| title vs H1 desalineado (3) | `presion-arterial` (title 2026 / H1 2025), `mundial-clubes-2025`, `comision-representante-fifa` (H1 2023) | Alinear el año H1↔title |

---

## ✅ Lo que está bien (no tocar)
- Títulos fechados, freshness honesta, hreflang, schema, IndexNow.
- Datos verificados OK jun-2026: SMVM, monotributo (hasta recategorización julio), haber mínimo/máximo ANSES, PUAM y PNC del cluster bueno, tope SIPA, escala y deducciones de Ganancias.

---

## Contexto SEO 2025-2026 (del cerebro, para encuadre)
- Google orgánico ~muerto para el dominio (HCU); tráfico real = **Paid Ads >> Bing > Direct > IA**. Por eso: (a) **medir con GA4, no GSC**; (b) muchas calcs fiscales son **landing de Ads** → tocar resultados afecta Quality Score/conversión.
- El canal que premia datos correctos hoy es **AEO/GEO (Copilot, ChatGPT, Perplexity) + Bing**. Un dato fiscal incorrecto es exactamente lo que una IA cita mal → daño reputacional directo. Esto sube la prioridad del Bloque A.

## Priorización sugerida
1. **A1 ANSES (5 fixes)** — bajo riesgo (no-Ads), alto impacto YMYL, datos verificados y ya presentes en calcs hermanas.
2. **A4 ITI fórmulas (2)** — desinformación dura (cobran impuesto inexistente).
3. **A2 Ganancias MNI** — alto impacto pero toca funnel de Ads → requiere OK + posible re-verificación.
4. **A4 prosa ITI (11) + reconciliación cluster** — mini-proyecto.
5. **A3 autónomos** — confirmar valores junio contra ARCA primero.
6. **B (84 vencidas) + C (cosméticos)** — barrido.
