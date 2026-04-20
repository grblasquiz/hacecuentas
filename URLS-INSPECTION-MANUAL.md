# URLs para "Solicitar indexación" manual en Google Search Console

**Contexto:** 1170 URLs están "Descubiertas - actualmente sin indexar". Google conoce estas URLs pero no les asignó crawl budget. Haciendo URL Inspection + "Solicitar indexación" manualmente forzás un crawl prioritario.

**Límite:** ~10 URLs por día por propiedad en GSC. Dividir en 3-4 días.

**Cómo:** GSC → Inspección de URLs → pegar URL → Solicitar indexación → esperar 30-90 segundos → siguiente.

---

## Día 1 (10 URLs) — Hubs críticos

1. `https://hacecuentas.com/`
2. `https://hacecuentas.com/guias`
3. `https://hacecuentas.com/presupuesto-familiar`
4. `https://hacecuentas.com/simulador-jubilacion-anses`
5. `https://hacecuentas.com/cambio-de-monedas`
6. `https://hacecuentas.com/cotizacion-cripto`
7. `https://hacecuentas.com/inflacion-argentina`
8. `https://hacecuentas.com/comparador-plazo-fijo`
9. `https://hacecuentas.com/valores-bcra`
10. `https://hacecuentas.com/buscar`

## Día 2 (10 URLs) — 10 guías pilares

1. `https://hacecuentas.com/guia/finanzas-personales`
2. `https://hacecuentas.com/guia/sueldos-argentina-2026`
3. `https://hacecuentas.com/guia/impuestos-argentina-2026`
4. `https://hacecuentas.com/guia/subsidios-anses-2026`
5. `https://hacecuentas.com/guia/salud-nutricion-fitness`
6. `https://hacecuentas.com/guia/embarazo-y-bebe`
7. `https://hacecuentas.com/guia/construccion-diy-hogar`
8. `https://hacecuentas.com/guia/matematicas-ciencias`
9. `https://hacecuentas.com/guia/productividad-aprendizaje`
10. `https://hacecuentas.com/guia/cocina-medidas-recetas`

## Día 3 (10 URLs) — Categorías descubiertas no indexadas

Las 18 categorías del Excel de coverage. Elegí las 10 más importantes:

1. `https://hacecuentas.com/categoria/finanzas`
2. `https://hacecuentas.com/categoria/salud`
3. `https://hacecuentas.com/categoria/vida`
4. `https://hacecuentas.com/categoria/educacion`
5. `https://hacecuentas.com/categoria/cocina`
6. `https://hacecuentas.com/categoria/construccion`
7. `https://hacecuentas.com/categoria/deportes`
8. `https://hacecuentas.com/categoria/matematica`
9. `https://hacecuentas.com/categoria/tecnologia`
10. `https://hacecuentas.com/categoria/viajes`

## Día 4 (10 URLs) — Calcs top que deberían posicionar ya

1. `https://hacecuentas.com/sueldo-en-mano-argentina`
2. `https://hacecuentas.com/calculadora-aguinaldo-sac`
3. `https://hacecuentas.com/calculadora-indemnizacion-despido`
4. `https://hacecuentas.com/calculadora-imc`
5. `https://hacecuentas.com/calculadora-monotributo-2026`
6. `https://hacecuentas.com/calculadora-plazo-fijo`
7. `https://hacecuentas.com/calculadora-cuota-prestamo`
8. `https://hacecuentas.com/calculadora-interes-compuesto`
9. `https://hacecuentas.com/calculadora-embarazo`
10. `https://hacecuentas.com/calculadora-calorias-diarias-tdee`

## Día 5+ — Categorías restantes + resto

- `https://hacecuentas.com/categoria/mascotas`
- `https://hacecuentas.com/categoria/automotor`
- `https://hacecuentas.com/categoria/negocios`
- `https://hacecuentas.com/categoria/marketing`
- `https://hacecuentas.com/categoria/ciencia`
- `https://hacecuentas.com/categoria/electronica`
- `https://hacecuentas.com/categoria/entretenimiento`
- `https://hacecuentas.com/categoria/medio-ambiente`
- más calcs top del Excel Coverage Drilldown

---

## Bonus: otras acciones paralelas que ya hice

- ✅ Sitemap `sitemap-priority.xml` con 71 URLs top (Google lo lee primero)
- ✅ Lastmod real por calc (no el global de build)
- ✅ IndexNow setup (Bing + Yandex) → `/79ef29dd0b79075ac90d508e94114642.txt`
- ✅ GitHub Action que pushea IndexNow después de cada deploy
- ✅ Redirect 301 `/categoria/auto` → `/categoria/automotor` (link roto descubierto)
- ✅ Interlinking pirámide: home → guías → categorías → calcs (commit 071b280)
