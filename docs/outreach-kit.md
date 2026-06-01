# Outreach kit — backlinks para el widget embebible + citas de data

> Creado 2026-05-31. Parte del push de backlinks (alternativa a Ahrefs Link Intersect, que no tenemos).

El widget embebible **ya está construido** (`/embeber`, `/embed/<slug>`, oEmbed). Lo que faltaba es **difusión**: conseguir que medios y blogs lo embeban o citen nuestra data. Este kit es eso.

## 1. Lista de targets (`scripts/outreach-targets.json`)

14 targets curados a mano (medios económicos AR, portales y blogs de nicho) con, por cada uno:
- `medio`, `seccion`, `lang`
- `tema_reciente` — el **beat** del medio (no un artículo específico; ver aviso abajo)
- `pitch` — el dato/herramienta concreto de Hacé Cuentas que les sirve

Cada pitch referencia una calc o dato que **existe de verdad** (monotributo 2026, aguinaldo SAC, comparador plazo fijo, canasta básica INDEC, simulador jubilación ANSES, IMC/TDEE, etc.). Dos ángulos:
- **Embed**: "embebé esta calc gratis en tu nota" (backlink con atribución automática).
- **Cita de data**: "te paso este dato exclusivo para tu nota" (mención/link como fuente).

## 2. Generar los emails

```bash
# Necesita ANTHROPIC_API_KEY (lo lee de .env si no está en el entorno)
python3 scripts/outreach-email-generator.py --targets scripts/outreach-targets.json
# Output: docs/outreach-emails-YYYY-MM-DD.md (1 email por target, listos para copiar)
```

Costo: centavos (Haiku 4.5). El script genera 1 email único por target, sin spam, con un dato concreto y CTA chica.

## 3. Antes de enviar (importante)

- **Verificá `tema_reciente`**: puse el beat del medio, no un artículo puntual, para que el LLM no invente una referencia falsa. Si encontrás una nota reciente real del medio sobre el tema, mejor — editá el email a mano con ese gancho.
- **Buscá el editor**: los emails salen genéricos ("equipo de X"). Si conseguís el nombre del editor de Economía, personalizá el saludo (sube muchísimo la tasa de respuesta).
- **Mandá de a tandas**: 3-5 por día desde tu mail real, no todos juntos.

## 4. Directorios (complementario)

Para alta en directorios (no medios), ya existe el playbook `scripts/directory-submissions.md` con los copy-blocks (nombre, taglines, descripciones EN/ES). Eso da backlinks de baja autoridad pero limpios y rápidos.

## 5. Por qué esto y no Link Intersect

Link Intersect (Ahrefs) encuentra dónde linkean a tus competidores y no a vos. No tenemos cuenta Ahrefs, así que esta lista es la versión manual: medios y blogs del nicho finanzas/salud/pymes AR que plausiblemente embeben una calc o citan un dato. Si en algún momento hay Ahrefs, se puede cruzar competidores (calculadora.com.ar, cuantoes.com, etc.) para sumar targets.
