# GSC Recovery Watchlist — julio 2026

Seguimiento post-deploy del plan de recuperación SEO (rama `seo-recovery-gsc-july-2026`).
Baseline = datos GSC del informe de julio 2026 (período post-caída del 28-abr).
Medir cada 48/72 hs: impresiones, CTR, posición, duplicados HTTP restantes.

**Protocolo post-deploy:**
1. Enviar sitemap actualizado en GSC (`https://hacecuentas.com/sitemap.xml`).
2. Pedir indexación manual SOLO de las 15 URLs marcadas ⭐ (no miles).
3. Esperar el delay normal de GSC (2-3 días de lag).
4. Completar la columna Estado en cada revisión.

| URL | Acción hecha | Fecha deploy | Impresiones antes | CTR antes | Posición antes | Estado |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| ⭐ /calculadora-conversor-metros-lineales-a-metros-cuadrados | fix relatedSlugs auto-referencial + ejemplos por material + tabla + cluster | | 1.647 | 0,24% | 8,16 | pendiente |
| ⭐ /dias-entre-dos-fechas | related curados (hábiles/feriados) + FAQ + convención día inicial | | 926 | 0,32% | 10,43 | pendiente |
| ⭐ /calculadora-edad-humana-conejo-anos | explanation expandida + tabla equivalencia + FAQ 10 + cluster mascotas | | 690 | 0,00% | 8,24 | pendiente |
| ⭐ /calculadora-edad-exacta | related + FAQ topup | | 682 | 0,59% | 9,23 | pendiente |
| ⭐ /calculadora-calorias-quemadas-deporte | disclaimer YMYL + related 6 + cluster fitness | | 588 | 0,17% | 9,76 | pendiente |
| ⭐ /calculadora-pace-ritmo-running | related 6 + cluster running | | 506 | 0,59% | 9,51 | pendiente |
| ⭐ /sueldo-en-mano-argentina | ya optimizada (7-05); en sitemap-priority + cluster sueldo | | 489 | 0,82% | 11,28 | pendiente |
| ⭐ /calculadora-tiempo-lectura-paginas-estudio (alias GSC: -libro-paginas) | title/desc CTR + FAQ + cluster estudio + fix slug muerto en sitemap | | 456 | 0,00% | 8,28 | pendiente |
| ⭐ /calculadora-costo-m2-construccion-argentina | cluster construcción + verificación (ya refreshed 7-02) | | 419 | 0,00% | 8,31 | pendiente |
| ⭐ /calculadora-estimador-costo-viaje-taxi-remis | cluster viaje + FAQ | | 378 | 1,85% | 12,46 | pendiente |
| ⭐ /simulador-jubilacion-anses | contenido YMYL: escenarios + fuentes ANSES/Ley 24.241 + disclaimer + metodología + dateModified (thin→~900 palabras) | | 154 | 5,8% (9 clicks) | 12,98 | pendiente |
| ⭐ /calculadora-comision-venta-vendedor (canonical de las 2 URLs Mercado Libre de GSC) | sección ML + tabla ejemplo + 4 FAQ ML + fuente oficial | | — | — | — | pendiente |
| ⭐ /calculadora-costo-viaje-combustible-kilometros (canonical de /calculadora-combustible-viaje-auto) | en sitemap-priority (antes entraba el alias no-canónico) + FAQ | | — | — | — | pendiente |
| ⭐ /calculadora-costo-por-kilometro-auto | title CTR plan + related verificados | | — | — | — | pendiente |
| ⭐ /calculadora-patente-auto-provincia | title/desc CTR + duplicado HTTP verificado OK | | — | — | — | pendiente |
| /calculadora-aguinaldo-sac | verificada (16 FAQ, 4 fuentes) — sin cambios grandes | | — | — | — | pendiente |
| /calculadora-cuota-prestamo | related 6 + cluster crédito | | — | — | — | pendiente |
| /calculadora-porcentajes | cluster porcentajes (antes sin cluster) | | — | — | — | pendiente |
| /calculadora-sueldo-por-hora | cluster sueldo | | — | — | — | pendiente |
| /calculadora-duracion-bateria-mah-consumo | related 6 + cluster tech | | — | — | — | pendiente |
| /calculadora-video-bitrate-tamano-archivo | FAQ 9 + related 6 + cluster tech | | — | — | — | pendiente |
| /calculadora-twitter-x-monetizacion-ingreso | FAQ 9 + related 6 + cluster engagement | | — | — | — | pendiente |
| /calculadora-palabras-paginas-conversor | related 6 + cluster estudio | | — | — | — | pendiente |
| /calculadora-indice-asistencia-faltas | related 6 + cluster notas | | — | — | — | pendiente |
| /calculadora-millas-latam-destino | FAQ 9 | | — | — | — | pendiente |
| /calculadora-bebidas-evento-litros-por-persona | related verificados + cluster eventos | | — | — | — | pendiente |
| /calculadora-tejas-techo-m2 | cluster construcción | | — | — | — | pendiente |
| /calculadora-sellos-compra-inmueble-caba-pba (canonical del alias impuesto-sellos de GSC) | cluster hipoteca | | — | — | — | pendiente |
| /calculadora-propina-por-pais-viaje | desc 87→150ch + related 6 + cluster viaje | | — | — | — | pendiente |
| /calculadora-consumo-electrico-aparato-kwh-mes | FAQ 9 + related 6 + cluster ahorro | | — | — | — | pendiente |
| /calculadora-split-gastos-grupo-amigos (canonical de dividir-gastos-viaje-amigos) | FAQ 9 + related 6 + cluster viaje | | — | — | — | pendiente |
| /calculadora-conversion-medidas-cocina-tazas-gramos (canonical de conversor-tazas-gramos) | verificada — ya fuerte | | — | — | — | pendiente |
| /calculadora-seguro-auto-estimado (canonical del alias seguro-auto-estimacion-precio) | fix slug muerto en cluster costosAuto + related 6 | | — | — | — | pendiente |

## Duplicados HTTP/HTTPS de GSC (verificados 2026-07-06 pre-deploy)

Las 16 URLs reportadas por GSC con versión HTTP: **todas responden `http → 301 → https` y `https → 200`**
(la capa Cloudflare ya lo maneja; el reporte de GSC es histórico). `www` resuelve al apex en 301.
Re-verificar post-deploy con: `npm run seo:audit` (columna `has_http_duplicate`).

## Qué mirar en cada revisión (48/72 hs)

- Impresiones y posición de las ⭐ (el objetivo: que bajen de posición ~10 a página 1 → ahí arrancan los clicks).
- CTR de metros-lineales, edad-conejo, tiempo-lectura y costo-m2 (hoy ~0% — cualquier click es señal).
- Coverage GSC: que los aliases 301 salgan de "Duplicada" y consoliden en su canonical.
- No pedir indexación masiva; no crear páginas nuevas hasta cerrar este ciclo (Fase 13 del plan).
