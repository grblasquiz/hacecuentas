# Aged Domain Research — Plan B SEO Migration

**Fecha:** 2026-05-26
**Status:** Research preliminar SIN COMPROMISO. No comprar nada.
**Trigger de activación:** Si D60 (29-jun-2026) no muestra recovery >20% vs baseline.

---

## TL;DR

1. **Cero candidatos accionables hoy sin acceso paid.** Los listings reales (con DR/TF/CF + Wayback completo) viven detrás de logins en GoDaddy Auctions, NameJet, SpamZilla. ExpiredDomains.net muestra navegación pero los filtros utiles requieren cuenta.
2. **Petkeen→Pangovet (el caso de referencia del playbook) terminó mal:** subió de 0 a 500k visitas en 12 días post-301, pero colapsó a ~200k en el siguiente mes y siguió bajando. NO es un éxito sostenido. Replantearse Plan B como hipótesis débil.
3. **Si se decide ejecutar en D60, el path real es:** pagar $37 SpamZilla 1 mes ($37) + Ahrefs trial → shortlist 10 candidatos → vetting riguroso → 1 compra GoDaddy/NameJet. Budget total realista: **$1.500-3.500 USD** (dominio + setup + 3 meses tooling).

---

## Sección 1 — Plataformas evaluadas

| Plataforma | Acceso | Filtros útiles | Accionable sin paid | Veredicto |
|---|---|---|---|---|
| **ExpiredDomains.net** | Free signup obligatorio para filtros | TLD, age, dictionary, Wayback (WBY/ABY), nameserver | Navegación sí, listings no | Punto de partida obligado. Free tier alcanza. |
| **GoDaddy Auctions** | $4.99/año membership para bidear | Keyword, TLD, price, traffic, age, backlinks | Browse público sí (limitado), bid no | El mayor pool global. Si se compra, acá. |
| **NameJet / SnapNames** | Free signup, inventario compartido desde 2020 | Premium expired, network solutions legacy | Listings públicos sí | Mejor para .com legacy (registrados pre-2005). |
| **SpamZilla** | $37/mes | SpamZilla Score, Wayback exports, backlinks miner, 70+ métricas, 350k dominios/día | NO sin login | **Tool más eficiente para vetting masivo.** 1 mes alcanza para shortlist. |
| **DomCop** | $49-149/mes | 10M dominios, Majestic + Moz, power lists | NO sin login | Más caro, menos spam detection. Skip. |
| **Park.io** | Free browse | Niche TLDs (.io, .ai), no es marketplace tradicional | Limitado | Irrelevante para nuestro caso (queremos .com/.com.ar). |

**Plataformas accionables sin paid hoy:** ExpiredDomains.net (browse + free filtros) + NameJet (browse).
**Plataforma única para vetting profundo si se ejecuta:** SpamZilla ($37 una vez) + Ahrefs trial (7 días gratis si nunca se usó la cuenta) + Wayback Machine (free).

---

## Sección 2 — Candidatos identificados

**Honestidad operativa:** las plataformas accesibles sin login NO exponen DR/TF/CF de dominios individuales. Sin pagar $37 SpamZilla o conseguir un Ahrefs trial, no puedo darte 3 candidatos con métricas verificadas. Lo que sigue son **vectores de búsqueda**, no candidatos validados:

### Vector A — Dominios financieros AR históricos
**Búsqueda recomendada en SpamZilla cuando se ejecute:**
- TLD: `.com.ar`, `.com` con redirect histórico desde .ar
- Keywords whois/wayback: `prestamo`, `credito`, `cuotas`, `interes`, `inflacion`, `calculadora`, `sueldo`, `aguinaldo`, `ganancias`
- Filtros: DR 30+, Age 10+, TF/CF ratio ≥ 0.4, sin keywords spam (`casino`, `loan`, `pharmacy`, `bitcoin`, `viagra`)
- Edad target: registrado pre-2014 (12+ años)

**Probabilidad de match real:** baja-media. El .com.ar tiene menos churn que .com porque NIC.ar suele renovar automáticamente con débito. Los buenos dominios AR financieros raramente expiran limpios.

### Vector B — Dominios calc/utility en español (LatAm/ES)
**Búsqueda:**
- TLD: `.com` con history en español detectable vía Wayback
- Keywords: `calc`, `calculadora`, `simulador`, `convertidor`, `cuanto`
- Age 8+, DR 25+, anchor text natural

**Probabilidad de match real:** media. Hay más rotación en .com genérico hispano. Riesgo principal: muchos fueron tools comerciales que pivotearon a casino/préstamos online (las "calculadoras de préstamo" son un patrón clásico de spam SEO).

### Vector C — Dominios EN financieros con audiencia AR detectable
**Búsqueda:**
- TLD: `.com`
- Keywords: `calculator`, `tax`, `salary`, `loan`, `interest`
- Filtro adicional: traffic histórico con país AR/ES en top-10 (Wayback + Ahrefs)
- Age 12+, DR 35+

**Probabilidad de match real:** media-alta para .com, baja para AR-relevance. Si se pivotea, hace falta rewrite total de contenido EN→ES.

**Conclusión sección 2:** sin acceso paid no puedo entregar 3 dominios con nombre, precio y métricas. La acción concreta si Martin decide avanzar en D60 es pagar $37 SpamZilla por 1 mes y hacer el filtrado real. Cualquier candidato que reporte hoy sería especulación.

---

## Sección 3 — Proceso de vetting documentado

Para cada candidato shortlisted (no comprar sin completar TODOS los pasos):

### Paso 1 — Whois history
- Buscar en `whoisxmlapi.com` o `whoxy.com` historial de owners.
- Red flag: >5 cambios de owner en 5 años, owners con dominios spam asociados.

### Paso 2 — Wayback Machine (free)
- URL: `https://web.archive.org/web/*/dominio.com`
- Revisar 10-15 snapshots distribuidos en los años de vida.
- Buscar: pivotes a casino/farmacia/MLM, "site error", páginas en chino/ruso, redirects raros.
- Red flag absoluto: cualquier período con contenido casino/loan/adult.

### Paso 3 — Ahrefs (trial o cuenta existente)
- Métricas mínimas: DR ≥ 30, Referring Domains ≥ 50 (no solo DR alto con pocos RDs).
- Anchor text cloud: tiene que verse natural. Si "buy cheap X" o keywords idiomas raros dominan → descartar.
- Backlinks timeline: gradual u orgánico. Spikes verticales = negative SEO o PBN.

### Paso 4 — Majestic TF/CF
- Trust Flow ÷ Citation Flow ≥ 0.4 (target: ≥ 0.5).
- Topical Trust Flow tiene que incluir Finance/Business/Computers, NO Adult/Gambling.

### Paso 5 — Google indexation check
- Search: `site:dominio.com` en Google.
- 0 resultados = deindexed = penalty histórico. **Descartar siempre.**
- <5 resultados con páginas raras = sandbox o parking penalty.

### Paso 6 — Manual backlinks audit
- Top 20 referring domains de Ahrefs → visitar cada uno.
- Confirmar que el link sigue vivo (no en cache).
- Confirmar que el linker NO es PBN evidente (footer links genéricos, mismo template, etc.).

### Paso 7 — SpamZilla Score (si se pagó el mes)
- Score ≤ 30/100 = aceptable.
- Score > 50 = spam history detectado, descartar.

**Si cualquier paso falla → descartar candidato. NO negociar.** Aged domains son irrecuperables una vez compradas con history sucio.

---

## Sección 4 — Case studies recientes

### Petkeen → Pangovet (el referente del playbook)
- **Setup:** Petkeen.com cayó de 8M a 2k visitas post-HCU. Compraron pangovet.com, migraron contenido + 301.
- **29-jun-2024:** 0 tráfico nuevo dominio.
- **+12 días:** 500k visitas (SEMrush).
- **+30 días:** caída a ~200k.
- **2026 update:** sigue erosionando. NO es un éxito sostenido. El "rebound" inicial fue Google testing el redirect; el algoritmo después aplicó el mismo flag al nuevo dominio.
- **Lección:** 301 de site HCU-penalizado puede transferir la penalty. Veredicto del playbook ("Plan B carga spam history oculto") aplica también al sentido inverso: el penalty se hereda.

### Caso 302 redirect (RankingHacks 2025)
- Sitio anónimo, -95% post-HCU. Aplicaron 302 (no 301) hacia dominio temporal, 3 días antes Google revirtió oficialmente HCU.
- **Recovery 100% tráfico.** Pero correlación ≠ causalidad: el revert oficial sucedió en paralelo.
- No replicable como estrategia confiable.

### Casos automotive niche + multi-site (SeoProfy / Dorve)
- Recoveries SIN migration. Restructuring + de-indexing low-value + technical cleanup.
- Coincide con el approach actual de hacecuentas (pruning + E-E-A-T + technical).
- **Lección:** la mayoría de recoveries documentadas en 2025 NO involucran aged domain swap. El Plan A (mejorar lo que tenés) tiene más casos exitosos que el Plan B.

### June 2025 Core Update — partial HCU recoveries
- Google rolló update 30-jun-2025 con recoveries parciales detectadas en sites HCU-hit de sept-2023.
- 8+ meses post-hit para empezar a ver señales. Confirma timeline largo de Martin: D60 es muy temprano para conclusiones definitivas.

---

## Sección 5 — Recomendación final + costo estimado

**Costo total si se ejecuta Plan B (escenario realista):**

| Item | USD |
|---|---|
| SpamZilla 1 mes (vetting tool) | $37 |
| Ahrefs (trial 7 días gratis, o $129 si ya se gastó el trial) | $0-129 |
| Compra dominio (rango DR 30-40, 10-12 años) | $800-2.000 |
| Transfer fees + privacy WHOIS | $30 |
| Migration setup (DNS, SSL, hreflang, redirects, sitemap) — 40-60h propias | "tiempo, no plata" |
| Buffer error: 2do dominio si el 1ro falla vetting post-compra | +$1.000 |
| **Total realista** | **$1.870-3.200 USD** |

**Costo si NO se ejecuta:** $0. Research hoy es informativa.

**Recomendación operativa:**
- **NO ejecutar Plan B hoy ni en D60 si recovery >0%.** El caso Pangovet muestra que la penalty puede heredarse. No es un Plan B seguro, es una apuesta cara.
- **Si recovery sigue en -94% post D90 (28-jul-2026):** considerar Plan B serio, pero invertir primero los $37 SpamZilla y dedicar 1 semana al vetting masivo. Sin shortcut.
- **Mientras tanto:** seguir Plan A (E-E-A-T author, pruning, content quality). Los casos exitosos 2025 son todos Plan A.

---

## Sección 6 — Decisión sugerida para Martin

### Escenario 1: D60 (29-jun-2026) muestra recovery >20% vs baseline (clicks/día > 5)
- **Acción:** archivar este doc, seguir Plan A. Plan B queda dormido.
- **Re-evaluar:** D90.

### Escenario 2: D60 muestra recovery 0-20% (señales mixtas)
- **Acción:** NO comprar dominio todavía. Pagar $37 SpamZilla, hacer shortlist de 10 candidatos con vetting completo. Tener lista pronta.
- **Re-evaluar:** D90 con shortlist en mano.

### Escenario 3: D60 confirma migración (recovery <0% o sigue erosionando)
- **Acción:**
  1. Semana 1: SpamZilla $37 + vetting 10 candidatos vector A+B.
  2. Semana 2: short list a 3, manual deep vetting (todos los 7 pasos sección 3).
  3. Semana 3: compra del #1. Si vetting post-compra falla, ir al #2.
  4. Semana 4-8: setup migration (hreflang AR-first, 301 mapeo 1:1 calc-por-calc, sitemap, GSC change of address).
- **Budget cap:** $3.500 USD. Si excede, parar.
- **Hard stop:** si después de 3 meses post-migration el nuevo dominio también pierde tráfico → Plan B falló, volver a Plan A o aceptar el sunset.

### Lo que NO hacer
- Comprar dominio sin completar los 7 pasos de vetting.
- Migrar sin mantener hacecuentas.com vivo en paralelo 90 días mínimo (rollback option).
- Asumir que 301 limpia HCU penalty. El caso Pangovet dice lo contrario.

---

**Reporte final:**
- **Candidatos que cumplen filtros estrictos hoy:** 0 verificables sin acceso paid.
- **Plataformas más útiles:** ExpiredDomains.net (browse free), SpamZilla (vetting si se ejecuta), GoDaddy Auctions (compra final).
- **Hallazgo crítico:** Pangovet recovery se reportó como caso de éxito en la prensa SEO de jul-2024 pero erosionó dramáticamente en agosto+. El Plan B del playbook está sostenido por un caso que ya no funciona. Reconsiderar.
