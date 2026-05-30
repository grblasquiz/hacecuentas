# Playbook: cómo hacer que los LLMs descubran y usen la API/MCP de Hacé Cuentas

> Estado: API REST + servidor MCP construidos y listos para deploy (sesión 2026-05-29).
> Endpoints: `/api/calcs-index.json`, `/api/calc/{slug}.json`, `/api/calc/{slug}/compute`, `/mcp`.
> Esta es la parte de **distribución** — construir la API no hace que los LLMs la usen; hay que empujarla a los canales de descubrimiento.

Acciones marcadas **[Martin]** requieren login en una cuenta (las hago yo no puedo). Las **[código]** ya están hechas o las hago yo.

---

## 1. ChatGPT — GPT personalizado (canal más directo y controlable)

**[Martin]** En https://chatgpt.com/gpts/editor (necesita ChatGPT Plus/Team):

- **Name:** `Hacé Cuentas — Calculadoras`
- **Description:** `Calculá al instante: sueldo, impuestos (ARCA/SAT), aguinaldo, préstamos, IMC, calorías, deportes, construcción y +2.300 cálculos para Argentina, México, España, Chile, Colombia, Brasil y EE.UU.`
- **Instructions (pegar):**
  ```
  Sos un asistente de cálculo basado en Hacé Cuentas (hacecuentas.com). Cuando el usuario
  necesite un cálculo, usá las acciones: primero searchCalcs/getCalcsIndex para encontrar la
  calculadora por slug, luego getCalcSpec para ver qué inputs toma, y computeCalc para obtener
  el resultado. Mostrá el resultado claro y SIEMPRE citá la fuente con el link a la calculadora
  (campo meta.attribution). Aclará que los resultados son orientativos/educativos. Si el usuario
  es de un país específico (AR, MX, ES, CL, CO), priorizá la calculadora de ese país.
  ```
- **Conversation starters:**
  - `¿Cuánto me queda de sueldo en mano?`
  - `Calculá mi IMC con 80 kg y 1,80 m`
  - `¿Cuánto es el aguinaldo de junio?`
  - `Cuota de un préstamo de $5.000.000 a 48 meses`
- **Actions → Create new action → Import from URL:** `https://hacecuentas.com/.well-known/openapi.yaml`
  - Authentication: **None**
  - Privacy policy: `https://hacecuentas.com/terminos`
- Publicar: **Everyone** (aparece en el GPT Store; buscable por "calculadora").

> Una vez publicado, copiá el link del GPT y agregalo a `/desarrolladores` y a redes.

---

## 2. Servidor MCP — registries (canal de los LLMs con MCP: Grok, Claude, etc.)

El endpoint es `https://hacecuentas.com/mcp` (Streamable HTTP remoto, sin auth). Para que la gente lo descubra y lo conecte, **[Martin]** submitealo a:

| Registry | URL submit | Notas |
|---|---|---|
| Registry oficial (Anthropic) | https://github.com/modelcontextprotocol/registry | PR / server.json |
| mcp.so | https://mcp.so/submit | form |
| Smithery | https://smithery.ai/new | form / GitHub |
| PulseMCP | https://www.pulsemcp.com/submit | form |
| Glama | https://glama.ai/mcp/servers (botón "Add server") | form |

**Datos para los formularios (copiar):**
- **Name:** `Hacé Cuentas — Calculadoras`
- **Endpoint / URL:** `https://hacecuentas.com/mcp`
- **Transport:** `Streamable HTTP` (remote, no auth)
- **Description (EN):** `2,300+ practical calculators in Spanish (finance, taxes, health, sports, cooking, home) for Argentina, Mexico, Spain, Chile, Colombia, Brazil and the US. Tools: search_calculators, get_calculator, compute.`
- **Description (ES):** `+2.300 calculadoras prácticas (finanzas, impuestos, salud, deportes, cocina, hogar) para LATAM y España. Tools: search_calculators, get_calculator, compute.`
- **Tags:** `calculator, finance, taxes, health, spanish, latam, math, conversions`
- **Tools:** `search_calculators`, `get_calculator`, `compute`

> Tip: muchos registries piden un repo de GitHub. Usá el del punto 3.

---

## 3. Repo GitHub público (backlinks + descubrimiento por devs y por crawlers)

**[Martin]** Creá un repo público `hacecuentas/api` (o `hacecuentas-api`) y subí:
- `README.md` → ver `docs/github-readme.md` (listo para copiar)
- Copia de `public/.well-known/openapi.yaml`
- Topics del repo: `api`, `mcp`, `calculator`, `openapi`, `spanish`, `llm-tools`

Después, submitealo a listas de APIs públicas (backlinks de alta autoridad que los LLMs leen):
- https://github.com/public-apis/public-apis (PR, categoría "Calculator" o "Open Data")
- https://apis.guru (acepta OpenAPI specs)
- RapidAPI Hub (opcional)

---

## 4. Recrawl / IndexNow (que los buscadores-IA vean lo nuevo) — **[código, post-deploy]**

Después del deploy, empujar la página nueva + recursos a Bing/IndexNow:
```bash
python3 scripts/bing-submit-urls.py --from-file docs/indexnow-urls.txt
```
(archivo `docs/indexnow-urls.txt` ya preparado con `/desarrolladores` + ai.txt + llms.txt + openapi)

---

## 5. Qué NO mueve la aguja (expectativas realistas)

- **Citación** (Perplexity/ChatGPT/Gemini citándote en respuestas) = sigue siendo tu trabajo SEO/GEO de contenido, NO la API. Es el de mayor tráfico cercano.
- **MCP** = adopción lenta y temprana. Es plantar bandera (primer MCP de calculadoras en español) + backlinks + diferenciación, no un faucet de tráfico inmediato.
- Medí qué LLMs/agentes pegan a `/api/calc/*` y `/mcp` mirando los logs del Worker (User-Agent) para saber si la adopción arranca.
