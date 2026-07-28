# Brief: cerrar la migración a hubs de decisión

Repo: `/Users/marrod/hacecuentas` — Astro 6 sobre Cloudflare Workers. Dev server: `npm run dev` (puerto 4388).

Hay **451 hubs ya construidos y en producción**. Falta absorber **166 calculadoras sueltas** y podarlas. Este brief es autocontenido: no hace falta contexto previo.

---

## 1. Qué es un hub de decisión

Un hub = **UNA pregunta concreta que una persona real se hace**, con todas las calculadoras necesarias para responderla adentro. Reemplaza N URLs de calculadora suelta, que redirigen a él con 301.

Ejemplo: en vez de `/calculadora-cts-peru`, `/calculadora-gratificacion-peru`, `/calculadora-vacaciones-truncas-peru` sueltas, un hub `/pe/trabajo/liquidacion-y-beneficios` que responde *"Me voy o me despiden: ¿cuánto me tienen que pagar?"* y calcula las tres cosas en ramas.

**Un hub son dos archivos:**
- Datos: `src/lib/hubs/<locale>/<tema>.ts` → `export const hub: HubData`
- Página: `src/pages/<locale>/<silo>/<tema>.astro` → el `compute()` va inline en su `<script>`

---

## 2. Antes de escribir una línea

Leé **enteros**:
1. `src/lib/hubs/types.ts` — el contrato `HubData`. Es la referencia normativa.
2. `src/lib/hubs/co/renta-personas.ts` + `src/pages/co/impuestos/renta-personas.astro` — hub de país completo, copiá esta estructura.
3. `src/pages/co/impuestos/index.astro` — índice de silo.
4. `src/components/hub/DecisionHub.astro` — sólo para entender el contrato del runtime. **NO lo edites.**

---

## 3. El trabajo

Las listas están en esta carpeta, formato `URL<TAB>título`:

| archivo | calcs | mercado |
|---|---|---|
| `sueltas-pt.tsv` | 85 | Brasil (portugués BR) |
| `sueltas-en.tsv` | 36 | EE.UU. (inglés) |
| `sueltas-uy.tsv` | 8 | Uruguay |
| `sueltas-py.tsv` | 7 | Paraguay |
| `sueltas-es.tsv` | 6 | España |
| `sueltas-co.tsv` | 5 | Colombia |
| `sueltas-ve.tsv` | 5 | Venezuela |
| `sueltas-cl.tsv` | 4 | Chile |
| `sueltas-ec.tsv` | 3 | Ecuador |
| `sueltas-pe.tsv` | 3 | Perú |
| `sueltas-do.tsv` | 2 | Rep. Dominicana |
| `sueltas-pt-pt.tsv` | 2 | Portugal (portugués europeo) |

Por cada mercado:

1. **Agrupá sus calcs en hubs nuevos.** Brasil (85) necesita ~10-14 hubs en silos nuevos: cubren fitness, cocina, tech, bebés, mascotas, construcción, idiomas, viajes. Inglés (36) tiene presupuesto familiar, eventos, salud, trámites. Los demás son pocas: hubs de 2-4 calcs, o entran a un hub que ya existe.
2. **Toda calc tiene que quedar absorbida.** Por cálculo real, o —si no aporta al cálculo— al menos en el `replaces` con un comentario al lado explicando por qué. **Debe quedar 0 sueltas.**
3. Si una calc pertenece claramente a un hub que ya existe, **agregala al `replaces` de ese hub** (y a su cálculo si corresponde).

### Silos que ya existen (reusalos antes de inventar uno nuevo)

```
cl     /cl/auto /cl/dinero /cl/hogar /cl/impuestos /cl/trabajo /cl/vida
co     /co/automotor /co/finanzas /co/impuestos /co/trabajo /co/vida
do     /do/finanzas /do/impuestos /do/trabajo
ec     /ec/auto /ec/estudio /ec/finanzas-personales /ec/hogar /ec/impuestos /ec/trabajo /ec/tramites
en     /en/cars /en/cooking /en/family /en/fitness /en/garden /en/health /en/home
       /en/life /en/math /en/money /en/pets /en/school /en/science /en/tech
es     /es/automotor /es/educacion /es/familia /es/finanzas /es/impuestos /es/trabajo /es/vida /es/vivienda
mx     /mx/auto /mx/familia /mx/finanzas /mx/hogar /mx/impuestos /mx/trabajo /mx/tramites /mx/vida
pe     /pe/auto /pe/finanzas-personales /pe/hogar /pe/impuestos /pe/trabajo /pe/tramites
pt     /pt/dinheiro /pt/matematica /pt/trabalho /pt/veiculos
pt-pt  /pt-pt/familia /pt-pt/financas /pt-pt/impostos /pt-pt/trabalho
py     /py/automotor /py/finanzas /py/impuestos /py/trabajo /py/vivienda
uy     /uy/finanzas /uy/impuestos /uy/trabajo
ve     /ve/finanzas /ve/impuestos /ve/trabajo
```

Si abrís un silo nuevo, **creá su `src/pages/<locale>/<silo>/index.astro`** copiando otro índice. Sin eso, la URL del silo da 404.

---

## 4. Reglas que rompen cosas en silencio

Estas ya causaron daño real en esta migración. No son opcionales.

**Los tres campos obligatorios, como literales de comilla simple al principio de línea:**
```ts
  slug: 'pt/saude/quanto-devo-comer',     // sin barra inicial
  siloHref: '/pt/saude',                  // con barra inicial
  locale: 'pt',
  lastReviewed: '2026-07-28',
```
`scripts/generate-sitemap.ts` los parsea con **regex de línea**. Si usás un template literal (`` `pt/${x}` ``), el hub **desaparece del sitemap y el build NO falla**.

**El `replaces` lleva el prefijo del mercado.** La URL viva es `/en/bmi-calculator`, NO `/bmi-calculator`. Copiá las URLs **textualmente** del `.tsv`. Un agente se olvidó el prefijo en 16 hubs y sus 180 redirects apuntaban a 404.

**Resolvé slug → archivo por el campo `slug` del JSON**, nunca por el nombre del archivo. Casi nunca coinciden.

**En el `.astro`:** `audience` es el código de país literal (`audience="BR"`, `"US"`, `"UY"`…), no `HubData.audience`. Imports de tres niveles: `../../../layouts/Layout.astro`, `../../../lib/hubs/<locale>/<tema>`.

**Los hubs que no son de plata** (matemática, fitness, cocina, tech) necesitan `format: 'plain'` o `'unit'` en las filas del resultado. El default es dinero: sin eso, "3 series" sale como "$3".

**Mínimo 7 FAQ por hub.** Menos es thin content y es regla del proyecto.

**Un hub sintácticamente roto en cualquier mercado tira 500 en TODOS los índices de silo de todos los mercados** — el registry los levanta con un glob. Si todo el dev server da 500, buscá el archivo roto.

**Un hub sin su `.astro` igual aparece listado en su silo**, con link a un 404. Datos y página van juntos o no van.

**NO toques:** `types.ts`, `DecisionHub.astro`, `SiloIndex.astro`, `hub.css`, ningún JSON de `src/content/`, ni hubs de otros. **Nunca `git add -A` ni `git checkout`** (corren varias sesiones sobre el mismo working tree).

---

## 5. Los números salen de la fórmula real, nunca de la cabeza

Cada calc tiene su fórmula en `src/lib/formulas/<slug>.ts`. **Leela.** El hub tiene que reproducir su matemática, salvo que encuentres un bug (ver abajo).

Constantes: usá las fuentes únicas que ya existen —`src/lib/data/<pais>-2026.ts`, `src/data/live/<pais>.json`— y **no las dupliques**. Si una constante no la podés verificar contra fuente oficial, **no la inventes**: va como **campo editable** con la fecha del dato y una advertencia en el `help`.

---

## 6. Bugs confirmados que se repiten (buscalos, son plata real)

Auditar las fórmulas viejas destapó ~200 errores. Estos patrones aparecieron en varios mercados:

- **Calculadoras argentinas disfrazadas de otro mercado.** El peor y más frecuente: precios en pesos argentinos servidos como reales/soles/dólares, índices del BCRA (ICL), leyes argentinas citadas como locales, escalas de jurisprudencia argentina. Un hub brasileño de expensas daba **R$ 105.000/mes para 70 m²**.
- **La misma tabla copiada en dos calcs, con valores distintos.** Apareció en Ecuador, Perú, Colombia, Chile y Brasil. Si dos fórmulas del mismo mercado calculan lo mismo, compará: una suele estar mal. En Chile las dos calcs de luz usaban $115 y $205 por kWh para la misma tarifa.
- **`Number(x) || default` mata el 0 legítimo.** Quien pone 0 de anticipo recibe silenciosamente el default. 33 fórmulas sólo en Chile.
- **Montos anuales tratados como mensuales** (o al revés). Becas chilenas sobreestimadas hasta 16×.
- **Impuestos que no existen**, citando artículos reales de leyes que regulan otra cosa. Verificá que el artículo citado diga lo que la fórmula dice.
- **Texto en español rioplatense** ("sos", "podés", "Ingresá") en mercados que no vosean, y en páginas en inglés o portugués.
- **Conversores bidireccionales** que concatenan la unidad de origen en el resultado convertido.
- **`toLocaleString()` sin locale**: imprime agrupación en-US y un lector brasileño lee `5,040` como 5,04.
- **Tasa efectiva anual dividida por 12** en vez de `(1+TEA)^(1/12)−1`. Da la cuota mal.

Cuando encuentres uno: **implementá lo correcto en el hub**, no repliques el error, y **reportalo** con el número viejo, el correcto y la norma que lo respalda.

---

## 7. Verificación (obligatoria, antes de decir que terminaste)

```bash
# cada ruta nueva y cada índice de silo
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4388/<tu-ruta>

# chequeo de integridad: hubs sin página, campos que el sitemap no ve,
# redirects reclamados por dos hubs a la vez
python3 scripts/check-hubs.py
```

`check-hubs.py` tiene que salir **sin errores bloqueantes**. Sale con código 1 si hay alguno.

Contrastá tus números con la fórmula vieja corriéndola de verdad (`npx tsx` con un script temporal, y borralo después). Toda diferencia tiene que ser deliberada y explicada.

**No hagas build, commit ni deploy.**

---

## 8. Cuando esté todo absorbido: la poda

Sólo después de que las 166 estén dentro de hubs y las rutas den 200.

1. Generar los 301: un `.tsv` nuevo en `scripts/pruning-batches/` con formato `URL_vieja<TAB>URL_nueva<TAB>301`, y correr `python3 scripts/extract-pruning-redirects.py`.
   **Ojo:** el `replaces` de un hub **no** alimenta el pipeline de redirects. Los 301 salen de `public/_redirects` y de esos `.tsv`. Olvidarse este paso deja las URLs viejas en 404.
   Van por el `.tsv` (worker) y **no** por `_redirects`, que ya tiene 2.100 líneas — por encima del límite duro de 2.000 de Cloudflare.
2. Borrar `src/content/calcs-<mercado>/<archivo>.json` de las absorbidas.
3. `npm run related` para regenerar `src/lib/related-auto.json`.
4. Verificar que ningún 301 apunte a otra URL que también se poda (cadenas). El extractor las aplana, pero revisá el conteo que imprime.

---

## 9. Trabajo recuperable

`work/hubs-sin-pagina/` tiene 2 hubs con datos escritos pero sin su `.astro` (los agentes murieron a mitad). El README de esa carpeta explica cómo completarlos. Son:
- `impuestos-de-mi-propiedad.ts` → `cl/impuestos/impuestos-de-mi-propiedad`
- `self-employed-rates-and-taxes.ts` → `en/money/self-employed-rates-and-taxes`
