# Canibalización — cluster de fin de semana

**Fecha:** 2026-07-03
**Método:** conteo de enlaces internos entrantes (`inbound` = apariciones del slug en `relatedSlugs` de todo el catálogo AR) + agrupación por intención dentro de las familias de ocio. Datos crudos en `docs/inventario-contenido-fin-de-semana.csv`.
**Regla transversal:** ningún 301/borrado se ejecuta sin datos externos (GA4 tráfico, GSC impresiones/keywords, backlinks). Por defecto la acción es **enlazado interno** o **canonical reversible** (sin `noindex`). El campo es `canonicalSlug`, apunta al **slug** de la cabeza.

**Leyenda de acciones:**
- **MANTENER+ENLAZAR** — página con intención propia; solo reforzar enlace interno hacia/desde la maestra.
- **CANONICAL→cabeza** — misma intención que la cabeza; consolidar equity vía `canonicalSlug` (reversible, sin de-indexar duro). **Solo tras confirmar en GSC que no tiene ke’s/impresiones propias.**
- **INTEGRAR-MÓDULO** — su cálculo pasa a ser un módulo de la herramienta maestra; la URL sobrevive y enlaza a la maestra.
- **REVISAR-DATOS** — decisión requiere GA4/GSC antes de actuar.

---

## Nota sobre la "cabeza" de cada cluster

La cabeza debería ser la URL con **mayor autoridad interna + mejor slug + intención más amplia**. Ojo con una anomalía detectada: en varios clusters la cabeza *canonical asignada* NO es el nodo de mayor autoridad interna (ver Combustible). Antes de canonicalizar, alinear cabeza = nodo de autoridad, o mover la autoridad hacia la cabeza vía enlazado.

---

## FAMILIA ASADO

**URL principal recomendada:** `calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo` (cabeza canonical vigente).
**Keyword principal:** "calculadora asado kg por persona". **Intención:** planificación de compra (cuánta carne y cortes).

| Slug | Inbound | Diferencia real | Acción | ¿Indexable? |
|---|---|---|---|---|
| `calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo` | 2 | **CABEZA** — total + desglose por corte | Ampliar a planificador integral | Sí |
| `calculadora-carne-asado-kg-por-persona` | 3 | Igual intención, menos completa | **CANONICAL→cabeza** (ya aplicado) | canonical |
| `calculadora-asado-por-invitado-kg-carne` | 2 | Igual intención | **CANONICAL→cabeza** (ya aplicado) | canonical |
| `calculadora-chorizos-por-invitado-asado` | 2 | Solo chorizos | **INTEGRAR-MÓDULO** + mantener | Sí |
| `calculadora-empanadas-por-persona-evento-asado-cumple` | 4 | Empanadas (cruza fiestas) | MANTENER+ENLAZAR | Sí |
| `calculadora-tamano-parrilla-personas-m2` | 0 | Tamaño de parrilla (m²) — intención propia | INTEGRAR-MÓDULO ("¿me entra?") | Sí |
| `calculadora-cantidad-hamburguesas-parrilla-cumpleanos` | 0 | Hamburguesas | MANTENER+ENLAZAR (huérfana) | Sí |

**¿Integrar en una sola?** Sí, como maestra: la de cortes absorbe carne/asado-por-invitado (ya canonical). Chorizos/tamaño-parrilla se vuelven módulos pero conservan URL. **Riesgo sin datos:** bajo (ya consolidado, reversible).

---

## FAMILIA FIESTAS / EVENTOS

Es la familia más fragmentada. Se subdivide en 4 sub-clusters:

### 4.1 Bebidas de evento (cuánto comprar)
**URL principal:** `calculadora-cerveza-invitado-evento` (12 inbound — nodo de autoridad de toda la familia) o una futura maestra "bebidas para evento".
**Keyword:** "cuánta cerveza/bebida por persona fiesta". **Intención:** cantidad de bebida a comprar.

| Slug | Inbound | Acción |
|---|---|---|
| `calculadora-cerveza-invitado-evento` | 12 | CABEZA de bebidas |
| `calculadora-vino-por-invitado-horas-evento` | 5 | vs. `vino-por-invitado-cena` = casi dup → **REVISAR-DATOS** (una cabeza vino) |
| `calculadora-vino-por-invitado-cena` | 4 | ídem |
| `calculadora-agua-por-invitado-fiesta` | 5 | Complementaria (agua) — INTEGRAR-MÓDULO |
| `calculadora-fernet-cola-por-invitado-juntada` | 2 | vs. `fernet-cola-proporciones` (2) = **cuánto comprar** vs **receta** → MANTENER ambas, diferenciar copy |
| `calculadora-fernet-cola-proporciones` | 2 | ídem (receta) |
| `calculadora-whisky-por-invitado-evento` | 2 | Cuántas personas rinde 1 botella — MANTENER+ENLAZAR |
| `calculadora-bebidas-evento-litros-por-persona` | — | Genérica multi-bebida → candidata a **maestra de bebidas** |
| `calculadora-bebidas-evento-cerveza-vino-refresco-calculadora` | 0 | Casi dup de la anterior → **CANONICAL→** genérica (REVISAR-DATOS) |
| Cócteles-receta: `pisco-sour` (7), `mojito-cubano`, `gin-tonic`, `aperol-spritz`, `daiquiri`, `whisky-sour`, `caipirinha`… | varios | **Intención distinta (receta, no cantidad-compra).** MANTENER como cluster "recetas de trago para varios", enlazar entre sí y a la maestra de fiesta. NO canonicalizar contra bebidas-cantidad |

### 4.2 Presupuesto de evento
**URL principal recomendada:** `calculadora-presupuesto-cumpleanos` (slug limpio) o ampliar hacia la maestra "planificador de fiesta".
**Keyword:** "presupuesto cumpleaños / cuánto gastar fiesta". **Intención:** presupuesto total del evento.

| Slug | Inbound | Diferencia real | Acción |
|---|---|---|---|
| `calculadora-presupuesto-casamiento-por-invitado` | 11 | Casamiento (autoridad) | MANTENER (intención boda propia) |
| `calculadora-presupuesto-cumple-15-quinceanera` | 4 | 15 años | MANTENER (intención propia) |
| `calculadora-presupuesto-graduacion` | 1 | Graduación | MANTENER |
| `calculadora-presupuesto-cumpleanos` | 0 | Genérico cumple | **AMPLIAR → maestra de fiesta** |
| `calculadora-costo-fiesta-cumpleanos-infantil-invitados` | 0 | Cumple infantil | **CANONICAL→** genérico o INTEGRAR (REVISAR-DATOS) |
| `calculadora-cumpleanos-invitados-gastar-torta-regalos` | 0 | Cuánto gastar cumple | **CANONICAL→** genérico (REVISAR-DATOS) |
| `calculadora-costo-boda-argentina` | 0 | Boda genérica | **CANONICAL→** `presupuesto-casamiento-por-invitado` (REVISAR-DATOS) |

### 4.3 Comida por invitado (per-food)
Pizza, empanadas, sushi, picada, canapés, sándwiches, torta, helado. **Intención:** cantidad de cada comida. Estos alimentan la maestra **"comida para invitados"** (Herramienta 4). Ya hay consolidación pizza/torta por canonical. Sushi tiene 3 URLs (`porciones-sushi-por-persona-promedio`, `sushi-por-invitado-cena`, `sushi-piezas-por-persona-evento-cumpleanos`) → **REVISAR-DATOS** para elegir cabeza sushi.

### 4.4 Logística de evento (no-comida)
`meseros-necesarios-invitados` (5), `vajilla-alquiler-invitados` (3), `sillas-mesas-invitados` (2), `invitaciones-cumple-numero` (2), `cotillon-cumple-personas` (2), `regalos-invitado-souvenir` (1). **Intención propia cada una** → MANTENER+ENLAZAR como módulos de la maestra de fiesta. Cero canibalización entre sí.

---

## FAMILIA COCINA

### 5.1 Conversores de medida
**URL principal:** `calculadora-conversion-medidas-cocina-tazas-gramos` (cabeza canonical vigente).

| Slug | Inbound | Acción |
|---|---|---|
| `calculadora-conversion-medidas-cocina-tazas-gramos` | 2 | CABEZA |
| `calculadora-conversor-tazas-a-mililitros` | 11 | **Nodo autoridad**, pero intención propia (ml, no g) → MANTENER (no canonical) |
| `conversor-tazas-gramos-cocina-recetas` | 1 | **CANONICAL→cabeza** (ya aplicado) |
| `calculadora-conversion-cups-gramos-harina-azucar-aceite` | 0 | **CANONICAL→cabeza** (ya aplicado) |
| `calculadora-conversion-peso-volumen-ingredientes-cocina` | 0 | Peso↔volumen — **REVISAR-DATOS** (posible CANONICAL) |
| `calculadora-conversion-cucharaditas-gramos-especias-sal` | — | Cucharaditas — intención propia, MANTENER |

### 5.2 Café — ratio por método (fuerte canibalización)
**URL principal recomendada:** definir una cabeza "proporción café/agua por método".

| Slug | Inbound | Acción |
|---|---|---|
| `calculadora-cafe-french-press-ratio` | 3 | Método específico |
| `calculadora-cafe-ratio-agua-gramos-metodo-preparacion` | 1 | **Genérica multi-método** → candidata a CABEZA |
| `calculadora-proporcion-cafe-agua-metodo-preparacion` | 0 | Casi dup de la anterior → **CANONICAL→** cabeza (REVISAR-DATOS) |
| `calculadora-cafe-molido-taza-metodo-preparacion` | 0 | Gramos por taza — REVISAR-DATOS |
| `calculadora-moka-pot-agua-cafe` | 2 | Método específico — MANTENER |
| `calculadora-cold-brew-ratio` | 2 | Método específico — MANTENER |
| `calculadora-espresso-tds-yield` | 1 | Extracción — intención propia, MANTENER |

### 5.3 Temperatura de horno (canibalización)
| Slug | Inbound | Acción |
|---|---|---|
| `calculadora-temperatura-horno-celsius-fahrenheit-gas` | — | Candidata CABEZA (más completa: °C/°F/gas) |
| `calculadora-conversor-fahrenheit-a-celsius-horno` | 0 | Subconjunto → **CANONICAL→** cabeza (REVISAR-DATOS) |
| `calculadora-conversion-temperaturas-horno-gas-electrico` | 0 | Subconjunto → **CANONICAL→** cabeza (REVISAR-DATOS) |

### 5.4 Porciones (arroz / pasta / sushi)
Arroz×2 (`porciones-arroz-por-persona-guarnicion`, `porcion-arroz-gramos-personas` — **CANONICAL** entre sí, REVISAR-DATOS), pasta (`porciones-pasta-seca-persona-hambre`), sushi×3 (ver 4.3). Intención: gramos/porción por comensal. MANTENER las de comidas distintas; consolidar los duplicados exactos de arroz.

### 5.5 Escalado de receta / cocción
`multiplicar-dividir-receta-porciones` (3, escalador — módulo clave para "comida invitados"), tiempos de cocción (verduras/legumbres/carne/masa) = intención propia cada una, MANTENER+ENLAZAR.

---

## FAMILIA VIAJES

### 6.1 Combustible / costo por km (CLUSTER CLAVE para planificador de viaje)
**Anomalía:** la cabeza canonical tiene menos autoridad que sus satélites.

| Slug | Inbound | Acción |
|---|---|---|
| `calculadora-costo-por-kilometro-auto` | **15** | Nodo de autoridad #1 — que enlace a la maestra |
| `calculadora-consumo-nafta-litros-100km` | **13** | Nodo de autoridad #2 — que enlace a la maestra |
| `calculadora-autonomia-tanque-combustible` | 7 | Autonomía — INTEGRAR-MÓDULO |
| `calculadora-costo-viaje-combustible-kilometros` | 3 | **CABEZA canonical** (baja autoridad) → **AMPLIAR a planificador** + reforzar inbound |
| `calculadora-litros-nafta-viaje-ruta-argentina` | 1 | **CANONICAL→cabeza** (ya aplicado) |
| `calculadora-combustible-viaje-auto` | 1 | **CANONICAL→cabeza** (ya aplicado) |
| `calculadora-consumo-combustible-km-litro` | 0 | Casi dup de consumo-100km → **CANONICAL** (REVISAR-DATOS) |
| `calculadora-autonomia-tanque-lleno-kilometros` | 0 | Dup de autonomía → **CANONICAL** (REVISAR-DATOS) |

### 6.2 Presupuesto de viaje por destino
`presupuesto-viaje` (genérico, cabeza) + `-madrid` (6), `-rio-janeiro` (3), `-dubai`, `-lima-peru`, `-santiago-chile`, `-vacaciones` (→canonical ya) + `vacaciones-bariloche-*`, `emigrar-espana-*`×2. **Intención:** presupuesto de viaje. Los por-destino tienen keyword propia (long-tail) → **MANTENER** los de destino con demanda, **CANONICAL** solo los genéricos duplicados. **REVISAR-DATOS** (los por-destino suelen traer impresiones long-tail).

### 6.3 Peajes
`costo-peaje-ruta` (3, cabeza) + `autovia-peajes-argentina-ruta-2-ruta-3` (0). INTEGRAR-MÓDULO en planificador de viaje.

### 6.4 GNC vs nafta
`comparar-nafta-vs-gnc-ahorro` (4) vs `ahorro-gnc-vs-nafta-anual-ars` (0) → **CANONICAL** (REVISAR-DATOS).

### 6.5 Equipaje aéreo (~7 URLs, superposición alta)
`equipaje-extra-costo-aerolinea` (7, cabeza), `equipaje-mano-bodega-peso-volumen`, `maletas-peso-aerolineas`, `equipaje-permitido-franquicia`, `equipaje-peso-sobrepeso`, `equipaje-vuelo-kg-lb`, `ropa-maleta-dias-viaje`. **REVISAR-DATOS** — probable consolidación a 2-3, pero prioridad BAJA para finde (intención viaje largo, no escapada).

### 6.6 Millas/puntos (~12 URLs) y Jet-lag/husos (~6)
Clusters densos de travel-hacking. **Prioridad BAJA para el objetivo finde** (no son escapada de finde). Anotados para un pase futuro, no ahora.

---

## FAMILIA ENTRETENIMIENTO (casa)

**Diagnóstico:** 60/69 huérfanas. Poca canibalización, mucha **orfandad + categorización floja**. Sub-clusters:
- **Ocio en casa (núcleo finde, TODOS huérfanos):** `maraton-serie-tiempo`, `anime-tiempo-bingear-temporadas`, `horas-peliculas-serie-inmersion`, `playlist-duracion-canciones`, `karaoke-canciones-por-hora`, `puzzle-1000-piezas-tiempo`, `tiempo-completar-juego-horas`. → **RESCATE POR ENLAZADO** (hub entretenimiento). Cero canibalización.
- **Mal categorizados (mover de categoría, no borrar):** planes de maratón running (deberían ser `deportes`), calcs de marketing/redes (`engagement-rate`, `cpm-cpc`, `roi-publicidad`, `mejor-hora-publicar`, `influencer-tarifa` → `marketing`), fotografía (`exposicion-triangulo`, `filtro-nd`, `dpi`, `ppi` → `tecnologia`/`ciencia`), música (`bpm-tempo`, `afinacion-frecuencia`, `transposicion-acordes`).
- **Gaming/PC:** `ping-latencia`×2, `fps-ideal-monitor`, `bottleneck`, `sensibilidad-mouse-dpi`, `costo-gaming-por-hora`, `energia-pc-gaming`. Cluster propio, enlazar entre sí.

**Acción:** ninguna 301. Rescatar por enlazado + recategorizar los mal etiquetados (mueve `category`, no la URL).

---

## FAMILIA HOGAR / PROYECTOS

**Diagnóstico:** 34/39 huérfanas + canibalización en varios sub-clusters. Alimenta la Herramienta 5.

| Sub-cluster | URLs | Acción |
|---|---|---|
| **Pintura** | `pintura-por-m2-litros-latas`, `conversor-litros-pintura-por-metro-cuadrado`, `m2-pared-descontando-aberturas-pintura` (1) | Cabeza = `pintura-por-m2-litros-latas`. Otras → INTEGRAR-MÓDULO/CANONICAL (REVISAR-DATOS) |
| **Pisos/cerámica** | `piso-flotante-m2-tablas`, `pisos-ceramicos-porcellanato-cajas`, `ceramicos-m2-cajas`, `azulejos-baldosas-m2`, `pegamento-ceramicas-bolsas-m2` | Canibalización cerámica → elegir cabeza, REVISAR-DATOS |
| **Muebles** | `madera-necesaria-mueble` (7, autoridad hogar), `deck-madera-tablas-tornillos` | MANTENER, es el nodo de autoridad DIY |
| **Empapelado** | `rollos-empapelado-papel-pared` | INTEGRAR-MÓDULO |
| **Siembra (calendario)** | `siembra-calendario-argentina-zona`, `calendario-siembra-hemisferio-norte`, `calendario-siembra-hemisferio-sur` | Canibalización → cabeza AR, hemisferios como variantes. REVISAR-DATOS |
| **Césped/semilla** | `cesped-semillas-kg-m2` vs `pasto-semilla-kg-m2-cesped-sembrar` | **CANONICAL** entre sí (REVISAR-DATOS) |
| **Pileta** | `costo-mensual-pileta`, `piscina-cloro-mantenimiento`, `tiempo-evaporacion-piscina`, `pileta-natacion-litros-m3` | Intención distinta (costo/cloro/evaporación/volumen) → MANTENER+ENLAZAR |

**Gaps reales (no existen):** "cuántas cajas para mudanza", "limpieza profunda tiempo/tareas". Son piezas del planificador de hogar que habría que **crear** (no hay canibalización porque no existen).

---

## FAMILIA MASCOTAS (solo no-médico)

**Regla YMYL (Fase 19):** las de dosis (`dosis-antiparasitario`, `dosis-antipulgas`, `dosis-medicamento-mascota`) ya están en **noindex** — NO promover, NO integrar. Las de mascotas para finde son:

| Slug | Inbound | Acción |
|---|---|---|
| `calculadora-comida-perro-diaria-gramos` | 21 | **Nodo de autoridad mascotas** — cabeza de "comida/presupuesto perro" |
| `calculadora-comida-gato-diaria-gramos` | 6 | MANTENER (especie propia) |
| `calculadora-edad-perro-humano` / `edad-humana-por-raza-perro` | 12 / 19 | Fun/viral — MANTENER, enlazar a hub |
| `calculadora-costo-mensual-mascota-perro-gato` | 0 | Presupuesto — RESCATE POR ENLAZADO |
| `calculadora-minutos-paseo-perro-raza-edad` / `paseos-perro-minutos-raza-energia` | 0 | **CANONICAL** entre sí (dup paseo) — REVISAR-DATOS |
| `calculadora-tamano-cucha-perro-medidas` | 0 | RESCATE POR ENLAZADO |
| `calculadora-arena-sanitaria-gato-kg-mes` | 0 | RESCATE POR ENLAZADO |

**Duplicados de edad-perro:** hay ~6 variantes de "edad perro en humano" (`edad-perro-humano`, `edad-perro-anos-humanos`, `edad-perro-humano-raza-tamano`, `edad-humana-por-raza-perro`, `envejecer-mascota-humano-tabla-raza`, `edad-cachorro-humano`). Fuerte canibalización → **REVISAR-DATOS** (elegir cabeza, canonical el resto). Alta prioridad porque tienen tráfico de finde (idx>1.3 histórico para edad-perro).

---

## Resumen de decisiones que requieren datos externos antes de ejecutar

| Cluster | Acción propuesta | Bloqueado por |
|---|---|---|
| Vino evento ×2, Fernet ×2, Bebidas genéricas ×2 | Elegir cabeza + canonical | GSC keywords/impresiones por URL |
| Presupuesto cumple/boda ×4 | Canonical hacia genérico/casamiento | GA4 + GSC |
| Café ratio ×3, Temp horno ×3, Arroz ×2 | Canonical hacia cabeza | GSC |
| Combustible: consumo-100km/km-litro, autonomía ×2 | Canonical duplicados | GSC |
| Presupuesto viaje por destino | Mantener los con demanda long-tail | GSC (impresiones por destino) |
| Equipaje ×7, Millas ×12 | Consolidar (prioridad baja finde) | GSC |
| Edad-perro ×6, Paseo ×2 | Elegir cabeza + canonical | GA4 (traen tráfico finde) + GSC |

**Sin datos externos hoy:** se ejecuta solo lo no destructivo — enlazado interno (rescate de huérfanas), regeneración de `related-auto.json`, y ampliación de las maestras. Todo lo de la tabla espera GA4/GSC.
