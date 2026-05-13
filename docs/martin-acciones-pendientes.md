# Acciones pendientes Martin — Recovery Hacé Cuentas

Lista priorizada de cosas que requieren que vos hagas algo manual.
Generado 2026-05-13. Actualizar cuando se cumplan.

---

## URGENTE (esta semana)

### 1. Agregar GH Actions secret `PUBLIC_MS_CLARITY_ID`

Sin esto, Clarity sigue sin renderizar en prod (aunque el ID ya está en `.env` local y el código en `Layout.astro` lo lee).

**Pasos:**

1. Andá a https://github.com/grblasquiz/hacecuentas/settings/secrets/actions
2. Click "New repository secret"
3. Name: `PUBLIC_MS_CLARITY_ID`
4. Secret: pegar el valor de `PUBLIC_MS_CLARITY_ID=` que tenés en `/Users/marrod/hacecuentas/.env`
5. Click "Add secret"
6. Trigger un re-deploy: andá a Actions → "Deploy to Cloudflare" → "Run workflow" → main → Run

Verificación: 3 min después del deploy, `curl -sL https://hacecuentas.com/ | grep clarity.ms` debería tener resultados.

---

### 2. Postear 3 comentarios Reddit (5-10 min)

Tres threads identificados con drafts pre-redactados. Postearlos hoy o mañana antes que pierdan visibilidad. Reglas: 80% comentario útil + 20% link al final, NUNCA arrancar con el link.

**Threads (en `docs/reddit-queue-2026-05-13.md` cuando se commitee, o `/tmp/reddit-month.md`):**

1. **r/AskArgentina** — "Tarjeta de credito para los pobres sin recibo de sueldo?" (2.2h, 3 upvotes, 16 comments) → match Monotributo → https://reddit.com/r/AskArgentina/comments/1tc2e5d/
2. **r/merval** — "Recategorizacion de Julio 2026 Monotributo" (508h, 7 upvotes, 13 comments) → match Monotributo → https://reddit.com/r/merval/comments/1sskh6g/
3. **r/merval** — "Deuda grande con Banco Nación (S 3)" (329h, 14 upvotes, 12 comments) → match préstamo → https://reddit.com/r/merval/comments/1szff5f/

Drafts listos en la queue. Adaptá el tono al thread antes de pegar.

---

### 3. Crear 3 cuentas sociales mínimas

Sin esto, `Organization.sameAs` queda solo con GitHub y Wikidata. Knowledge Graph signals quedan débiles.

**Por dónde empezar (orden de impacto AR):**

1. **Twitter/X**: handle sugerido `@hacecuentas` o `@hacecuentas_ar` (si el primero está tomado). Bio: "Calculadoras online gratis con datos oficiales argentinos (ARCA, ANSES, BCRA). Sin registro, sin tracking molesto." 3 posts/semana mínimo para que no quede "abandonada".

2. **Instagram**: handle `@hacecuentas.ar`. Estrategia: infografías de fórmulas (Canva templates). 1-2 posts/semana. **Importante AR**: IG tiene mejor reach que Twitter en target argentino.

3. **LinkedIn Company Page**: nombre "Hacé Cuentas". Tagline: "Plataforma argentina de calculadoras online". Pasar logo + link al sitio. Tier 1 minimum: 1 post/quincena.

**Después de crearlas**, pegame los handles/URLs y yo actualizo `Layout.astro` con los `sameAs` correctos.

---

## NO HACER TODAVÍA

### Wikipedia stub (paquete listo, prerequisito faltante)

El paquete está en `/Users/marrod/Memoria/cerebro/seo/hacecuentas.com/wikidata-2026-05-13/WIKIPEDIA-STUB-ES.md`. **NO subir antes de tener 2-3 menciones de prensa AR** (Infobae, La Nación Economía, iProUP, Cronista). Sin notability demostrable, te lo borran en horas.

Activar después que H2 (días 30-60) consiga primeras menciones de prensa via pitch.

---

## H1 (próximos 30 días) — bloqueado por desarrollo dev

- IG tanda 2: 50 calcs ARCA Ganancias 2026 → script de fetch + integración en calcs (yo lo armo)
- IG tanda 3: 50 calcs ANSES → script de fetch + integración (yo lo armo)
- Pruning 500-700 LLM "audience:global" con 301 → script + revisión humana de candidatas (yo lo armo, vos aprobás)
- Encuesta orgánica: definir 5-7 preguntas + Typeform setup (definimos juntos, vos publicás)
- Newsletter mensual: setup form + primera edición (yo armo, vos mandás)

---

## Cómo trackear

Marcar cada item con `[x]` cuando esté hecho. Cuando se cierre uno y tengas dudas, preguntá en una nueva conversación con el cerebro — `2026-05-13_plan-maestro-90-180-dias.md` y `decisions.md` tienen el contexto.
