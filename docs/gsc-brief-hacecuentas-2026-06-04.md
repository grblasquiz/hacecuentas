# Brief diagnóstico SEO — hacecuentas.com — estado al 2026-06-04

> Documento autocontenido para análisis por IA. No asume contexto previo.
> Todos los números salen de pulls reales de Google Search Console (GSC) y Bing
> Webmaster. Cada dato está fechado y etiquetado con su ventana.

---

## 0. Qué te pido (a la IA que lee esto)

Tenés un sitio que perdió ~94% de su tráfico orgánico de Google en abril 2026 y
lleva ~6 semanas plano sin recuperarse, **a pesar** de haber ejecutado el playbook
estándar de recovery completo. La particularidad: **Google NO desindexó las
páginas** (de hecho indexa cada vez más), pero las muestra en posiciones pésimas
y/o suprime sus impresiones. Quiero:

1. Tu diagnóstico independiente de qué está pasando (sin asumir que el nuestro es correcto).
2. Qué palancas moverían la aguja que NO hayamos probado ya (la sección 7 lista lo probado).
3. Si crees que el dominio es recuperable o conviene plan B.

---

## 1. Perfil del sitio

- **Dominio:** hacecuentas.com (operado por Genfy; autor público: Martín Rodríguez).
- **Qué es:** ~4.037 calculadoras online (2.847 ES + 686 EN + 219 PT + 285 locales
  MX/CO/CL) de finanzas, impuestos, salud, matemática, conversiones, etc. ~2.521 URLs
  indexadas en Google.
- **Stack:** Astro estático sobre Cloudflare Pages. Sin problema técnico
  significativo (auditoría interna 8.7/10; Core Web Vitals buenos; schema completo).
- **Mercado principal:** Argentina. Con variantes ES/MX/CO/CL + EN + PT.
- **Canal principal histórico:** SEO orgánico de Google.
- **Origen del problema (probable trigger):** el sitio creció de **0 a ~4.700
  páginas en 16 días**. El **67%** está en `audience:"global"` (etiqueta de
  localización, correcta para calcs universales — NO es thin). Por contenido medido
  el sitio **no es thin** (mediana 1.184 palabras/calc; ver §10).

---

## 2. Timeline del colapso

| Fecha | Evento | Clicks | Impr | Pos media |
|---|---|---|---|---|
| Pre-crash (baseline) | normal | ~700/7d | ~14.000/7d | 3–5 (page 1) |
| ~8 abril 2026 | Fin del **March 2026 Core Update** de Google | — | — | — |
| Semana 23/04/2026 | Último pico medible | 389 | 41.464 | 12.3 |
| 24–28 abril | **CRASH: −94% en 4 días** | — | — | — |
| Semana 30/04/2026 | Piso | 9 | 1.088 | 27.6 |
| Mayo (4–5 semanas) | **Plano muerto** | ~8/semana | ~900/semana | 17–30 |
| Hasta 02/06/2026 | Sin cambio en Google | ~8/semana | — | — |

**Lectura:** el crash fue abrupto (4 días), coincidente con el cierre del core
update, no gradual. Desde entonces, **cero rebote algorítmico** durante 6 semanas.

---

## 3. Data dura de GSC (varios pulls)

### 3.1 Snapshot 7 días (pull 2026-05-04)

| Métrica | Actual | Baseline pre-crash | Δ |
|---|---|---|---|
| Clicks /7d | 121 | ~700 | −83% |
| Impresiones /7d | 14.600 | ~14.000 | **+4%** |
| CTR | 0.8% | ~5% | −84% |
| Posición media | 12.8 | 3–5 | cae a page 2 |
| Sesiones org. /día (GA4) | 1–7 | 100+ | −94% |
| URLs indexadas | 2.521 | (=) | sin cambio |
| "Descubierta, actualmente sin indexar" | **1.346** | ~0 | 🔴 |
| "Rastreada, actualmente sin indexar" | 122 | ~30 | 🔴 |

### 3.2 Comparativa mensual 90 días (pull 2026-05-27)

| Métrica | Mar 27–Abr 25 | Abr 26–May 25 | Δ |
|---|---|---|---|
| Clicks | 530 | 149 | −72% |
| Impresiones | 54.818 | 17.725 | −68% |
| CTR | 0.97% | 0.84% | −13% |
| **Posición media** | **14.7** | **15.0** | **≈0%** |
| **Pages únicas que aparecen en SERP** | **1.805** | **1.850** | **+2.5%** |

### 3.3 Tendencia semanal (pull 2026-05-29)

| Semana | Clicks | Impr | Pos |
|---|---|---|---|
| 23/04 | 389 | 41.464 | 12.3 ← pico |
| 30/04 | 9 | 1.088 | 27.6 ← crash |
| 07–21/05 | ~8/sem | ~900/sem | 17–30 |

> **Nota de interpretación (importante):** la "posición media" de GSC es ruidosa
> y poco confiable cuando las impresiones colapsan, porque se promedia solo sobre
> lo que efectivamente se muestra. Por eso el corte mensual (≈15 estable) y el
> semanal (12→27) no coinciden: son recortes distintos del mismo período. Tratá
> como señales **robustas**: (a) impresiones −68% a −97%, (b) sin desindexación,
> (c) clicks planos ~8/sem por 6 semanas sin rebote.

---

## 4. Distribución de queries por posición (28 días, mayo 2026)

```
Posición    Queries   Impresiones   Clicks
1–3 (top)         6           40         3
4–10 (pág.1)     35           83         0   ← página 1 SIN clicks
11–20 (pág.2)    24           48         1
21–50            88          111         0
51+             644          995         1   ← cola larga SUPRIMIDA (NO thin: páginas ricas, ver §10)
TOTAL           797        ~1.277        5
```

- Solo **797 queries** generan impresiones para **~2.500 URLs**: la mayoría del
  catálogo no aparece **nunca** en una SERP.
- **644 de 797 queries (81%) están en posición 51+** → ruido masivo de cola larga.

---

## 5. Estado de indexación (GSC Coverage)

- **Indexadas y sirviendo:** ~2.521 (estable / creciendo levemente).
- **"Descubierta, actualmente sin indexar":** 1.346 (era ~0 pre-crash). Google
  conoce la URL pero **elige no indexarla**. Firma típica de evaluación de calidad
  a nivel dominio (HCU).
- **"Rastreada, actualmente sin indexar":** 122.
- **Sin acción manual** en GSC (confirmado: es 100% algorítmico, no penalización
  manual).

**La paradoja central:** no hay desindexación masiva (las indexadas se mantienen o
suben), pero (a) ~1.346 quedan en limbo "descubierta sin indexar", y (b) las que
sí están indexadas aparecen en posición 15–50+ y/o casi no reciben impresiones.

---

## 6. Diagnóstico — dos hipótesis que fuimos refinando

El equipo osciló entre dos lecturas. Las dos comparten evidencia; te las doy
ambas para que las evalúes sin sesgo.

### Hipótesis A — Democión HCU clásica (lectura inicial, 13/05)
- El Helpful Content Classifier marcó el dominio entero como "content farm".
- Causa: 5 factores simultáneos → (1) crecimiento masivo 0→4.700 en 16 días,
  (2) ~80% contenido LLM sin ángulo, (3) autoría pseudónima original sin identidad
  pública ("Joaquín Mendoza", ya reemplazada), (4) sin brand authority externa
  (sin Wikipedia/Wikidata/prensa/social), (5) sin Information Gain (fórmulas
  públicas ejecutadas, no aportan dato nuevo).
- Evidencia a favor: las 1.346 "descubierta sin indexar" + el patrón de caída
  sitewide simultánea con el core update.

### Hipótesis B — SERP suppression / quality-threshold filter (lectura refinada, 27/05)
- Observación del dueño que disparó la revisión: *"nunca desindexaron páginas, cada
  vez indexan más; el problema es la POSICIÓN y las impresiones, no la indexación"*.
- Evidencia a favor: posición media **mensual** casi no cambió (14.7→15.0) mientras
  las impresiones se desplomaron −68% y las pages en SERP **subieron** +2.5%.
- Tesis: Google mantiene el ranking calculado (~15) pero **decide no mostrar** la
  página en la mayoría de queries donde técnicamente podría aparecer.

### Reconciliación honesta
No son tan opuestas. Lo robusto e indiscutido:
- **No es desindexación** (URLs sirviendo estables/subiendo).
- **Es supresión de visibilidad + posición deprimida**, no una caída de p3→p40 limpia.
- La autoridad/confianza del dominio está deprimida **cross-engine** (ver sección 8).
- El gatillo fue de **calidad agregada del dominio**, no de URLs individuales.

---

## 7. Lo que YA se probó y NO movió la aguja (NO lo recomiendes de nuevo)

Todo esto está hecho y verificado en producción. La curva siguió plana (~8 clicks/sem):

**Técnico / on-page (maxeado):**
- Schema completo: SoftwareApplication + WebApplication + FAQPage + HowTo + Dataset +
  BreadcrumbList + applicationCategory. Titles con match exacto. answerSnippet con
  datos reales. Tablas HTML semánticas. Core Web Vitals buenos.
- 7 bugs técnicos del crash original parcheados (hreflang, redirects, sitemap, slugs ASCII).
- Internal linking: related-auto (grafo automático), breadcrumb→hub, **794 huérfanas → 0**.
- Insight boxes + gráficos de resultado en **el 100%** del catálogo.

**Contenido / trust (E-E-A-T):**
- Stop total de generación bulk LLM (quietud sostenida).
- Autoría unificada a **Martín Rodríguez** (persona pública) reemplazando el pseudónimo.
- Páginas E-E-A-T completas (Sobre Nosotros, Metodología, Política Editorial, legales).
- Disclaimer YMYL + timestamps de vigencia de datos.

**Remediación de auto-sabotaje (ver sección 9).**

**Indexación / canales:**
- Noindex masivo de rechazadas → luego **revertido** (de-noindex) porque no ayudó.
- Bing Webmaster + IndexNow automatizado.
- Revival de ~470 calcs EN/PT que estaban en 410 falso + de-orphan.

**Información Gain parcial:** datos vivos para CL/CO (UF, TRM), monotributo a junio 2026
con fuentes oficiales, etc.

**Resultado neto:** 8 clicks/semana antes y después de TODO esto. Cero rebote en Google.

---

## 8. El contraste que más informa: Bing y la IA SÍ funcionan

- **Bing: ~75–85 clicks/día** (≈10x lo de Google, que está en ~8/SEMANA).
  Bing **no** aplica el HCU de Google. Mismo sitio, mismo contenido, mismo on-page.
- **AI search (ChatGPT / Perplexity / Copilot): ~225 sesiones/mes**, creciendo.
- En Bing, para la query estrella "tabla/categorías monotributo 2026", el sitio
  rankea **posición 7**, detrás de AFIP (oficial), medios (Infobae) y estudios
  contables. El cuello ahí es **autoridad de dominio / temática**, no técnico.
- Sub-factor detectado: **mismatch de intención** — muchas queries son
  informacionales ("ver la tabla") y el sitio ofrece una herramienta interactiva
  ("ingresá tus datos"). Quien busca la tabla elige a quien la muestra directo.

**Implicación:** como el on-page rinde en Bing pero no en Google, el problema en
Google es casi seguro de **confianza/autoridad de dominio deprimida por el clasificador
de Google**, no de calidad de página individual.

---

## 9. Auto-sabotaje detectado y corregido (factores que FRENABAN el recovery)

Durante mayo se descubrió que el propio equipo estaba reforzando la señal de "granja"
que el clasificador necesita ver desvanecerse. Ya corregido, pero relevante para el
diagnóstico (explica por qué el recovery no arrancaba):

- **Afiliados en pleno recovery + copy falso:** Skimlinks reescribía outbound links
  a afiliados en las 4.267 URLs (incl. home y privacidad), y el copy afirmaba
  "financiado por AdSense" (AdSense nunca existió). Señal "made-for-affiliate" +
  declaración de confianza FALSA y verificable. **Removido.**
- **`lastReviewed` estampado en masa:** 1.533 calcs con fecha idéntica; 62% del
  catálogo "revisado" en 7 días → el sitemap le grita "edición masiva programática"
  a Google. **Identificado; pendiente derivar fechas reales.**
- **Re-add de contenido bulk podado:** resetea el reloj de "el sitio se calmó".

---

## 10. Composición del contenido (medido sobre los 4.037 archivos, 2026-06-04)

> Auditoría reproducible sobre el 100% de los JSON de calc. Reemplaza una estimación
> previa errónea ("~22% thin") que era un snapshot pre-enriquecimiento ya obsoleto.

- **Volumen:** mediana **1.184 palabras** de texto único por calc; mínimo absoluto
  **395**; p10 = 683. **Cero calcs por debajo de 350 palabras.**
- **Thin ≈ 0.** Umbral estricto (<150 pal. y <3 FAQ) = **0**. Moderado (<300 y <5 FAQ)
  = **0**. Laxo (<500 pal.) = 87 (2.2%), y esas 87 igual tienen 8 FAQ c/u. El **94%**
  son "ricas" (≥500 pal. + ≥5 FAQ + ≥1 fuente real).
- **Cobertura:** 99.9% con ≥7 FAQ; 96.1% con fuente real; 88.7% con ejemplo resuelto;
  100% con caso de uso; **0 noindex**.
- **`audience:"global"` = 67%**, pero es **etiqueta de localización, no defecto**:
  una calc universal (IMC, 1RM, porcentajes) está correctamente en "global". Las que
  requieren localización (impuestos/sueldos AR/MX/CO/CL) ya están localizadas.
- **El eje de calidad que SÍ aplica (distinto de thin): Information Gain.** Muchas
  calcs ejecutan una **fórmula pública** (IMC, %, interés). No son thin, pero su
  aporte único vs. las otras 50 calcs iguales online puede ser bajo. **No se arregla
  con más texto** (ya tienen 1.184 palabras de mediana) sino con dato propio/vivo o
  herramienta diferencial.

---

## 11. Preguntas concretas para vos (la IA)

1. Con esta data, ¿lo clasificás como HCU/quality-demotion a nivel dominio, como
   SERP-suppression/threshold, como ambas, o como otra cosa? ¿Qué dato te lo define?
2. ¿La coexistencia de "indexadas estables" + "1.346 descubierta sin indexar" +
   "posición ~15 con impresiones colapsadas" apunta a un mecanismo específico de Google?
3. Dado que el playbook estándar (sección 7) ya está hecho y no movió nada en 6
   semanas, ¿qué palanca de **alto leverage** falta? Ordenala por impacto esperado.
4. El contenido **NO es thin** (mediana 1.184 palabras, 0% bajo 350, 99.9% con ≥7
   FAQ). El eje real es **Information Gain / diferenciación**: muchas calcs ejecutan
   fórmulas públicas con prosa extensa. ¿Eso puede leerse como "made-for-SEO" por el
   HCU *aunque no sea thin*? Si es así, ¿la salida es diferenciar (datos propios/vivos)
   o consolidar clusters — y nunca "agregar más texto"?
5. ¿Cuánto del problema es "esperar el próximo core update con el sitio limpio y
   quieto" vs. acciones activas? ¿Hay evidencia de que acciones activas aceleren un
   recovery de HCU/suppression, o es fundamentalmente dependiente de core update?
6. Bing rinde 10x Google con el mismo sitio. ¿Eso confirma que es 100% un tema de
   confianza específico del algoritmo de Google, o hay otra lectura?
7. ¿Recomendás seguir con hacecuentas.com o evaluar plan B (dominio nuevo / migración)?
   ¿Con qué umbral de tiempo/KPI gatillarías el plan B?

---

*Datos al 2026-06-04. Pull más fresco de Google: 29/05 (clicks ~8/sem, sostenido al
02/06). Pull más fresco de Bing: 02/06. Sin acción manual en GSC. Mercado: Argentina.*
