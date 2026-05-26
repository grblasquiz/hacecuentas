# Backlog Martin — próximas 4 semanas (27-may → 23-jun)

**Contexto**: Recovery hacecuentas D13 (desde plan 13-may). Curva W21: 10 clicks/7d, pos 29.5. Lo técnico del playbook está al día; lo que está parado son acciones que solo Martin puede ejecutar (no automatizables por ningún script o agent).

**Regla**: si en D30 (10-jun) no se completó al menos 3 de las 5 categorías, gatillar revisión seria de Plan B (aged domain — research en curso).

---

## 1. Pitch emails a medios AR (HIGH IMPACT, 1h total)

**Estado**: 8 emails personalizados pre-redactados desde 13-may en `docs/pitch-emails-sueldo-real.md`. **0 enviados**.

**Hook**: post de investigación `/blog/sueldo-real-argentino-2026` con datos RIPTE + IPC + dólar. Otro: `argentino promedio NO paga Ganancias 2026` con datos ARCA.

**Destinatarios** (orden de probabilidad de respuesta):
- [ ] iProUP — sección Economía
- [ ] Cronista Comercial — Finanzas Personales
- [ ] Infobae Economía
- [ ] La Nación Economía
- [ ] Clarín Económico
- [ ] Ámbito Financiero
- [ ] TN Tecno (si pitch enfocado a la calc)
- [ ] Apertura (revista emprendedora)

**Cadencia**: 2 emails/día x 4 días. Lunes-jueves la próxima semana.

**Métrica de éxito**: 1-3 menciones en 4 semanas. Cada mención = backlink editorial + unlinked brand mention para Wikipedia stub.

**Si no responden**: dejar de pitch-ear ESE hook después de 2 semanas. Cambiar de ángulo (encuesta cuando salga).

---

## 2. Reddit campaign — escalar de 3 a 30 hits (HIGH IMPACT, 30min/día x 4w)

**Estado**: queue daily monitor activa (commit `c3b1f2bf`), 3/100 hits al 13-may. Probable similar hoy.

**Regla 90/10**: 90% de respuestas = valor real, 10% mención sutil del sitio. Si se invierte la proporción → flag spam → cuenta marcada.

**Subreddits prioritarios**:
- [ ] r/argentina (general AR)
- [ ] r/merval (inversiones/economía)
- [ ] r/personalfinance (en inglés, mercado global)
- [ ] r/Argentinaposting
- [ ] r/uruguay (mercado limítrofe similar)
- [ ] r/FIREargentina
- [ ] r/dolar
- [ ] r/AskArgentina

**Cadencia**: 1-2 respuestas útiles por día (no más — Google detecta patrón). Target D30: 30 hits acumulados.

**Métrica de éxito**: 3 menciones del dominio en thread (linkeadas o no). Reddit es 40% de citations en AI search.

**Tooling**: usar la queue diaria que ya genera el monitor. NO postear sin revisar manualmente el thread.

---

## 3. Encuesta original — lanzar y promover (HIGH IMPACT, 3h setup + drip)

**Estado**: hook definido pero form NO creado. Target 200-500 respuestas en 4-6 semanas (orgánico, sin pauta).

**Preguntas core (3, no más)**:
1. ¿Sabés calcular tu aguinaldo correctamente? (sí / no / + o -)
2. ¿Conocés tu categoría real de monotributo según tu facturación? (sí / no)
3. ¿Cuántos descuentos por ARCA aplican a tu sueldo? (correcto / aproximado / no sé)

**Setup**:
- [ ] Crear Typeform o Google Form (Typeform mejor UX, free tier alcanza)
- [ ] Link prominente en /sobre-nosotros + footer de top 20 calcs AR
- [ ] Mención en social posts (cuando estén activas)
- [ ] CTA en Reddit (cuando aplique al thread, no spam)

**Output esperado D45**:
- Informe PDF descargable + estadísticas shareables ("El 67% no sabe calcular su SAC")
- Pitch a medios (capítulo 2 después del primer pitch)

---

## 4. Cuentas sociales — pasar de "creadas vacías" a "activas" (MEDIUM IMPACT, 20min/día)

**Estado**:
- X / Twitter: @Hacecuentas (en sameAs schema, contenido desconocido)
- LinkedIn: company/122324467 (en sameAs, contenido desconocido)
- Instagram: PENDIENTE crear

**Material**: docs/social-accounts-content.md (desde 13-may, sin postear)

**Cadencia mínima**:
- X: 1 post/día (snippet de calc, dato del día, mini-tip)
- LinkedIn: 1 post/semana (largo, profesional, AR-focus)
- Instagram: 2 posts/semana cuando esté creado (visual: infografía o screenshot calc)

**Métrica de éxito**: 50 followers/cada uno en 4 semanas. NO es objetivo de tráfico inmediato — es **entity recognition** para Google y AI engines (sameAs activos vs muertos).

---

## 5. Mobile rater test del pulgar (MEDIUM IMPACT, 1h una vez)

**Estado**: NO ejecutado. Clarity instalado pero análisis Clarity ≠ mobile rater test.

**Cómo se hace**: agarrar tu celular (no DevTools, no Chrome mobile emulation), abrir top 20 calcs en mobile real. Por cada una:
- ¿Llego al input sin scroll?
- ¿Puedo tipear con el pulgar sin errores?
- ¿El botón de calcular es visible y tappeable?
- ¿El resultado se ve sin pinch-zoom?
- ¿Algún ad/popup tapa el contenido?
- ¿Cuánto tarda en cargar visualmente?

Documentar las 5 frustraciones más fuertes detectadas. Inputar issues a `docs/mobile-frustrations-2026-05.md` con screenshots.

**Por qué importa**: Google quality raters evalúan en celular real. Las heurísticas algorítmicas HCU incluyen mobile UX score.

---

## Lo que NO está en este backlog (y por qué)

- ❌ **AnswerSnippet escalado**: corriendo en agent background. No requiere Martin.
- ❌ **IG tanda 2 ARCA/ANSES/INDEC**: trabajo dev — yo lo arranco cuando termine answerSnippet.
- ❌ **Internal linking restructuring**: trabajo dev — programado para próxima semana mía.
- ❌ **Wikipedia stub**: depende de tener menciones de prensa primero (#1).
- ❌ **YouTube canal**: backlog larga, postergado a D60+.
- ❌ **Newsletter setup**: postergado a D60+ — primero hay que tener algo que mandar.
- ❌ **Plan B aged domain compra**: research en curso (sin compromiso), decisión D60.

## Métrica integrada: ¿el plan se está ejecutando?

Lunes 23-jun, evaluar este checklist:

- [ ] ¿8 pitches enviados? (target: 8/8)
- [ ] ¿30 Reddit hits totales? (target: 30+)
- [ ] ¿Encuesta lanzada con 50+ respuestas? (target: 50+)
- [ ] ¿X + LinkedIn con 20+ posts cada uno? (target: 20+)
- [ ] ¿Mobile rater test documentado? (target: sí/no)

Si ≥3/5 → plan en ejecución, dar otras 4 semanas.
Si <3/5 → no es problema del plan, es problema de bandwidth Martin → reconsiderar Plan B o contratación asistente $$.

---

_Generado 2026-05-26. Próxima revisión: lunes 23-jun._
