# Hacé Cuentas API + MCP

Free, no-auth JSON API and remote **MCP server** to run 2,300+ practical calculators (finance, taxes, health, sports, cooking, home, science) localized for Argentina, Mexico, Spain, Chile, Colombia, Brazil and the US. Built for LLM tool use (Grok, ChatGPT, Claude, Gemini), agents and apps.

- **Docs (human):** https://hacecuentas.com/desarrolladores
- **OpenAPI 3.1:** https://hacecuentas.com/.well-known/openapi.yaml
- **License:** [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) — attribute "Hacé Cuentas" with a link to the calculator.

## REST API

Base URL: `https://hacecuentas.com`

| Endpoint | What |
|---|---|
| `GET /api/calcs-index.json` | Full catalog (slug, URL, category, locale) |
| `GET /api/calc/{slug}.json` | A calculator's spec: inputs + example + compute URL |
| `GET /api/calc/{slug}/compute?…` | Run the formula, get the result as JSON (`?lang=en\|pt` optional) |
| `POST /api/calc/{slug}/compute` | Same, inputs in JSON body |

### Examples

```bash
# Catalog
curl https://hacecuentas.com/api/calcs-index.json

# Spec (what inputs does it take?)
curl https://hacecuentas.com/api/calc/calculadora-imc.json

# Compute (GET)
curl "https://hacecuentas.com/api/calc/calculadora-imc/compute?peso=80&altura=180"
# → {"ok":true,"result":{"imc":24.69,"categoria":"Peso normal"}, "meta":{…}}

# Compute (POST)
curl -X POST https://hacecuentas.com/api/calc/calculadora-imc/compute \
  -H "Content-Type: application/json" \
  -d '{"inputs":{"peso":80,"altura":180},"lang":"es"}'
```

```python
import requests
r = requests.get("https://hacecuentas.com/api/calc/calculadora-imc/compute",
                 params={"peso": 80, "altura": 180})
print(r.json()["result"])  # {'imc': 24.69, 'categoria': 'Peso normal'}
```

```javascript
const r = await fetch("https://hacecuentas.com/api/calc/calculadora-imc/compute?peso=80&altura=180");
const { result } = await r.json();
console.log(result.imc); // 24.69
```

Responses are deterministic and cached at the edge. CORS is open (`*`). Errors return `{"ok":false,"error":...,"message":...}` with status 400 (missing required inputs), 404 (unknown slug) or 422 (invalid values).

## MCP server (for LLMs)

Remote MCP over Streamable HTTP, no auth:

```
https://hacecuentas.com/mcp
```

Tools: `search_calculators`, `get_calculator`, `compute`.

Add it to an MCP client (Claude Desktop, Cline, etc.):

```json
{
  "mcpServers": {
    "hacecuentas": { "url": "https://hacecuentas.com/mcp" }
  }
}
```

In Grok (xAI) / ChatGPT connectors, add a remote MCP server with that URL.

## Build a custom GPT

Import `https://hacecuentas.com/.well-known/openapi.yaml` as an Action (auth: none).

## Attribution

Results are educational/orientative — verify against official sources before deciding. Every compute response includes a `meta.attribution` field with the canonical calculator link.
