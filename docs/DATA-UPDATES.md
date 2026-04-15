# Pipeline de actualización de datos

Cómo funciona el sistema que mantiene frescos los datos de las 205 calculadoras.

## Idea general

Cada calc declara en su JSON un bloque `dataUpdate` con:

```json
{
  "frequency": "daily | weekly | monthly | biannual | yearly | never",
  "lastUpdated": "YYYY-MM-DD",
  "source": "Nombre de la fuente oficial",
  "sourceUrl": "https://...",
  "updateType": "manual | auto-api | auto-scrape | auto-llm",
  "notes": "qué hay que actualizar y cómo (opcional)"
}
```

El pipeline corre en GitHub Actions por cron y abre un **PR** (no commitea directo) con los cambios para revisar antes de deployar.

## Cobertura actual

Distribución de las 205 calcs por `frequency`:

| Frequency | Calcs | Implementado |
|-----------|------:|:-------------|
| never     | 171   | N/A (no se actualizan nunca) |
| daily     | 2     | ✅ `fetchers/dolar.ts` |
| monthly   | 9     | ✅ parcial: `fetchers/bcra.ts` + `fetchers/ipc.ts` (6 de 9) |
| biannual  | 8     | ✅ parcial: `fetchers/monotributo.ts` (1 de 8, resto auto-llm pendientes) |
| yearly    | 15    | ⏳ pendiente (mezcla auto-llm + auto-scrape) |

Para ver el detalle vivo: `node --experimental-strip-types scripts/update-data/index.ts --report`.

## Workflows de GitHub Actions

- **[`update-data-daily.yml`](../.github/workflows/update-data-daily.yml)** — corre `0 10 * * *` (07:00 ARG). Fetchers: dolar. Abre PR si hay cambios.
- **[`update-data-monthly.yml`](../.github/workflows/update-data-monthly.yml)** — corre día 16 del mes (INDEC ya publicó IPC). Fetchers: bcra, ipc. Abre PR.
- **[`update-data-biannual.yml`](../.github/workflows/update-data-biannual.yml)** — cron 15 enero + 15 julio. Si hay `ANTHROPIC_API_KEY` configurada en los secrets, corre los fetchers auto-llm (monotributo por ahora) y abre PR. Si falta la key, abre un issue con checklist manual.

Todos tienen `workflow_dispatch` con flag `dry` para testear manualmente desde la UI de Actions.

## Correr localmente

```bash
# Ver cobertura
node --experimental-strip-types scripts/update-data/index.ts --report

# Dry run de todo (sin escribir archivos)
node --experimental-strip-types scripts/update-data/index.ts --dry

# Correr solo un fetcher
node --experimental-strip-types scripts/update-data/index.ts --fetcher=dolar
node --experimental-strip-types scripts/update-data/index.ts --fetcher=bcra --dry

# Correr todos los de una frecuencia
node --experimental-strip-types scripts/update-data/index.ts --frequency=daily
node --experimental-strip-types scripts/update-data/index.ts --frequency=monthly --dry
```

## Estructura del código

```
scripts/update-data/
├── index.ts              # orchestrator CLI + SUMMARY:: output
├── registry.ts           # mapea name → run (fetcher), slugs afectados, frecuencia
├── fetchers/
│   ├── dolar.ts         # dolarapi.com → src/lib/formulas/dolar-ar.ts (fallback)
│   ├── bcra.ts          # BCRA v4 → alquiler-icl + credito-uva + plazo-fijo
│   └── ipc.ts           # argentinadatos IPC → inflacion-ipc
├── patchers/             # primitivas para tocar archivos
│   ├── data-update-date.ts   # actualiza dataUpdate.lastUpdated en JSON
│   ├── json-field.ts         # patches a fields[].default y presets[]
│   └── ts-constant.ts        # patches a constants y arrays en archivos .ts
└── utils/
    ├── freshness.ts      # listAllCalcs(), isStale(), filterByFrequency()
    └── logger.ts         # logger con prefijo + niveles info/warn/error/success/skip
```

## Agregar un fetcher nuevo

Ejemplo: querés automatizar la calc `calculadora-foo`.

1. **Identificá qué datos se actualizan y dónde viven**. Puede ser:
   - Un campo `default` en `fields[]` del JSON de la calc → usar `patchers/json-field.ts::updateFieldDefault`
   - Un preset de la calc → usar `patchers/json-field.ts::replacePresets`
   - Una constante en un archivo `src/lib/formulas/*.ts` → usar `patchers/ts-constant.ts::replaceNumericKeyInObject` o `replaceArrayLiteral`
   - Solo marcar la calc como fresca → usar `patchers/data-update-date.ts::touchLastUpdated`

2. **Creá `scripts/update-data/fetchers/foo.ts`**:

```ts
import { updateFieldDefault } from '../patchers/json-field.ts';
import { touchLastUpdated } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('foo');

export async function fetchFoo({ dry = false }: { dry?: boolean }): Promise<boolean> {
  log.info('fetching api.foo.com/bar');
  const res = await fetch('https://api.foo.com/bar');
  if (!res.ok) {
    log.error(`respondió ${res.status}`);
    return false; // no tumba el workflow
  }
  const data = await res.json();
  const today = new Date().toISOString().slice(0, 10);

  if (!dry && updateFieldDefault('calculadora-foo', 'campoX', data.valor)) {
    log.success(`foo default → ${data.valor}`);
    touchLastUpdated('calculadora-foo', today);
    return true;
  }
  log.skip('sin cambios');
  return false;
}
```

3. **Registralo** en `scripts/update-data/registry.ts`:

```ts
import { fetchFoo } from './fetchers/foo.ts';

export const REGISTRY: FetcherEntry[] = [
  // ...existentes
  { name: 'foo', slugs: ['calculadora-foo'], frequency: 'daily', run: fetchFoo },
];
```

4. **Testealo en dry**:

```bash
node --experimental-strip-types scripts/update-data/index.ts --fetcher=foo --dry
```

Si todo ok, corré sin `--dry` para confirmar que los archivos se modifican bien, commiteá, y al próximo cron el workflow lo va a correr solo.

## Los 4 tipos de updateType

- **`auto-api`** — la fuente tiene API REST estable (dolarapi, BCRA, INDEC, argentinadatos). Es el caso ideal: rápido, sin parsing, sin riesgo.
- **`auto-scrape`** — hay que scrapear HTML porque la fuente no publica API (ENARGAS, ENRE, surtidores YPF, CAC m2). Más frágil — rompe si cambia el markup. Todavía no hay ninguno implementado.
- **`auto-llm`** — hay que leer PDFs o páginas con layout complejo (AFIP Monotributo, ANSES jubilaciones, ley de indemnizaciones). Resuelto con `utils/ask-claude.ts` que llama a la Messages API con web_search + web_fetch server-tools. `fetchers/monotributo.ts` es el primer ejemplo.
- **`manual`** — nunca se automatiza, requiere juicio humano. Reservado para calcs tipo `never` o decisiones editoriales.

### Agregar un fetcher auto-llm

```ts
// fetchers/foo.ts
import { askClaudeStructured } from '../utils/ask-claude.ts';
import { replaceArrayLiteral } from '../patchers/ts-constant.ts';

export async function fetchFoo({ dry = false }: { dry?: boolean }) {
  const result = await askClaudeStructured<MyShape>({
    task: `Buscá en <fuente oficial> los <datos>. Devolvé <estructura>...`,
    schema: { type: 'object', required: [...], properties: {...} },
    validate: (data) => {
      // sanity checks custom (ordering, rangos razonables, etc.)
      return { ok: true };
    },
  });
  if (!result) return false;
  // ...patchear archivo objetivo + touchLastUpdated
}
```

**Claves del diseño:**
- **Fail-soft**: si `ANTHROPIC_API_KEY` no está o la API falla, `askClaudeStructured` devuelve `null` y el fetcher retorna `false` (no tumba el workflow).
- **Schema estricto**: todo viene con rangos (`minimum`/`maximum`), enums y `minItems`/`maxItems` para atajar alucinaciones obvias.
- **Validate extra**: función que verifica invariantes semánticas (ordering, relaciones entre campos).
- **PR review**: los cambios siempre van por PR con label `needs-review` — Martin revisa contra la fuente oficial antes de mergear.

**Config:** agregar `ANTHROPIC_API_KEY` como secret del repo en Settings → Secrets → Actions. Sin eso, el workflow biannual cae al modo manual (abre issue).

**Costo aprox:** ~60K tokens por fetcher con Sonnet 4.6 ≈ $0.20/run. 21 fetchers × 2/año = ~$8/año. Despreciable.

## Nueva calc desde cero

Usá el wizard que ya pide `dataUpdate`:

```bash
npm run new-calc
```

El wizard te va a pedir `frequency`, `updateType`, `source`, `sourceUrl` y `notes`. Si la freq es distinta de `never`, el build CI va a fallar si le falta source.

## CI guard

El script `scripts/validate-data-updates.ts` corre en `prebuild` (antes de cada `npm run build`). Falla con exit code 1 si:

- Un JSON no tiene `dataUpdate`
- `frequency` no está en el enum permitido
- `updateType` no está en el enum permitido
- `lastUpdated` no matchea `YYYY-MM-DD`
- `frequency !== 'never'` y falta `source` o `sourceUrl`

Esto es lo que garantiza que agregar calcs nuevas sin declarar `dataUpdate` rompa el build y se note.

## UI pública

En el footer de cada calc (cuando `frequency !== 'never'`) aparece una línea tipo:

> 🕒 Última actualización: 16 de abril de 2026 · Fuente: [BCRA](https://www.bcra.gob.ar)

El link abre la fuente oficial. Es el badge de confianza que le dice al usuario "estos datos no son viejos".

## Troubleshooting

- **El fetcher dice "sin cambios" pero debería cambiar** → revisar regex del patcher (keys con mayúscula/minúscula, typos). Correr con `--dry` y log-level alto.
- **Una API devuelve 500** → el fetcher loguea error y retorna `false`. El próximo cron reintenta. Si es sistemático, revisar si la API cambió endpoint o auth.
- **BCRA deprecó un ID de variable** → actualizar el ID en `fetchers/bcra.ts`. La v4 permite listar todas en `https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias`.
- **Se abrieron 5 PRs seguidos del mismo cron** → el peter-evans action está configurado con `branch: auto/update-*` y `delete-branch: true`, así que siempre actualiza el mismo branch. Si ves duplicados, revisar que el `branch` coincida entre runs.
