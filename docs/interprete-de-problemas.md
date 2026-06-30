# Intérprete de problemas

Reemplaza conceptualmente al buscador: en vez de buscar por nombre de calculadora,
el usuario **cuenta su problema** en lenguaje natural y el sistema detecta la
intención, pide los datos que faltan, elige las fórmulas y ejecuta el cálculo.

> **Regla dura:** el cálculo final **nunca** lo hace la IA. Lo ejecuta el motor
> determinístico (`runCompute`) vía la tool `calcular`. La IA solo orquesta:
> detecta intención, extrae variables, pregunta lo que falta y elige fórmulas.

## Pipeline

```
Usuario (texto libre)
   │
   ▼
/api/interpret  (POST { messages })
   │
   ▼
src/lib/interpret.ts
   │
   ├─ 1. RETRIEVAL SEMÁNTICO (una vez por turno)
   │     embed query (Workers AI bge-m3) → Vectorize.query → top calcs candidatas
   │     (fallback: searchCalcs por keywords si no hay índice)
   │
   └─ 2. LOOP DE TOOLS (sobre el modelo)
         Workers AI (Llama, gratis) primero; si degrada → Anthropic Haiku
         tool calcular → runCompute (motor determinístico)
   │
   ▼
{ reply, cards }   reply = texto; cards = resultados computados + sugerencias
```

### Por qué semántico

El retrieval por palabras clave no salva la brecha entre el problema en lenguaje
natural ("me queda en mano") y el nombre de la calc ("sueldo en mano" / "neto").
Embeddings sí: indexamos las ~4.300 calcs en **Cloudflare Vectorize** (bge-m3,
1024 dims, multilingüe) y buscamos por significado. El sesgo AR (sitio de
Argentina) se aplica sobre los resultados.

### Por qué híbrido

- **Workers AI (Llama 3.3 70B)** es gratis (corre en la cuenta CF) pero más débil
  e inconsistente para orquestar tools en español, y lento (~10-15s/turno).
- **Anthropic Haiku** es rápido y consistente pero se paga (~1-3¢/turno).

El turno corre primero en Workers AI; si sale **degradado** (no logró calcular, se
estancó, devolvió basura o timeout >18s), se reintenta con Haiku. Resultado:
casi todo es **$0**, se paga Haiku solo en los casos difíciles.

## Piezas

| Archivo | Rol |
|---|---|
| `src/lib/interpret.ts` | Núcleo: retrieval semántico, providers (Workers AI + Anthropic), loop, orquestador híbrido. |
| `src/pages/api/interpret.ts` | Endpoint HTTP. Sanitiza historial, timeout, fallback 503. |
| `src/components/ProblemInterpreter.astro` | UI (textarea + thread + tarjetas). Cae al buscador si la API falla. |
| `src/pages/asistente.astro` | Página canónica `/asistente`. |
| `src/pages/buscar.astro` / `src/pages/index.astro` | Buscador y portada (intérprete como entrada primaria). |
| `scripts/build-calc-embeddings.ts` | Indexa las calcs en Vectorize (`npm run embeddings`). |
| `scripts/vectorize.wrangler.jsonc` | Config mínimo para que el script use AI+Vectorize remotos vía OAuth. |

## Setup (antes de deployar)

### 1. Índice Vectorize (una vez)

```bash
# crear el índice (usa el login OAuth de wrangler, NO el token del .env):
mv .env .env.bak && npx wrangler vectorize create hacecuentas-calcs --dimensions=1024 --metric=cosine ; mv .env.bak .env
# poblarlo (embebe ~4.300 calcs, ~2-3 min):
npm run embeddings           # incremental (sólo lo que cambió)
npm run embeddings -- --full # rebuild completo
```

> El binding `AI` y `VECTORIZE` ya están en `wrangler.jsonc`. En el Worker
> desplegado son nativos (no necesitan permisos de API token). El `remote: true`
> del binding Vectorize es sólo para `wrangler dev`/astro dev.

### 2. Fallback Haiku (opcional pero recomendado)

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

Sin esta clave, el intérprete corre 100% en Workers AI (gratis, algo menos
consistente). Sin NI binding AI NI clave → 503 → el front cae al buscador.

### Mantenimiento del índice

Cuando agregás/cambiás/borrás calcs, correr `npm run embeddings` (incremental,
barato). No hace falta en cada deploy, sólo cuando cambia el catálogo.

## La API (contrato)

`POST /api/interpret` → `{ messages: [{role, content}] }` (o `{ message }`).
Devuelve `{ ok, reply, cards }`:
- `cards[].type = "result"` → cómputo determinístico real; `url` precarga inputs
  en la calc (querystring) y auto-calcula.
- `cards[].type = "suggestion"` → calc candidata (cuando todavía no computó).
- Errores: `503 {fallback:true}` (sin motor), `504` (timeout), `502` (error) → el
  cliente ofrece el buscador por nombre.

Stateless: el cliente manda el historial de **texto**; el server resuelve el turno.

## Otras superficies (todas pegan a `/api/interpret`)

WhatsApp, extensión de navegador y plugin WordPress son clientes finos del mismo
endpoint (la "única inteligencia"). Mantienen el historial por usuario y postean a
`https://hacecuentas.com/api/interpret`. El MCP (`/mcp`) y el compute REST
(`/api/calc/[slug]/compute`) ya exponen las mismas fórmulas.

## Notas SEO / costo

- `/buscar` y `/asistente` son **noindex** (herramientas, no contenido).
- En la portada el intérprete es la entrada primaria; el buscador por nombre queda
  como secundario **intacto** (⌘K, modal del header, contador vivo `#hs-placeholder`).
- Costo: Workers AI + Vectorize entran en el free tier de la cuenta CF a esta
  escala. Haiku sólo se invoca en turnos degradados.
- No se borró ningún slug ni se tocó el sitemap.
