# Keyword Cluster Report — Bing ES (catálogo completo)

**Fuente**: Bing Webmaster API (`scripts/bing-perf-pull.py`), pull del 2026-07-24
**Ventana**: últimas 8 semanas agregadas
**Total keywords**: 879
**Clusters creados**: 35 (cubren 99,3% de las impresiones)
**Orphan keywords**: 429 (865 impr = 0,7% — cola larga irrelevante)
**Total**: 125.582 impresiones · 2.265 clicks · CTR global 1,80%

> ⚠️ **Nota metodológica**: la API de Bing devuelve `position: 0` a nivel query (solo la da a nivel página). Por eso las columnas de este reporte son **impresiones / clicks / CTR real**, no "volumen estimado / dificultad". Es dato propio medido, no estimación de herramienta — más confiable, pero solo cubre keywords donde ya aparecemos.

---

## Tabla maestra de clusters

| # | Cluster | Impr | Clicks | CTR | #KW | Página destino | Estado |
|---|---------|------|--------|-----|-----|----------------|--------|
| 1 | Mundial 2026 · fixture/partidos | 43.024 | 103 | 0,24% | 45 | `/fixture-mundial-2026` | 🔻 activo pero decayendo |
| 2 | Salario mínimo · genérico/AR/otros | 26.187 | 310 | 1,18% | 29 | ❌ sin hub que rankee | 🔴 **prioridad 1** |
| 3 | Monotributo · categorías y tabla | 14.080 | 220 | 1,56% | 29 | `/datos-monotributo-2026` | ⚠️ canibalización |
| 4 | Feriados/festivos por país | 13.313 | 42 | 0,32% | 25 | `/feriados-<pais>-2026` | 🔴 CTR crítico |
| 5 | Salario mínimo Colombia | 5.428 | 105 | 1,93% | 14 | `/co/datos-salario-minimo-colombia-2026` | ⚠️ CTR bajo |
| 6 | IPC / inflación Argentina | 3.227 | 127 | 3,94% | 20 | `/calculadora-actualizacion-inflacion-ipc` | ✅ sano |
| 7 | Salario diario integrado / IMSS MX | 2.419 | 167 | 6,90% | 6 | `/mx/calculadora-salario-diario-integrado-sdi-mexico` | ✅ mejor CTR del top |
| 8 | Mundial 2026 · tabla de posiciones | 1.848 | 14 | 0,76% | 9 | `/posiciones-mundial-2026` | 🔻 estacional |
| 9 | Auxilio de transporte CO | 1.758 | 7 | 0,40% | 3 | `/co/calculadora-auxilio-transporte-colombia-2026` | 🔴 no rankea |
| 10 | Mundial 2026 · campeón/ganador | 1.535 | 58 | 3,78% | 9 | `/campeon-mundial-2026` | ✅ pos 3,0 |
| 11 | IRPF España / AEAT | 1.459 | 17 | 1,17% | 16 | `/es/calculadora-irpf-2026-tramos-espana-nomina` | ⚠️ CTR bajo |
| 12 | Retenciones y sanciones DIAN CO | 1.431 | 31 | 2,17% | 14 | 4 calcs `/co/…sancion-*` | ⚠️ disperso |
| 13 | Números a letras | 1.332 | 20 | 1,50% | 7 | `/conversor-numero-a-letras-cantidad` | ⚠️ CTR bajo |
| 14 | Horas extras y recargos CO | 1.048 | 62 | 5,92% | 9 | `/co/calculadora-horas-extras-colombia-2026` | ✅ sano |
| 15 | **Prestaciones laborales (GT/HN/SV/NI)** | 1.000 | 4 | 0,40% | 3 | ❌ **no existe** | 🔴 **GAP** |
| 16 | Salario mínimo Paraguay + jornal | 827 | 53 | 6,41% | 7 | `/py/salario-minimo-paraguay-2026` | ✅ sano |
| 17 | Monotributo · recategorización | 640 | 32 | 5,00% | 4 | `/recategorizacion-monotributo-julio-2026` | ⚠️ canibalización |
| 18 | Herramientas de texto y utilidades | 605 | 16 | 2,64% | 18 | `/calculadora-contador-de-palabras-y-caracteres` | ⚠️ canibalización ×3 |
| 19 | Prima de antigüedad MX | 592 | 32 | 5,41% | 9 | `/mx/calculadora-prima-antiguedad-mexico` | ✅ sano |
| 20 | Préstamos quirografarios IESS EC | 567 | 2 | 0,35% | 1 | `/ec/calculadora-prestamo-quirografario-iess-ecuador` | 🔴 CTR crítico |
| 21 | Renta/ganancias · tablas y deducciones | 361 | 29 | 8,03% | 18 | `/datos-ganancias-2026` | ⚠️ canibalización ×4 |
| 22 | Generaciones por edad | 347 | 7 | 2,02% | 5 | `/calculadora-generacion-perteneces` | ⚠️ CTR bajo |
| 23 | Índices BCRA (UVA/dólar/tasas) | 330 | 31 | 9,39% | 19 | `/valores-bcra` | ✅ sano |
| 24 | **Salud · función renal / química clínica** | 229 | 6 | 2,62% | 10 | ❌ **no existe** | 🔴 **GAP** |
| 25 | Conversión metros lineales ↔ m² | 207 | 60 | 28,99% | 28 | `/calculadora-conversor-metros-lineales-a-metros-cuadrados` | ✅ excelente |
| 26 | UF / UTM / UTA Chile | 188 | 11 | 5,85% | 10 | `/cl/calculadora-uf-uta-utm-chile-conversion-pesos-2026` | ✅ sano |
| 27 | Cuota alimentaria / pensión de alimentos | 168 | 33 | 19,64% | 8 | `/ec/calculadora-pension-alimenticia-ecuador` | ✅ excelente |
| 28 | Salario mínimo México | 165 | 3 | 1,82% | 2 | `/mx/datos-salario-minimo-mexico-2026` | ⚠️ CTR bajo |
| 29 | ISR México | 89 | 6 | 6,74% | 3 | `/mx/calculadora-isr-honorarios-persona-fisica` | ✅ sano |
| 30 | Jubilación y pensiones | 73 | 41 | 56,16% | 19 | varias | ✅ excelente |
| 31 | Finanzas empresa (DSO/payback) | 66 | 0 | 0,00% | 4 | `/dso` | 🔴 0 clicks |
| 32 | Consumo eléctrico PC / watts | 58 | 17 | 29,31% | 11 | `/calculadora-watts-fuente-alimentacion-pc` | ✅ excelente |
| 33 | Millas y programas de viajero | 49 | 25 | 51,02% | 21 | `/calculadora-millas-avianca-lifemiles` | ✅ excelente |
| 34 | Copa Libertadores | 42 | 5 | 11,90% | 3 | `/calculadora-copa-libertadores-*` | ✅ sano |
| 35 | IIBB provinciales AR | 25 | 16 | 64,00% | 12 | `/iibb/*` | ✅ excelente |

---

## Lectura del reparto

El 80% de las impresiones vive en **4 clusters** (Mundial, salario mínimo genérico, monotributo, feriados) y los cuatro tienen **CTR entre 0,24% y 1,56%** — muy por debajo del 5-7% que rinden los clusters sanos del sitio. No es un problema de copy: es que estos cuatro clusters rankean en **posición 7-8**, mientras que los que convierten bien están en 3-6.

Al revés, los clusters con CTR de 20-65% (IIBB, millas, jubilación, metros lineales, consumo PC) tienen impresiones ínfimas: rankeamos primero pero casi nadie busca eso. Ahí la palanca no es CTR, es visibilidad.

**Dos regímenes distintos, dos palancas distintas** — no mezclarlos en un mismo plan.

---

## Clusters prioritarios en detalle

### Cluster 2 — Salario mínimo · genérico/AR/otros 🔴
**Intención**: informacional · **26.187 impr · 310 clicks · CTR 1,18%**

| Keyword | Impr | Clicks | CTR | Rol |
|---------|------|--------|-----|-----|
| salario mínimo 2026 | 14.132 | 161 | 1,14% | **Primary** |
| salario minimo 2026 (sin tilde) | 4.008 | 31 | 0,77% | Secondary |
| salário mínimo 2026 (PT) | 2.731 | 7 | 0,26% | Secondary |
| salario minimo | 1.579 | 24 | 1,52% | Secondary |
| salario 2026 | 961 | 5 | 0,52% | Supporting |
| salario mínimo 2026 valor | 939 | 16 | 1,70% | Supporting |
| sueldo mínimo 2026 | 917 | 14 | 1,53% | Supporting |
| minimo 2026 | 421 | 14 | 3,33% | Supporting |
| + 21 variantes | 517 | 38 | — | Supporting |

**El problema**: no hay una página que capture la query genérica sin país. `/datos-salario-minimo-latam-2026` existe pero solo junta **120 impresiones** — no rankea. `/salario-minimo-vital-movil-argentina` junta **234**. Las 26k impresiones las está absorbiendo `/co/datos-salario-minimo-colombia-2026`, que responde Colombia a alguien que no preguntó por Colombia → CTR 1,18%.

**Recomendación**: hub desambiguador en `/datos-salario-minimo-latam-2026` con tabla de los 14 mercados arriba del fold + enlace directo a cada página-país. Es la única forma de que "salario mínimo 2026" a secas tenga una respuesta correcta.
**Estacionalidad**: pico Dic-Ene (anuncios de mínimos). Hay que llegar armado a diciembre.

### Cluster 4 — Feriados/festivos por país 🔴
**Intención**: informacional · **13.313 impr · 42 clicks · CTR 0,32%**

25 keywords repartidas entre CO (5.768+1.156+935+681…), Chile (204+196+115), Perú (474+51), genérico (3.288). Las páginas existen y son buenas: `/feriados-colombia-2026` (19.830 impr) `/feriados-chile-2026` (12.515) `/feriados-peru-2026` (9.056).

**Diagnóstico**: posición 7-8 en las tres. Con 0,32% de CTR, el problema es que Bing resuelve "feriados 2026" en el propio SERP (answer box con la lista). Es **zero-click estructural**, no thin content.

**Recomendación**: no invertir en reescribir titles acá. La palanca real es subir de posición 8 → 3-4 vía internal linking, y ahí sí el CTR se mueve solo. Si a 3 meses sigue en pos 7-8, es techo de autoridad y conviene aceptarlo.

### Cluster 3 — Monotributo · categorías y tabla ⚠️
**Intención**: informacional/transaccional · **14.080 impr · 220 clicks · CTR 1,56%**

| Keyword | Impr | Clicks | Rol |
|---------|------|--------|-----|
| categorías monotributo 2026 | 5.461 | 35 | **Primary** |
| tabla monotributo 2026 | 2.372 | 29 | Secondary |
| categoría monotributo 2026 | 1.187 | 17 | Secondary |
| categorías monotributo | 1.064 | 11 | Secondary |
| escala monotributo 2026 | 733 | 21 | Supporting |
| + 24 variantes | 3.263 | 107 | Supporting |

🔴 **Canibalización confirmada**: `/datos-monotributo-2026` (22.870 impr, pos 4,5, CTR 3,0%) y `/tabla/tabla-categorias-monotributo-2026` (10.502 impr, pos 6,5, CTR 0,5%) compiten por el mismo cluster. La segunda tiene 6× peor CTR — está diluyendo autoridad sin aportar clicks.

**Recomendación**: consolidar. `/tabla/…` → canónica a `/datos-monotributo-2026`, o 301 si no aporta contenido diferencial. Regla del skill: un cluster = una página.

### Cluster 15 — Prestaciones laborales 🔴 GAP
**Intención**: transaccional · **1.000 impr · 4 clicks · CTR 0,40%**

| Keyword | Impr | Clicks |
|---------|------|--------|
| prestaciones laborales | 661 | 1 |
| calculo de prestaciones laborales | 325 | 2 |
| prestaciones laborales cálculo | 14 | 1 |

"Prestaciones laborales" es el término de **Guatemala, Honduras, El Salvador y Nicaragua** para la liquidación final (indemnización + aguinaldo + vacaciones + bono 14). No tenemos catálogo de esos mercados: lo único que matchea son calcs de Colombia (`prestaciones sociales`) y RD, que responden otra cosa. De ahí el 0,40%.

**Recomendación**: calculadora de prestaciones laborales para Guatemala (mercado más grande de los cuatro), con selector de causal de terminación. Mil impresiones ya medidas, sin página propia, es la mejor relación esfuerzo/retorno del reporte.

### Cluster 24 — Salud · función renal / química clínica 🔴 GAP
**Intención**: informacional (profesional) · **229 impr · 6 clicks · CTR 2,62%**

| Keyword | Impr | Clicks |
|---------|------|--------|
| calcio corregido por albúmina | 115 | 0 |
| clearance de creatinina | 80 | 2 |
| calculadora de clearance de creatinina | 8 | 1 |
| clearance de creatinina calculadora | 5 | 0 |
| calculadora filtrado glomerular | 6 | 1 |
| corrección de sodio por glucosa | 3 | 0 |
| + 4 variantes | 12 | 2 |

No existe ninguna calc de función renal ni de corrección de electrolitos en el catálogo. Volumen chico pero **CTR 0% en las dos cabezas** = nadie encuentra respuesta.

⚠️ **Caveat YMYL**: esto es YMYL-vida, no YMYL-money. Aplica la regla del sitio — requiere revisión editorial, fuentes clínicas citadas (CKD-EPI / Cockcroft-Gault) y disclaimer de uso profesional. No es una fábrica de calcs común.

### Cluster 9 — Auxilio de transporte CO 🔴
**1.758 impr · 7 clicks · CTR 0,40%** — `calculadora-auxilio-transporte-colombia-2026.json` existe pero **no aparece entre las 353 páginas con impresiones de Bing**. Las 1.758 impresiones las está capturando otra página (probablemente `/co/datos-salario-minimo-colombia-2026`, que menciona el auxilio). Página huérfana o mal enlazada — revisar inlinks.

### Cluster 20 — Préstamos quirografarios IESS EC 🔴
**567 impr · 2 clicks · CTR 0,35%**, con la página rankeando en **pos 7,7 y 13.403 impresiones totales**. Una sola keyword, alto volumen, CTR casi nulo. Candidata directa a optimización de title/meta: es el caso más limpio del reporte donde el copy sí puede ser la palanca (query única, intención inequívoca, página correcta).

---

## Canibalización detectada

| Cluster | Páginas en conflicto | Acción |
|---------|---------------------|--------|
| Monotributo categorías | `/datos-monotributo-2026` (pos 4,5) vs `/tabla/tabla-categorias-monotributo-2026` (pos 6,5) | Canónica o 301 a la primera |
| Recategorización | `/recategorizacion-monotributo-julio-2026` (2.059) vs `/blog/recategorizacion-monotributo-julio-2026-guia-completa` (1.306) | Blog → canónica a la calc |
| Ganancias/renta AR | `/calculadora-impuesto-ganancias-sueldo` (4.059) · `/datos-ganancias-2026` (2.383) · `/tabla/tabla-escalas-ganancias-2026` (618) · `/blog/escala-ganancias-2026-…` (1.914) | 4 páginas, 1 cluster — consolidar a 2 (calc + datos) |
| Herramientas de texto | `/calculadora-palabras-paginas-conversor` (2.437) · `/calculadora-contador-de-palabras-y-caracteres` (2.307) · `/calculadora-palabras-por-pagina-trabajo` (286) | Separar intenciones: contar ≠ convertir a páginas |

Ninguna requiere borrar contenido — la regla del sitio es 301 obligatorio con equivalente, y acá todas tienen destino natural.

---

## Advertencia sobre el cluster #1

El Mundial (43.024 + 1.848 + 1.535 = **46.407 impresiones, 37% del total**) es un **activo en decaimiento**: la final fue el 19 de julio. Ese volumen se evapora en las próximas semanas y va a leerse como una caída de tráfico en agosto que no es tal.

Consecuencia práctica: **no medir el impacto de este plan contra el total del sitio**. Hay que medir cluster por cluster, o el ruido del Mundial tapa cualquier señal.

---

## Content Roadmap

Prioridad = impresiones ya medidas × brecha de CTR contra el benchmark del sitio (5%), ajustada por esfuerzo y por si el cluster es evergreen o estacional.

| # | Cluster | Acción | Tipo | Keyword objetivo | Clicks/mes recuperables* |
|---|---------|--------|------|------------------|--------------------------|
| 1 | Salario mínimo genérico | Hub LATAM desambiguador | Página nueva + linking | salario mínimo 2026 | ~480 |
| 2 | Monotributo | Consolidar canibalización | Canónica/301 | categorías monotributo 2026 | ~340 |
| 3 | Feriados por país | Internal linking (pos 8→4) | Linking | feriados 2026 | ~310 (a 3 meses) |
| 4 | Salario mínimo Colombia | Optimizar CTR (pos 3,7) | On-page | salario mínimo 2026 colombia | ~165 |
| 5 | **Prestaciones laborales GT** | **Calc nueva** | **Página nueva** | prestaciones laborales | ~45 |
| 6 | Auxilio de transporte CO | Rescatar página huérfana | Linking | auxilio de transporte 2026 | ~80 |
| 7 | IRPF España | Optimizar title/meta | On-page | cálculo irpf 2026 | ~55 |
| 8 | Quirografario IESS EC | Optimizar title/meta | On-page | préstamos quirografarios | ~26 |
| 9 | Números a letras | Optimizar CTR (pos 6,2) | On-page | numeros a letras | ~46 |
| 10 | **Función renal / química clínica** | **Calc nueva (YMYL-vida)** | **Página nueva** | clearance de creatinina | ~9 |

\* Estimación: `impresiones × (5% − CTR actual)`, normalizado a mes. Es un techo optimista, no un pronóstico — asume que la página llega a rendir como el promedio del sitio. Los clusters 1-3 son los únicos con volumen para mover la aguja del total.

**Lo que NO recomiendo**: tocar los clusters 25-35 (metros lineales, millas, IIBB, jubilación, consumo PC). Tienen CTR de 20-65% — ya ganamos ahí. Su límite son las impresiones, y eso se resuelve con autoridad/backlinks, no con más on-page.

---

## Orphan keywords

429 keywords (865 impresiones, 0,7%) no entraron en ningún cluster. Revisión manual del tramo con ≥5 impresiones (22 keywords):

| Keyword | Impr | Nota |
|---------|------|------|
| dígito de verificación | 62 | Existe `/co/validar-nit` (3.463 impr) — falta enlace desde el cluster CO |
| vacaciones de invierno 2026 argentina | 46 | Estacional junio-julio, ya pasó |
| calculador de amor por nombres | 33 | Entretenimiento, sin cluster |
| cuantas madejas … piecera | 31 | Query única, ruido |
| como calcular porcentaje | 13 | Head term real, pero rankeamos con 0 clicks |
| hace cuentas | 13 | **Branded** — cluster propio a futuro si crece |
| reducción de acento extranjero | 6 | Ruido |

El resto (407 keywords, ~500 impresiones) es cola larga de 1-4 impresiones: no clusteriza y no justifica acción.

---

*Generado con datos propios de Bing Webmaster. Reproducible con `python3 scripts/bing-perf-pull.py`.*

---

# Ejecución — 2026-07-24

Se ejecutó el roadmap completo. Tres ítems cambiaron de enfoque respecto de lo
recomendado arriba, y uno quedó bloqueado. El detalle:

| # | Acción planeada | Estado | Nota |
|---|-----------------|--------|------|
| 1 | Hub LATAM salario mínimo | ✅ hecho | +3 países (11), desambiguador en el donante de 60k, 2 bugs de contenido corregidos |
| 2 | Consolidar canibalización monotributo | ✅ hecho | canonical, no 301 |
| 3 | Internal linking feriados | ✅ hecho | de 1-2 inlinks a 5-6 cada una |
| 4 | CTR salario mínimo Colombia | ✅ hecho | vía desambiguador (el title ya era correcto) |
| 5 | Calc prestaciones laborales GT | ⚠️ **replanteado** | ver abajo |
| 6 | Rescatar auxilio de transporte CO | ✅ hecho | tenía **cero** inlinks |
| 7 | Title/meta IRPF España | ✅ hecho | |
| 8 | Title/meta quirografario EC | ✅ hecho | |
| 9 | CTR números a letras | ✅ hecho | |
| 10 | Calc función renal | 🔴 **bloqueado** | construida y validada, no publicable — ver abajo |
| — | Canibalización recategorización | ⚠️ **descartado** | ver abajo |
| — | Huérfano "dígito de verificación" | ✅ ya cubierto | `/co/validar-nit` ya tiene la keyword en el title y 5 inlinks |

## Desviaciones y por qué

**#5 — Guatemala no era el diagnóstico correcto.** El reporte asumía que
"prestaciones laborales" era terminología de Guatemala/Honduras/Salvador/Nicaragua.
Es cierto, pero **también es el término legal dominicano** (preaviso Art. 76 +
auxilio de cesantía Art. 80), y ahí ya teníamos autoridad: la calc de liquidación
RD junta 3.126 impresiones y ya declaraba la keyword. Crear un locale `/gt/`
nuevo son ~23 archivos de infraestructura, y dejarlo a medias en un working tree
donde otras sesiones deployan era un riesgo real.

Se hizo en cambio el patrón que ya funcionó en el cluster #1: una página
desambiguadora, `/prestaciones-laborales-por-pais`, que explica qué significa el
término en cada país y deriva a la calculadora correcta. Cubre 10 países con
normativa ya verificada, dice explícitamente que GT/HN/SV/NI no están cubiertos,
y recibe enlaces desde los 9 hubs de país.

**#10 — bloqueado por política del propio sitio, no por contenido.**
`content-policy.ts` restringe a noindex toda calc con `ymylRisk: 'high'` sin
`professionalReviewer` válido — y hoy el catálogo entero tiene **cero** revisores
profesionales cargados. Una calculadora de función renal es YMYL-vida sin
discusión: se usa para ajustar dosis de fármacos y estadificar enfermedad renal.

Se construyeron igual, completas y con la fórmula validada contra cálculo manual:

- `calculadora-clearance-creatinina-filtrado-glomerular` — Cockcroft-Gault + CKD-EPI
  2021 (sin coeficiente de raza, que la revisión de 2021 eliminó) + estadios KDIGO,
  con peso ideal/ajustado para dosificación en obesidad.
- `calculadora-calcio-corregido-albumina` — fórmula de Payne, con mg/dL y mmol/L.

Ambas quedan en `status: 'draft'`. **Para publicarlas hace falta una decisión tuya**:
conseguir un revisor médico real (nombre, matrícula, URL de perfil), cargarlo en
`professionalReviewer` y poner `reviewType: 'professional'`. No inventé un revisor
—sería fabricar una credencial— ni bajé el `ymylRisk` a 'medium' para esquivar el
gate, que sería saltear la propia política de seguridad del sitio.

Vale notar que esto no es un caso aislado: hay calcs `ymylRisk: 'high'` ya vivas
(BCAA, magnesio, HOMA-IR, percentil bebé) en la misma situación de noindex. Es el
mismo problema de fondo que las ~220 calcs en limbo.

**Recategorización monotributo — descartado a propósito.** El reporte proponía
canonicalizar el blog hacia la calc. Al mirarlo de cerca, los títulos ya están
diferenciados ("cerró, qué hacer" vs "calculá tu nueva categoría") y **ambas
páginas rinden ~5% de CTR**, que es sano. Forzar un canonical habría destruido los
59 clicks de la página de blog sin ganancia clara. Se dejó como está.

## Decisión transversal: canonical en vez de 301

`public/_redirects` está en **1.979 líneas y el límite duro de Cloudflare son 2.000**.
Las tres consolidaciones se resolvieron con canonical, que además conserva las
páginas funcionando. El generador de sitemap se modificó para excluir cualquier
página con `canonicalUrl`/`canonicalSlug`: pedirle a Bing que crawlee algo que
después le decimos que no es el original quema crawl budget.

## Qué medir y cuándo

- **No medir contra el total del sitio.** El Mundial es el 37% de las impresiones
  y la final ya pasó: agosto va a mostrar una caída que no tiene que ver con esto.
- Medir cluster por cluster con `python3 scripts/bing-perf-pull.py`, comparando
  contra los números de este reporte (baseline: 125.582 impr / 2.265 clicks).
- Ventana: 2-3 semanas para los cambios de CTR (títulos), 4-6 para los de linking
  (feriados, auxilio de transporte, hub de prestaciones), que dependen de que Bing
  recrawlee y recalcule posición.
- El hub de salario mínimo tiene su pico natural en **diciembre-enero**, cuando se
  anuncian los mínimos del año siguiente. Ese es el examen real del cluster #1.
