# Rollover 2026 → 2027 — Dry run

Generado: 2026-07-11 · `node scripts/rollover-year.mjs --dry --target-year=2027`

> Snapshot del árbol de trabajo al momento de correr el script. Si hay sesiones/crons tocando el repo en paralelo, los conteos pueden variar ±unos pocos entre corridas: re-generar antes de ejecutar la migración.

## Resumen

| Clase | Qué es | Ocurrencias | Archivos | Acción |
|---|---|---:|---:|---|
| **A** | Constantes de año calendario auto-bumpeables | 15 | 13 | `--apply --class=A` (mecánico) |
| **B** | Archivos con 2026 en el nombre (slugs/páginas/fórmulas) | 592 | 592 | Migración SEO por patrón (ver tabla) |
| **C** | Datos fiscales / data anual / dependencias | 1599 | 497 | Manual + pipeline update-data al publicarse valores 2027 |
| **FECHA** | Fechas puntuales en código (`new Date(2026,…)`, ISO) | 371 | 60 | Revisión por calendario (no adelantar fechas no pasadas) |
| **TEXTO** | Prosa/FAQ/títulos/comentarios con el año | 18763 | 3362 | Revisión editorial |
| **REVIEW** | Código con año sin patrón conocido | 13 | 9 | Revisión manual |

Ignorados por heurísticas anti-falso-positivo: **165** años en URLs/citas de fuentes · **10666** fechas de dato (lastReviewed/dataUpdate/sources/DATA_AS_OF) · **33** archivos generados/data viva excluidos (related-auto*, hreflang-index, headers AUTOGENERADO, src/data/live).

## CLASE A — auto-bumpeables (15 ocurrencias, 13 archivos)

Constantes de año calendario: bump 2026→2027 mecánicamente correcto. Aplicar con `node scripts/rollover-year.mjs --apply --class=A` (imprime diff y deja backup en tmp). **Después del apply: bumpear `lastReviewed` en el JSON de cada calc afectado** (CLAUDE.md §2: si tocás la fórmula, tocá el calc).

### src/lib/formulas/aposentadoria-inss-idade-progressiva.ts

> ⚠ mismo archivo tiene además: 1 C — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L33 · fallback-año-actual (ano)
  - `- const ano = Number(i.anoSimulacao) || 2026;`
  - `+ const ano = Number(i.anoSimulacao) || 2027;`

### src/lib/formulas/aposentadoria-inss-pontos.ts

> ⚠ mismo archivo tiene además: 1 C — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L36 · fallback-año-actual (ano)
  - `- const ano = Number(i.anoSimulacao) || 2026;`
  - `+ const ano = Number(i.anoSimulacao) || 2027;`

### src/lib/formulas/biodegradacion-tiempo-materiales.ts

- L27 · const-año (anioFuturo)
  - `- const anioFuturo = 2026 + mat.anios;`
  - `+ const anioFuturo = 2027 + mat.anios;`

### src/lib/formulas/calculadora-que-generacion-sos.ts

> ⚠ mismo archivo tiene además: 6 TEXTO — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L20 · const-año (ANIO_ACTUAL)
  - `- const ANIO_ACTUAL = 2026;`
  - `+ const ANIO_ACTUAL = 2027;`

### src/lib/formulas/cuando-es-el-dia-del-padre-madre-nino-por-pais.ts

> ⚠ mismo archivo tiene además: 1 FECHA, 5 TEXTO — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L34 · const-año (ANIO)
  - `- const ANIO = 2026;`
  - `+ const ANIO = 2027;`

### src/lib/formulas/dolar-real-iof-remessa.ts

> ⚠ mismo archivo tiene además: 3 TEXTO — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L39 · fallback-año-actual (ano)
  - `- const ano = Number(i.anoRemessa ?? 2026) || 2026;`
  - `+ const ano = Number(i.anoRemessa ?? 2027) || 2026;`
- L39 · fallback-año-actual (ano)
  - `- const ano = Number(i.anoRemessa ?? 2026) || 2026;`
  - `+ const ano = Number(i.anoRemessa ?? 2026) || 2027;`

### src/lib/formulas/etiqueta-dgt-coche-espana-eco-cero-b-c.ts

> ⚠ mismo archivo tiene además: 1 FECHA, 7 TEXTO — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L19 · aritmética-de-año (edad/proyección)
  - `- if (!i.combustible || i.ano_matricula < 1990 || i.ano_matricula > 2026) {`
  - `+ if (!i.combustible || i.ano_matricula < 1990 || i.ano_matricula > 2027) {`

### src/lib/formulas/euro-real-viagem.ts

> ⚠ mismo archivo tiene además: 1 TEXTO — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L42 · fallback-año-actual (ano)
  - `- const ano = Number(i.anoViagem ?? 2026) || 2026;`
  - `+ const ano = Number(i.anoViagem ?? 2027) || 2026;`
- L42 · fallback-año-actual (ano)
  - `- const ano = Number(i.anoViagem ?? 2026) || 2026;`
  - `+ const ano = Number(i.anoViagem ?? 2026) || 2027;`

### src/lib/formulas/generacion-perteneces.ts

> ⚠ mismo archivo tiene además: 1 REVIEW, 2 TEXTO — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L34 · aritmética-de-año (edad/proyección)
  - `- if (!anio || anio < 1928 || anio > 2026) throw new Error('Ingresá un año entre 1928 y 2026');`
  - `+ if (!anio || anio < 1928 || anio > 2027) throw new Error('Ingresá un año entre 1928 y 2026');`

### src/lib/formulas/impuesto-departamento-loterias-vehiculos-cigarrillos.ts

> ⚠ mismo archivo tiene además: 2 TEXTO — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L203 · const-año (antigueadad)
  - `- const antigueadad = 2026 - year;`
  - `+ const antigueadad = 2027 - year;`

### src/lib/formulas/patente-vehiculo-paraguay.ts

> ⚠ mismo archivo tiene además: 1 C, 2 TEXTO — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L33 · const-año (ANIO_ACTUAL)
  - `- const ANIO_ACTUAL = 2026;`
  - `+ const ANIO_ACTUAL = 2027;`

### src/lib/formulas/revision-tecnica-chile-precio-vencimiento.ts

> ⚠ mismo archivo tiene además: 1 TEXTO — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L24 · const-año (anoActual)
  - `- const anoActual = 2026;`
  - `+ const anoActual = 2027;`

### src/lib/formulas/semanas-imss-faltantes.ts

> ⚠ mismo archivo tiene además: 1 REVIEW, 2 TEXTO — revisar consistencia tras el bump (ej: mensajes de error o data que mencionan 2026).
- L55 · const-año (anioBase)
  - `- const anioBase = 2026;`
  - `+ const anioBase = 2027;`

## CLASE B — archivos con 2026 en el nombre (592)

Inventario con estrategia SEO recomendada. NO se migra automáticamente. Regla de oro (CLAUDE.md §1): nunca borrar un slug sin 301.

### calc-fiscal-anual (243)

> Crear slug-2027 nuevo cuando salgan los valores 2027 + 301 viejo→nuevo vía src/lib/pruning-redirects.ts (NO public/_redirects: límite 2000 de CF, hoy ~1.830 reglas). Después: npm run related + build.

- `src/content/calcs-cl/calculadora-afp-pension-chile-2026-tabla-comisiones.json` (21 × 2026 adentro)
- `src/content/calcs-cl/calculadora-asignacion-familiar-chile-2026-tramos-renta.json` (22 × 2026 adentro)
- `src/content/calcs-cl/calculadora-becas-junaeb-chile-cuantia-requisitos-2026.json` (32 × 2026 adentro)
- `src/content/calcs-cl/calculadora-cae-credito-hipotecario-chile-bancos-2026.json` (25 × 2026 adentro)
- `src/content/calcs-cl/calculadora-canasta-basica-mensual-chile-ine-2026.json` (32 × 2026 adentro)
- `src/content/calcs-cl/calculadora-coste-funeral-promedio-chile-2026-cremacion-sepelio.json` (22 × 2026 adentro)
- `src/content/calcs-cl/calculadora-credito-hipotecario-chile-uf-cmf-2026.json` (28 × 2026 adentro)
- `src/content/calcs-cl/calculadora-cripto-chile-impuestos-trader-2026-sii.json` (21 × 2026 adentro)
- `src/content/calcs-cl/calculadora-deposito-plazo-chile-bancos-2026-tasa.json` (25 × 2026 adentro)
- `src/content/calcs-cl/calculadora-fondos-mutuos-chile-rentabilidad-comparativa-2026.json` (24 × 2026 adentro)
- `src/content/calcs-cl/calculadora-impuesto-primera-categoria-chile-empresas-2026.json` (26 × 2026 adentro)
- `src/content/calcs-cl/calculadora-impuesto-renta-segunda-categoria-chile-2026-tabla.json` (31 × 2026 adentro)
- `src/content/calcs-cl/calculadora-multa-no-aviso-uoct-transito-comuna-chile-2026.json` (31 × 2026 adentro)
- `src/content/calcs-cl/calculadora-pase-escolar-tne-chile-precio-2026-recargo.json` (24 × 2026 adentro)
- `src/content/calcs-cl/calculadora-pension-jubilacion-chile-edad-aportes-2026.json` (28 × 2026 adentro)
- `src/content/calcs-cl/calculadora-permiso-circulacion-chile-vehiculo-2026-comuna.json` (21 × 2026 adentro)
- `src/content/calcs-cl/calculadora-saldo-afp-rentabilidad-multifondos-chile-2026.json` (24 × 2026 adentro)
- `src/content/calcs-cl/calculadora-seguro-auto-chile-todo-riesgo-comparador-2026.json` (24 × 2026 adentro)
- `src/content/calcs-cl/calculadora-soap-seguro-obligatorio-chile-precio-2026.json` (32 × 2026 adentro)
- `src/content/calcs-cl/calculadora-sueldo-liquido-chile-2026-impuesto-segunda-categoria.json` (44 × 2026 adentro)
- `src/content/calcs-cl/calculadora-tope-imponible-cotizaciones-chile-2026.json` (35 × 2026 adentro)
- `src/content/calcs-cl/calculadora-uf-uta-utm-chile-conversion-pesos-2026.json` (36 × 2026 adentro)
- `src/content/calcs-co/calculadora-ahorros-en-dolares-colombia-bancos-internacionales-2026.json` (24 × 2026 adentro)
- `src/content/calcs-co/calculadora-anticipo-impuesto-renta-colombia-2026.json` (18 × 2026 adentro)
- `src/content/calcs-co/calculadora-aporte-caja-compensacion-colombia-2026-subsidio-familiar.json` (19 × 2026 adentro)
- `src/content/calcs-co/calculadora-aporte-eps-pension-empleado-colombia-2026.json` (20 × 2026 adentro)
- `src/content/calcs-co/calculadora-aumento-salario-2026-colombia-cuanto-subio-mi-sueldo.json` (25 × 2026 adentro)
- `src/content/calcs-co/calculadora-auxilio-transporte-colombia-2026.json` (48 × 2026 adentro)
- `src/content/calcs-co/calculadora-becas-icetex-colombia-credito-monto-2026.json` (17 × 2026 adentro)
- `src/content/calcs-co/calculadora-comparador-tarjeta-debito-colombia-2026-comisiones.json` (18 × 2026 adentro)
- `src/content/calcs-co/calculadora-comparativa-banco-comisiones-colombia-2026.json` (19 × 2026 adentro)
- `src/content/calcs-co/calculadora-comparendos-transito-colombia-2026.json` (46 × 2026 adentro)
- `src/content/calcs-co/calculadora-conversion-uvt-uvr-colombia-actualizacion-2026.json` (43 × 2026 adentro)
- `src/content/calcs-co/calculadora-coste-funeral-promedio-colombia-2026-paquetes.json` (24 × 2026 adentro)
- `src/content/calcs-co/calculadora-costo-despido-empleador-colombia-2026.json` (30 × 2026 adentro)
- `src/content/calcs-co/calculadora-costo-hora-empleado-empresa-colombia-2026.json` (27 × 2026 adentro)
- `src/content/calcs-co/calculadora-costo-total-empleado-empleador-colombia-2026.json` (40 × 2026 adentro)
- `src/content/calcs-co/calculadora-credito-educativo-icetex-vs-banco-colombia-2026.json` (22 × 2026 adentro)
- `src/content/calcs-co/calculadora-credito-hipotecario-colombia-2026-uvr-pesos.json` (28 × 2026 adentro)
- `src/content/calcs-co/calculadora-cripto-colombia-impuestos-renta-trader-2026.json` (24 × 2026 adentro)
- `src/content/calcs-co/calculadora-deduccion-dependientes-colombia-renta-2026.json` (31 × 2026 adentro)
- `src/content/calcs-co/calculadora-dotacion-laboral-colombia-2026.json` (31 × 2026 adentro)
- `src/content/calcs-co/calculadora-empleada-domestica-dias-colombia-2026.json` (49 × 2026 adentro)
- `src/content/calcs-co/calculadora-ganancia-repartidor-apps-colombia-2026.json` (59 × 2026 adentro)
- `src/content/calcs-co/calculadora-gastos-notariales-registro-compraventa-2026.json` (51 × 2026 adentro)
- `src/content/calcs-co/calculadora-horas-extras-colombia-2026.json` (75 × 2026 adentro)
- `src/content/calcs-co/calculadora-ibc-independientes-contratista-colombia-2026-40-porciento.json` (25 × 2026 adentro)
- `src/content/calcs-co/calculadora-impoconsumo-restaurantes-bares-colombia-2026.json` (13 × 2026 adentro)
- `src/content/calcs-co/calculadora-impuesto-cervezas-licores-tabaco-colombia-2026.json` (26 × 2026 adentro)
- `src/content/calcs-co/calculadora-impuesto-loterias-juegos-azar-colombia-2026.json` (35 × 2026 adentro)
- `src/content/calcs-co/calculadora-impuesto-patrimonio-colombia-personas-naturales-2026.json` (40 × 2026 adentro)
- `src/content/calcs-co/calculadora-impuesto-predial-bogota-2026.json` (70 × 2026 adentro)
- `src/content/calcs-co/calculadora-impuesto-renta-empresas-colombia-35-porcentaje-2026.json` (19 × 2026 adentro)
- `src/content/calcs-co/calculadora-impuesto-sucesiones-herencia-colombia-2026.json` (25 × 2026 adentro)
- `src/content/calcs-co/calculadora-impuesto-timbre-nacional-colombia-2026.json` (34 × 2026 adentro)
- `src/content/calcs-co/calculadora-impuesto-vehiculos-bogota-2026-tabla.json` (29 × 2026 adentro)
- `src/content/calcs-co/calculadora-impuesto-vehiculos-colombia-2026-departamento.json` (26 × 2026 adentro)
- `src/content/calcs-co/calculadora-indemnizacion-despido-sin-justa-causa-colombia-2026.json` (23 × 2026 adentro)
- `src/content/calcs-co/calculadora-interes-mora-dian-colombia-2026.json` (50 × 2026 adentro)
- `src/content/calcs-co/calculadora-iva-bienes-exentos-excluidos-colombia-2026.json` (16 × 2026 adentro)
- `src/content/calcs-co/calculadora-liquidacion-contrato-termino-fijo-colombia-2026.json` (28 × 2026 adentro)
- `src/content/calcs-co/calculadora-liquidacion-empleada-domestica-por-dias-colombia-2026.json` (38 × 2026 adentro)
- `src/content/calcs-co/calculadora-obligado-declarar-renta-2026.json` (50 × 2026 adentro)
- `src/content/calcs-co/calculadora-pension-colombia-2026-edad-semanas-cotizadas.json` (33 × 2026 adentro)
- `src/content/calcs-co/calculadora-pila-independientes-colombia-2026.json` (31 × 2026 adentro)
- `src/content/calcs-co/calculadora-precio-gasolina-acpm-galon-colombia-2026.json` (21 × 2026 adentro)
- `src/content/calcs-co/calculadora-prestaciones-empleada-domestica-colombia-2026.json` (28 × 2026 adentro)
- `src/content/calcs-co/calculadora-provision-prestaciones-sociales-mensual-empleador-colombia-2026.json` (26 × 2026 adentro)
- `src/content/calcs-co/calculadora-recargo-dominical-festivo-colombia-2026.json` (114 × 2026 adentro)
- `src/content/calcs-co/calculadora-recargo-nocturno-colombia-2026.json` (47 × 2026 adentro)
- `src/content/calcs-co/calculadora-reduccion-jornada-42-horas-colombia-2026.json` (52 × 2026 adentro)
- `src/content/calcs-co/calculadora-renta-pensionados-colombia-2026.json` (49 × 2026 adentro)
- `src/content/calcs-co/calculadora-renta-personas-naturales-colombia-2026-anual.json` (40 × 2026 adentro)
- `src/content/calcs-co/calculadora-retefuente-colombia-2026-empleado-tabla.json` (41 × 2026 adentro)
- `src/content/calcs-co/calculadora-retencion-fuente-arrendamientos-colombia-2026.json` (35 × 2026 adentro)
- `src/content/calcs-co/calculadora-retencion-fuente-compras-servicios-2026.json` (41 × 2026 adentro)
- `src/content/calcs-co/calculadora-retencion-procedimiento-2-colombia-2026.json` (22 × 2026 adentro)
- `src/content/calcs-co/calculadora-retencion-salarios-procedimiento-1-colombia-2026.json` (30 × 2026 adentro)
- `src/content/calcs-co/calculadora-salario-aprendiz-sena-2026.json` (47 × 2026 adentro)
- `src/content/calcs-co/calculadora-salario-integral-colombia-2026.json` (41 × 2026 adentro)
- `src/content/calcs-co/calculadora-salario-minimo-colombia-2026-auxilio-transporte.json` (74 × 2026 adentro)
- `src/content/calcs-co/calculadora-salario-neto-colombia-2026-bruto-a-neto.json` (33 × 2026 adentro)
- `src/content/calcs-co/calculadora-salarios-minimos-a-pesos-colombia-2026.json` (40 × 2026 adentro)
- `src/content/calcs-co/calculadora-sancion-correccion-declaracion-dian-colombia-2026.json` (38 × 2026 adentro)
- `src/content/calcs-co/calculadora-sancion-extemporaneidad-dian-2026.json` (45 × 2026 adentro)
- `src/content/calcs-co/calculadora-sancion-minima-dian-colombia-2026-10-uvt.json` (21 × 2026 adentro)
- `src/content/calcs-co/calculadora-soat-colombia-precio-2026-vehiculo.json` (32 × 2026 adentro)
- `src/content/calcs-co/calculadora-subsidio-vivienda-mi-casa-ya-colombia-2026.json` (52 × 2026 adentro)
- `src/content/calcs-co/calculadora-tabla-impuesto-renta-personas-naturales-colombia-2026.json` (29 × 2026 adentro)
- `src/content/calcs-co/calculadora-tasa-interes-mora-colombia-tarjeta-credito-2026.json` (36 × 2026 adentro)
- `src/content/calcs-co/calculadora-universidad-publica-vs-privada-colombia-coste-2026.json` (34 × 2026 adentro)
- `src/content/calcs-en/cedear-dividend-yield-2026.json` (10 × 2026 adentro)
- `src/content/calcs-en/federal-income-tax-brackets-2026-calculator.json` (28 × 2026 adentro)
- `src/content/calcs-en/medicine-entrance-cbc-score-uba-2026.json` (9 × 2026 adentro)
- `src/content/calcs-en/minimum-retirement-pension-bonus-2026.json` (12 × 2026 adentro)
- `src/content/calcs-en/minimum-wage-2026-comparison.json` (22 × 2026 adentro)
- `src/content/calcs-es/calculadora-autonomo-cuota-2026-espana-rendimiento-neto.json` (30 × 2026 adentro)
- `src/content/calcs-es/calculadora-beca-erasmus-mensualidad-pais-destino-2026.json` (26 × 2026 adentro)
- `src/content/calcs-es/calculadora-becas-mec-2026-espana-renta-familiar-rendimiento.json` (35 × 2026 adentro)
- `src/content/calcs-es/calculadora-bono-social-electrico-espana-2026-criterios.json` (28 × 2026 adentro)
- `src/content/calcs-es/calculadora-comprar-coche-electrico-vs-gasolina-espana-2026.json` (13 × 2026 adentro)
- `src/content/calcs-es/calculadora-convenio-comercio-espana-sueldo-categoria-2026.json` (33 × 2026 adentro)
- `src/content/calcs-es/calculadora-convenio-hosteleria-espana-sueldo-2026-categoria.json` (62 × 2026 adentro)
- `src/content/calcs-es/calculadora-dependencia-grado-prestacion-espana-2026.json` (25 × 2026 adentro)
- `src/content/calcs-es/calculadora-factura-luz-pvpc-vs-mercado-libre-espana-2026.json` (28 × 2026 adentro)
- `src/content/calcs-es/calculadora-fibra-movil-mejor-precio-comparador-espana-2026.json` (28 × 2026 adentro)
- `src/content/calcs-es/calculadora-finiquito-despido-improcedente-espana-2026.json` (18 × 2026 adentro)
- `src/content/calcs-es/calculadora-hipoteca-fija-vs-variable-euribor-espana-2026.json` (22 × 2026 adentro)
- `src/content/calcs-es/calculadora-impuesto-patrimonio-espana-ccaa-2026.json` (21 × 2026 adentro)
- `src/content/calcs-es/calculadora-impuesto-sucesiones-donaciones-espana-ccaa-2026.json` (18 × 2026 adentro)
- `src/content/calcs-es/calculadora-ingreso-minimo-vital-imv-espana-2026-cuantia.json` (37 × 2026 adentro)
- `src/content/calcs-es/calculadora-irpf-2026-tramos-espana-nomina.json` (38 × 2026 adentro)
- `src/content/calcs-es/calculadora-jubilacion-espana-2026-pension-anos-cotizados.json` (46 × 2026 adentro)
- `src/content/calcs-es/calculadora-paro-prestacion-desempleo-espana-2026-meses.json` (25 × 2026 adentro)
- `src/content/calcs-es/calculadora-permiso-paternidad-maternidad-espana-2026-semanas.json` (26 × 2026 adentro)
- `src/content/calcs-es/calculadora-plan-pensiones-aportacion-deduccion-espana-2026.json` (24 × 2026 adentro)
- `src/content/calcs-es/calculadora-renta-bruta-neta-espana-2026-irpf-ss.json` (36 × 2026 adentro)
- `src/content/calcs-es/calculadora-seguro-coche-precio-espana-2026-edad-bonus-malus.json` (18 × 2026 adentro)
- `src/content/calcs-es/calculadora-tipo-marginal-irpf-espana-2026-tramos-rapido.json` (26 × 2026 adentro)
- `src/content/calcs-es/calculadora-trastero-garaje-precio-alquiler-espana-2026.json` (21 × 2026 adentro)
- `src/content/calcs-mx/calculadora-afore-saldo-pension-jubilacion-mexico-2026.json` (31 × 2026 adentro)
- `src/content/calcs-mx/calculadora-aguinaldo-mexico-2026-15-dias-tope-30.json` (40 × 2026 adentro)
- `src/content/calcs-mx/calculadora-ahorro-voluntario-afore-mexico-2026.json` (47 × 2026 adentro)
- `src/content/calcs-mx/calculadora-comparativa-banco-comisiones-mexico-2026.json` (18 × 2026 adentro)
- `src/content/calcs-mx/calculadora-coste-funeral-mexico-promedio-2026-paquetes.json` (21 × 2026 adentro)
- `src/content/calcs-mx/calculadora-costo-despido-liquidacion-patron-mexico-2026.json` (19 × 2026 adentro)
- `src/content/calcs-mx/calculadora-costo-empleada-domestica-patron-mexico-2026.json` (56 × 2026 adentro)
- `src/content/calcs-mx/calculadora-costo-empleado-patron-mexico-2026.json` (46 × 2026 adentro)
- `src/content/calcs-mx/calculadora-costo-pasaporte-mexicano-2026.json` (27 × 2026 adentro)
- `src/content/calcs-mx/calculadora-credito-automotriz-mexico-cat-mensualidad-2026.json` (20 × 2026 adentro)
- `src/content/calcs-mx/calculadora-imss-cuotas-empleado-patron-mexico-2026.json` (43 × 2026 adentro)
- `src/content/calcs-mx/calculadora-infonavit-credito-mexico-puntaje-monto-2026.json` (45 × 2026 adentro)
- `src/content/calcs-mx/calculadora-isr-actividad-empresarial-persona-fisica-mexico-2026.json` (44 × 2026 adentro)
- `src/content/calcs-mx/calculadora-isr-anual-personas-fisicas-mexico-tarifa-2026.json` (30 × 2026 adentro)
- `src/content/calcs-mx/calculadora-isr-finiquito-liquidacion-mexico-2026.json` (31 × 2026 adentro)
- `src/content/calcs-mx/calculadora-isr-intereses-bancarios-inversion-mexico-2026.json` (39 × 2026 adentro)
- `src/content/calcs-mx/calculadora-isr-mexico-2026-tarifa-mensual-empleado.json` (26 × 2026 adentro)
- `src/content/calcs-mx/calculadora-isr-premios-loteria-mexico-2026.json` (20 × 2026 adentro)
- `src/content/calcs-mx/calculadora-isr-quincenal-mexico-2026.json` (56 × 2026 adentro)
- `src/content/calcs-mx/calculadora-pago-provisional-isr-arrendamiento-mexico-2026.json` (40 × 2026 adentro)
- `src/content/calcs-mx/calculadora-pension-bienestar-2026-monto.json` (33 × 2026 adentro)
- `src/content/calcs-mx/calculadora-pension-issste-decimo-transitorio-mexico-2026.json` (54 × 2026 adentro)
- `src/content/calcs-mx/calculadora-pension-minima-garantizada-ley-97-mexico-2026.json` (38 × 2026 adentro)
- `src/content/calcs-mx/calculadora-predial-cdmx-monterrey-guadalajara-2026.json` (23 × 2026 adentro)
- `src/content/calcs-mx/calculadora-prestaciones-superiores-ley-mexico-2026.json` (38 × 2026 adentro)
- `src/content/calcs-mx/calculadora-recargos-actualizacion-sat-mexico-2026.json` (46 × 2026 adentro)
- `src/content/calcs-mx/calculadora-recibo-nomina-percepciones-deducciones-mexico-2026.json` (21 × 2026 adentro)
- `src/content/calcs-mx/calculadora-resico-personas-fisicas-mexico-2026-cuota.json` (25 × 2026 adentro)
- `src/content/calcs-mx/calculadora-resico-personas-morales-mexico-2026.json` (26 × 2026 adentro)
- `src/content/calcs-mx/calculadora-retencion-plataformas-digitales-mexico-2026.json` (46 × 2026 adentro)
- `src/content/calcs-mx/calculadora-salario-minimo-mexico-2026.json` (21 × 2026 adentro)
- `src/content/calcs-mx/calculadora-sueldo-bruto-desde-neto-mexico-2026.json` (50 × 2026 adentro)
- `src/content/calcs-mx/calculadora-tenencia-vehicular-mexico-cdmx-edomex-2026.json` (30 × 2026 adentro)
- `src/content/calcs-mx/calculadora-tope-deducciones-personales-2026-mexico.json` (38 × 2026 adentro)
- `src/content/calcs-pt-pt/calculadora-irs-portugal-2026.json` (36 × 2026 adentro)
- `src/content/calcs-pt/bolsa-familia-valor-por-familia-2026.json` (24 × 2026 adentro)
- `src/content/calcs-pt/calculadora-aposentadoria-inss-2026-tempo-contribuicao.json` (42 × 2026 adentro)
- `src/content/calcs-pt/calculadora-imposto-renda-2026-brasil-completa-simplificada.json` (30 × 2026 adentro)
- `src/content/calcs-pt/calculadora-mei-brasil-limite-faturamento-2026-categoria.json` (36 × 2026 adentro)
- `src/content/calcs-pt/irrf-mensal-folha-pagamento-2026.json` (34 × 2026 adentro)
- `src/content/calcs-pt/minha-casa-minha-vida-faixa-subsidio-2026.json` (17 × 2026 adentro)
- `src/content/calcs-pt/salario-liquido-clt-inss-irrf-2026.json` (45 × 2026 adentro)
- `src/content/calcs-py/salario-minimo-paraguay-2026.json` (44 × 2026 adentro)
- `src/content/calcs-ve/calculadora-islr-venezuela-2026.json` (11 × 2026 adentro)
- `src/content/calcs-ve/cuanto-es-salario-minimo-venezuela-2026.json` (15 × 2026 adentro)
- `src/content/calcs/abl-caba-valuacion-fiscal-actualizada-2026.json` (17 × 2026 adentro)
- `src/content/calcs/aguinaldo-mexico.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/autonomos-categoria-monto-2026.json` (27 × 2026 adentro)
- `src/content/calcs/bienes-personales-tramos-alicuota-2026.json` (20 × 2026 adentro)
- `src/content/calcs/bienes-personales.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/calculadora-aportes-patronales-empleado-registrado-cargas-sociales-2026.json` (10 × 2026 adentro)
- `src/content/calcs/calculadora-asignacion-familiar-anses-2026-tramos-ingreso.json` (26 × 2026 adentro)
- `src/content/calcs/calculadora-asignacion-universal-hijo-auh-2026-monto.json` (21 × 2026 adentro)
- `src/content/calcs/calculadora-carbon-credit-tonelada-precio-mercado-2026.json` (24 × 2026 adentro)
- `src/content/calcs/calculadora-comision-doordash-rappi-pedidosya-restaurante-2026.json` (19 × 2026 adentro)
- `src/content/calcs/calculadora-comision-tienda-nube-2026-monto-mensual-checkout.json` (22 × 2026 adentro)
- `src/content/calcs/calculadora-comision-uber-driver-ganancia-real-argentina-2026.json` (21 × 2026 adentro)
- `src/content/calcs/calculadora-cuanto-cobrar-traduccion-palabra-2026-espanol-ingles.json` (15 × 2026 adentro)
- `src/content/calcs/calculadora-cuota-jardin-maternal-cama-cuna-mensual-2026.json` (19 × 2026 adentro)
- `src/content/calcs/calculadora-ganancias-segunda-categoria-renta-financiera-2026.json` (30 × 2026 adentro)
- `src/content/calcs/calculadora-impuesto-bienes-personales-2026-cripto-cedears.json` (23 × 2026 adentro)
- `src/content/calcs/calculadora-irpf-cataluna-2026-asalariado.json` (20 × 2026 adentro)
- `src/content/calcs/calculadora-irpf-madrid-2026-asalariado.json` (28 × 2026 adentro)
- `src/content/calcs/calculadora-licencia-vacaciones-cct-comercio-empleados-comercio-argentina-2026.json` (14 × 2026 adentro)
- `src/content/calcs/calculadora-paritaria-camioneros-2026-flete-larga-distancia.json` (28 × 2026 adentro)
- `src/content/calcs/calculadora-paritaria-comercio-2026-aumento-acumulado.json` (37 × 2026 adentro)
- `src/content/calcs/calculadora-paritaria-uocra-construccion-2026-categoria.json` (46 × 2026 adentro)
- `src/content/calcs/calculadora-patente-auto-cordoba-2026-valuacion-fiscal-cuotas.json` (21 × 2026 adentro)
- `src/content/calcs/calculadora-pension-invalidez-anses-no-contributiva-2026-cuantia.json` (30 × 2026 adentro)
- `src/content/calcs/calculadora-pension-no-contributiva-madre-7-hijos-anses-2026.json` (14 × 2026 adentro)
- `src/content/calcs/calculadora-plusvalia-inmueble-pba-venta-impuesto-2026.json` (17 × 2026 adentro)
- `src/content/calcs/calculadora-precio-remis-por-km-argentina-2026-cordoba-rosario-buenos-aires.json` (20 × 2026 adentro)
- `src/content/calcs/calculadora-prestamo-anses-jubilados-monto-cuota-2026.json` (15 × 2026 adentro)
- `src/content/calcs/calculadora-puam-pension-universal-adulto-mayor-anses-2026.json` (29 × 2026 adentro)
- `src/content/calcs/calculadora-quita-jubilatoria-bono-refuerzo-anses-2026.json` (23 × 2026 adentro)
- `src/content/calcs/calculadora-rural-rentabilidad-hectarea-soja-maiz-trigo-2026.json` (24 × 2026 adentro)
- `src/content/calcs/calculadora-tarifa-gas-metrogas-naturgy-cuadro-2026.json` (20 × 2026 adentro)
- `src/content/calcs/calculadora-tiktok-ads-cpm-presupuesto-conversion-2026.json` (21 × 2026 adentro)
- `src/content/calcs/calculadora-valuacion-fiscal-neuquen-2026-impuesto-inmobiliario.json` (22 × 2026 adentro)
- `src/content/calcs/cedear-dividend-yield-2026.json` (9 × 2026 adentro)
- `src/content/calcs/cesantias-colombia-liquidacion.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/costo-transaccion-gas-eth.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/credito-universitario-progresar-monto-2026.json` (14 × 2026 adentro)
- `src/content/calcs/cts-peru.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/estampillado-sellado-inmueble-pba-caba-2026.json` (15 × 2026 adentro)
- `src/content/calcs/finiquito-mexico-calculo.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/ganancias-empleados-4ta-categoria-2026.json` (33 × 2026 adentro)
- `src/content/calcs/ganancias-tramos-empleado-mensual-2026.json` (28 × 2026 adentro)
- `src/content/calcs/haber-minimo-jubilatorio-2026-bono-total.json` (9 × 2026 adentro)
- `src/content/calcs/halving-bitcoin-fecha.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/impermanent-loss-defi.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/impuesto-ganancia-cripto-argentina.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/impuesto-renta-peru.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/ingreso-medicina-puntaje-cbc-uba-2026.json` (18 × 2026 adentro)
- `src/content/calcs/isr-mexico-2026.json` (17 × 2026 adentro)
- `src/content/calcs/jubilacion-anses-monto-minimo-maxima-2026.json` (45 × 2026 adentro)
- `src/content/calcs/monotributo-cuota-2026-todas-categorias.json` (38 × 2026 adentro)
- `src/content/calcs/monotributo-mejor-categoria-2026.json` (23 × 2026 adentro)
- `src/content/calcs/monotributo.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/obra-social-monotributo-2026.json` (15 × 2026 adentro)
- `src/content/calcs/patente-moto-provincias-2026-alicuota.json` (29 × 2026 adentro)
- `src/content/calcs/prima-servicios-colombia.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/prima-vacacional-mexico.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/progresar-beca-monto-requisitos-2026.json` (14 × 2026 adentro)
- `src/content/calcs/renta-colombia-persona-natural.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/salario-minimo-2026-comparativa.json` (24 × 2026 adentro)
- `src/content/calcs/sueldo-neto-chile.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/sueldo-neto-colombia.json` — slug contiene 2026 aunque el filename no
- `src/content/calcs/vtv-costo-provincia-2026.json` (22 × 2026 adentro)
- `src/content/calcs/vtv-costo-provincias-2026.json` (21 × 2026 adentro)
- `src/content/comparaciones/imac-m4-vs-mac-mini-vs-macbook-air-2026-mejor-relacion.json` (19 × 2026 adentro)
- `src/content/comparaciones/react-vs-vue-vs-svelte-vs-solid-frameworks-2026.json` (37 × 2026 adentro)
- `src/content/guias/impuestos-argentina-2026.json` (38 × 2026 adentro)
- `src/content/guias/negocios-e-independientes-2026.json` (6 × 2026 adentro)
- `src/content/guias/subsidios-anses-2026.json` (19 × 2026 adentro)
- `src/content/guias/sueldos-argentina-2026.json` (16 × 2026 adentro)
- `src/content/guias/sueldos-impuestos-ecuador-2026.json` (17 × 2026 adentro)
- `src/content/guias/sueldos-impuestos-peru-2026.json` (15 × 2026 adentro)
- `src/content/tablas/tabla-categorias-monotributo-2026.json` (19 × 2026 adentro)
- `src/content/tablas/tabla-escalas-ganancias-2026.json` (16 × 2026 adentro)
- `src/pages/aguinaldo-diciembre-2026.astro` (38 × 2026 adentro)
- `src/pages/top/freelancers-2026.astro` (4 × 2026 adentro)
- `src/pages/wizard/que-monotributo-me-conviene-2026.astro` (26 × 2026 adentro)

### formula-de-calc-con-año (205)

> Migra JUNTO con el calc JSON del mismo slug: crear <slug>-2027.ts, actualizar src/lib/formulas/index.ts, 301 del calc viejo.

- `src/lib/formulas/abl-caba-valuacion-fiscal-actualizada-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/afore-saldo-pension-jubilacion-mexico-2026.ts` (7 × 2026 adentro)
- `src/lib/formulas/afp-pension-chile-2026-tabla-comisiones.ts` (2 × 2026 adentro)
- `src/lib/formulas/aguinaldo-mexico-2026-15-dias-tope-30.ts` (13 × 2026 adentro)
- `src/lib/formulas/ahorro-voluntario-afore-mexico-2026.ts` (18 × 2026 adentro)
- `src/lib/formulas/ahorros-en-dolares-colombia-bancos-internacionales-2026.ts` (3 × 2026 adentro)
- `src/lib/formulas/anticipo-impuesto-renta-colombia-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/aporte-caja-compensacion-colombia-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/aporte-eps-pension-empleado-colombia-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/aposentadoria-inss-2026-tempo-contribuicao.ts` (15 × 2026 adentro)
- `src/lib/formulas/asignacion-familiar-anses-2026-tramos-ingreso.ts` (6 × 2026 adentro)
- `src/lib/formulas/asignacion-familiar-chile-2026-tramos-renta.ts` (3 × 2026 adentro)
- `src/lib/formulas/asignacion-universal-hijo-auh-2026-monto.ts` (3 × 2026 adentro)
- `src/lib/formulas/auh-asignacion-universal-hijo-monto-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/aumento-salario-2026-colombia.ts` (7 × 2026 adentro)
- `src/lib/formulas/autonomo-cuota-2026-espana-rendimiento-neto.ts` (13 × 2026 adentro)
- `src/lib/formulas/autonomos-categoria-monto-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/autonomos-categorias-2026-aportes.ts` (4 × 2026 adentro)
- `src/lib/formulas/auxilio-transporte-colombia-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/beca-erasmus-mensualidad-pais-destino-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/becas-icetex-colombia-credito-monto-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/becas-junaeb-chile-cuantia-requisitos-2026.ts` (3 × 2026 adentro)
- `src/lib/formulas/becas-mec-2026-espana-renta-familiar-rendimiento.ts` (3 × 2026 adentro)
- `src/lib/formulas/bienes-personales-minimo-no-imponible-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/bienes-personales-tramos-alicuota-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/bono-social-electrico-espana-2026-criterios.ts` (8 × 2026 adentro)
- `src/lib/formulas/cae-credito-hipotecario-chile-bancos-2026.ts` (7 × 2026 adentro)
- `src/lib/formulas/calculadora-costo-despido-empleador-colombia-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/calculadora-costo-despido-liquidacion-patron-mexico-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/calculadora-irs-portugal-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/calculadora-islr-venezuela-2026.ts` (9 × 2026 adentro)
- `src/lib/formulas/calculadora-isr-finiquito-liquidacion-mexico-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/calculadora-liquidacion-contrato-termino-fijo-colombia-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/calculadora-liquidacion-empleada-domestica-por-dias-colombia-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/calculadora-pension-minima-garantizada-ley-97-mexico-2026.ts` (19 × 2026 adentro)
- `src/lib/formulas/calculadora-provision-prestaciones-sociales-mensual-empleador-colombia-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/calculadora-recibo-nomina-percepciones-deducciones-mexico-2026.ts` (11 × 2026 adentro)
- `src/lib/formulas/canasta-basica-mensual-chile-ine-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/carbon-credit-tonelada-precio-mercado-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/cedear-dividend-yield-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/comision-doordash-rappi-pedidosya-restaurante-2026.ts` (3 × 2026 adentro)
- `src/lib/formulas/comision-tienda-nube-2026-monto-mensual-checkout.ts` (2 × 2026 adentro)
- `src/lib/formulas/comision-uber-driver-ganancia-real-argentina-2026.ts`
- `src/lib/formulas/comparador-tarjeta-debito-colombia-2026-comisiones.ts` (1 × 2026 adentro)
- `src/lib/formulas/comparativa-banco-comisiones-colombia-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/comparativa-banco-comisiones-mexico-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/comparendos-transito-colombia-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/comprar-coche-electrico-vs-gasolina-espana-2026.ts`
- `src/lib/formulas/convenio-comercio-espana-sueldo-categoria-2026.ts` (9 × 2026 adentro)
- `src/lib/formulas/convenio-hosteleria-espana-sueldo-2026-categoria.ts` (13 × 2026 adentro)
- `src/lib/formulas/conversion-uvt-uvr-colombia-actualizacion-2026.ts` (28 × 2026 adentro)
- `src/lib/formulas/coste-funeral-mexico-promedio-2026-paquetes.ts` (1 × 2026 adentro)
- `src/lib/formulas/coste-funeral-promedio-chile-2026-cremacion-sepelio.ts` (1 × 2026 adentro)
- `src/lib/formulas/coste-funeral-promedio-colombia-2026-paquetes.ts` (1 × 2026 adentro)
- `src/lib/formulas/costo-empleada-domestica-patron-mexico-2026.ts` (19 × 2026 adentro)
- `src/lib/formulas/costo-empleado-patron-mexico-2026.ts` (9 × 2026 adentro)
- `src/lib/formulas/costo-hora-empleado-empresa-colombia-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/costo-pasaporte-mexicano-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/costo-total-empleado-empleador-colombia-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/credito-automotriz-mexico-cat-mensualidad-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/credito-educativo-icetex-vs-banco-colombia-2026.ts` (3 × 2026 adentro)
- `src/lib/formulas/credito-hipotecario-chile-uf-cmf-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/credito-hipotecario-colombia-2026-uvr-pesos.ts` (1 × 2026 adentro)
- `src/lib/formulas/credito-universitario-progresar-monto-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/cripto-chile-impuestos-trader-2026-sii.ts` (3 × 2026 adentro)
- `src/lib/formulas/cripto-colombia-impuestos-renta-trader-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/cuanto-cobrar-traduccion-palabra-2026-espanol-ingles.ts` (1 × 2026 adentro)
- `src/lib/formulas/cuanto-es-salario-minimo-venezuela-2026.ts` (7 × 2026 adentro)
- `src/lib/formulas/cuota-jardin-maternal-cama-cuna-mensual-2026.ts` (3 × 2026 adentro)
- `src/lib/formulas/deduccion-dependientes-colombia-renta-2026.ts` (9 × 2026 adentro)
- `src/lib/formulas/dependencia-grado-prestacion-espana-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/deposito-plazo-chile-bancos-2026-tasa.ts` (4 × 2026 adentro)
- `src/lib/formulas/dotacion-laboral-colombia-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/empleada-domestica-dias-colombia-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/estampillado-sellado-inmueble-pba-caba-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/factura-luz-pvpc-vs-mercado-libre-espana-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/federal-income-tax-brackets-2026-calculator.ts` (12 × 2026 adentro)
- `src/lib/formulas/fibra-movil-mejor-precio-comparador-espana-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/finiquito-despido-improcedente-espana-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/fondos-mutuos-chile-rentabilidad-comparativa-2026.ts` (4 × 2026 adentro)
- `src/lib/formulas/ganancia-repartidor-apps-colombia-2026.ts` (15 × 2026 adentro)
- `src/lib/formulas/ganancias-cuarta-categoria-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/ganancias-segunda-categoria-renta-financiera-2026.ts` (3 × 2026 adentro)
- `src/lib/formulas/ganancias-tramos-empleado-mensual-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/gastos-notariales-registro-compraventa-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/haber-minimo-jubilatorio-2026-bono-total.ts` (1 × 2026 adentro)
- `src/lib/formulas/hipoteca-fija-vs-variable-euribor-espana-2026.ts`
- `src/lib/formulas/horas-extras-colombia-2026.ts` (12 × 2026 adentro)
- `src/lib/formulas/ibc-independientes-contratista-colombia-2026.ts` (10 × 2026 adentro)
- `src/lib/formulas/impoconsumo-restaurantes-bares-colombia-2026.ts` (3 × 2026 adentro)
- `src/lib/formulas/imposto-renda-2026-brasil-completa-simplificada.ts` (14 × 2026 adentro)
- `src/lib/formulas/impuesto-bienes-personales-2026-cripto-cedears.ts` (1 × 2026 adentro)
- `src/lib/formulas/impuesto-cervezas-licores-tabaco-colombia-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/impuesto-loterias-juegos-azar-colombia-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/impuesto-patrimonio-colombia-personas-naturales-2026.ts` (7 × 2026 adentro)
- `src/lib/formulas/impuesto-patrimonio-espana-ccaa-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/impuesto-predial-bogota-2026.ts` (23 × 2026 adentro)
- `src/lib/formulas/impuesto-primera-categoria-chile-empresas-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/impuesto-renta-empresas-colombia-35-porcentaje-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/impuesto-renta-segunda-categoria-chile-2026-tabla.ts` (8 × 2026 adentro)
- `src/lib/formulas/impuesto-sucesiones-donaciones-espana-ccaa-2026.ts` (4 × 2026 adentro)
- `src/lib/formulas/impuesto-sucesiones-herencia-colombia-2026.ts` (10 × 2026 adentro)
- `src/lib/formulas/impuesto-timbre-nacional-colombia-2026.ts` (11 × 2026 adentro)
- `src/lib/formulas/impuesto-vehiculos-bogota-2026-tabla.ts` (3 × 2026 adentro)
- `src/lib/formulas/impuesto-vehiculos-colombia-2026-departamento.ts` (3 × 2026 adentro)
- `src/lib/formulas/imss-cuotas-empleado-patron-mexico-2026.ts` (9 × 2026 adentro)
- `src/lib/formulas/infonavit-credito-mexico-puntaje-monto-2026.ts` (14 × 2026 adentro)
- `src/lib/formulas/ingreso-medicina-puntaje-cbc-uba-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/ingreso-minimo-vital-imv-espana-2026-cuantia.ts` (6 × 2026 adentro)
- `src/lib/formulas/interes-mora-dian-colombia-2026.ts` (16 × 2026 adentro)
- `src/lib/formulas/intereses-cesantias-colombia-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/irpf-2026-tramos-espana-nomina.ts` (5 × 2026 adentro)
- `src/lib/formulas/irpf-cataluna-2026.ts` (3 × 2026 adentro)
- `src/lib/formulas/irpf-madrid-2026.ts` (4 × 2026 adentro)
- `src/lib/formulas/isr-actividad-empresarial-persona-fisica-mexico-2026.ts` (12 × 2026 adentro)
- `src/lib/formulas/isr-anual-personas-fisicas-mexico-tarifa-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/isr-intereses-bancarios-inversion-mexico-2026.ts` (9 × 2026 adentro)
- `src/lib/formulas/isr-mexico-2026-tarifa-mensual-empleado.ts` (3 × 2026 adentro)
- `src/lib/formulas/isr-mexico-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/isr-premios-loteria-mexico-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/isr-quincenal-mexico-2026.ts` (13 × 2026 adentro)
- `src/lib/formulas/iva-bienes-exentos-excluidos-colombia-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/jubilacion-anses-monto-minimo-maxima-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/jubilacion-espana-2026-pension-anos-cotizados.ts` (36 × 2026 adentro)
- `src/lib/formulas/licencia-vacaciones-cct-comercio-empleados-comercio-argentina-2026.ts`
- `src/lib/formulas/mei-brasil-limite-faturamento-2026-categoria.ts` (11 × 2026 adentro)
- `src/lib/formulas/monotributo-cuota-2026-todas-categorias.ts` (5 × 2026 adentro)
- `src/lib/formulas/multa-no-aviso-uoct-transito-comuna-chile-2026.ts`
- `src/lib/formulas/obligado-declarar-renta-2026.ts` (11 × 2026 adentro)
- `src/lib/formulas/obra-social-monotributo-2026.ts` (9 × 2026 adentro)
- `src/lib/formulas/pago-provisional-isr-arrendamiento-mexico-2026.ts` (10 × 2026 adentro)
- `src/lib/formulas/paritaria-camioneros-2026-flete-larga-distancia.ts` (6 × 2026 adentro)
- `src/lib/formulas/paritaria-comercio-2026-aumento-acumulado.ts` (6 × 2026 adentro)
- `src/lib/formulas/paritaria-uocra-construccion-2026-categoria.ts` (15 × 2026 adentro)
- `src/lib/formulas/paro-prestacion-desempleo-espana-2026-meses.ts` (3 × 2026 adentro)
- `src/lib/formulas/pase-escolar-tne-chile-precio-2026-recargo.ts` (2 × 2026 adentro)
- `src/lib/formulas/patente-moto-provincias-2026-alicuota.ts` (1 × 2026 adentro)
- `src/lib/formulas/pension-bienestar-2026-monto.ts` (9 × 2026 adentro)
- `src/lib/formulas/pension-colombia-2026-edad-semanas-cotizadas.ts` (12 × 2026 adentro)
- `src/lib/formulas/pension-invalidez-anses-no-contributiva-2026-cuantia.ts` (7 × 2026 adentro)
- `src/lib/formulas/pension-issste-decimo-transitorio-mexico-2026.ts` (12 × 2026 adentro)
- `src/lib/formulas/pension-jubilacion-chile-edad-aportes-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/permiso-circulacion-chile-vehiculo-2026-comuna.ts` (2 × 2026 adentro)
- `src/lib/formulas/permiso-paternidad-maternidad-espana-2026-semanas.ts` (10 × 2026 adentro)
- `src/lib/formulas/pila-independientes-colombia-2026.ts` (4 × 2026 adentro)
- `src/lib/formulas/plan-pensiones-aportacion-deduccion-espana-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/precio-gasolina-acpm-galon-colombia-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/precio-remis-por-km-argentina-2026-cordoba-rosario-buenos-aires.ts` (3 × 2026 adentro)
- `src/lib/formulas/precio-uber-cabify-didi-comparador-argentina-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/predial-cdmx-monterrey-guadalajara-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/prestaciones-empleada-domestica-colombia-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/prestaciones-superiores-ley-mexico-2026.ts` (7 × 2026 adentro)
- `src/lib/formulas/prestamo-anses-jubilados-monto-cuota-2026.ts`
- `src/lib/formulas/progresar-beca-monto-requisitos-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/puam-pension-universal-adulto-mayor-anses-2026.ts` (7 × 2026 adentro)
- `src/lib/formulas/quita-jubilatoria-bono-refuerzo-anses-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/recargo-dominical-festivo-colombia-2026.ts` (28 × 2026 adentro)
- `src/lib/formulas/recargo-nocturno-colombia-2026.ts` (9 × 2026 adentro)
- `src/lib/formulas/recargos-actualizacion-sat-mexico-2026.ts` (17 × 2026 adentro)
- `src/lib/formulas/reduccion-jornada-42-horas-colombia-2026.ts` (12 × 2026 adentro)
- `src/lib/formulas/renta-bruta-neta-espana-2026-irpf-ss.ts` (10 × 2026 adentro)
- `src/lib/formulas/renta-pensionados-colombia-2026.ts` (12 × 2026 adentro)
- `src/lib/formulas/renta-personas-naturales-colombia-2026-anual.ts` (35 × 2026 adentro)
- `src/lib/formulas/resico-personas-fisicas-mexico-2026-cuota.ts` (2 × 2026 adentro)
- `src/lib/formulas/resico-personas-morales-mexico-2026.ts` (4 × 2026 adentro)
- `src/lib/formulas/retefuente-colombia-2026-empleado-tabla.ts` (15 × 2026 adentro)
- `src/lib/formulas/retencion-fuente-arrendamientos-colombia-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/retencion-fuente-compras-servicios-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/retencion-plataformas-digitales-mexico-2026.ts` (10 × 2026 adentro)
- `src/lib/formulas/retencion-procedimiento-2-colombia-2026.ts` (7 × 2026 adentro)
- `src/lib/formulas/retencion-salarios-procedimiento-1-colombia-2026.ts` (10 × 2026 adentro)
- `src/lib/formulas/rural-rentabilidad-hectarea-soja-maiz-trigo-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/salario-aprendiz-sena-2026.ts` (9 × 2026 adentro)
- `src/lib/formulas/salario-integral-colombia-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/salario-minimo-2026-comparativa.ts` (1 × 2026 adentro)
- `src/lib/formulas/salario-minimo-colombia-2026-auxilio-transporte.ts` (16 × 2026 adentro)
- `src/lib/formulas/salario-minimo-paraguay-2026.ts` (10 × 2026 adentro)
- `src/lib/formulas/salario-neto-colombia-2026-bruto-a-neto.ts` (14 × 2026 adentro)
- `src/lib/formulas/salarios-minimos-a-pesos-colombia-2026.ts` (10 × 2026 adentro)
- `src/lib/formulas/saldo-afp-rentabilidad-multifondos-chile-2026.ts` (3 × 2026 adentro)
- `src/lib/formulas/sancion-correccion-declaracion-dian-colombia-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/sancion-extemporaneidad-dian-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/sancion-minima-dian-colombia-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/seguro-auto-chile-todo-riesgo-comparador-2026.ts` (7 × 2026 adentro)
- `src/lib/formulas/seguro-coche-precio-espana-2026-edad-bonus-malus.ts` (2 × 2026 adentro)
- `src/lib/formulas/soap-seguro-obligatorio-chile-precio-2026.ts` (11 × 2026 adentro)
- `src/lib/formulas/soat-colombia-precio-2026-vehiculo.ts` (3 × 2026 adentro)
- `src/lib/formulas/subsidio-vivienda-mi-casa-ya-colombia-2026.ts` (14 × 2026 adentro)
- `src/lib/formulas/sueldo-bruto-desde-neto-mexico-2026.ts` (12 × 2026 adentro)
- `src/lib/formulas/sueldo-comercio-paritaria-abril-2026.ts` (8 × 2026 adentro)
- `src/lib/formulas/sueldo-liquido-chile-2026-impuesto-segunda-categoria.ts` (12 × 2026 adentro)
- `src/lib/formulas/tabla-impuesto-renta-personas-naturales-colombia-2026.ts` (7 × 2026 adentro)
- `src/lib/formulas/tarifa-gas-metrogas-naturgy-cuadro-2026.ts` (4 × 2026 adentro)
- `src/lib/formulas/tasa-interes-mora-colombia-tarjeta-credito-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/tenencia-vehicular-mexico-cdmx-edomex-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/tiktok-ads-cpm-presupuesto-conversion-2026.ts`
- `src/lib/formulas/tipo-marginal-irpf-espana-2026-tramos-rapido.ts` (6 × 2026 adentro)
- `src/lib/formulas/tope-deducciones-personales-2026-mexico.ts` (13 × 2026 adentro)
- `src/lib/formulas/tope-imponible-cotizaciones-chile-2026.ts` (4 × 2026 adentro)
- `src/lib/formulas/trastero-garaje-precio-alquiler-espana-2026.ts` (3 × 2026 adentro)
- `src/lib/formulas/uf-uta-utm-chile-conversion-pesos-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/universidad-publica-vs-privada-colombia-coste-2026.ts` (3 × 2026 adentro)
- `src/lib/formulas/valuacion-fiscal-neuquen-2026-impuesto-inmobiliario.ts` (4 × 2026 adentro)
- `src/lib/formulas/vtv-costo-provincia-2026.ts` (2 × 2026 adentro)
- `src/lib/formulas/vtv-costo-provincias-2026.ts` (1 × 2026 adentro)

### evento (72)

> NO rollover: es contenido del evento (Mundial 2026, etc.). Post-evento evaluar 301 al hub temático o dejar como histórico.

- `src/content/blog/partidos-mundial-finde-11-julio-2026.json` (20 × 2026 adentro)
- `src/content/blog/partidos-mundial-finde-13-junio-2026.json` (21 × 2026 adentro)
- `src/content/blog/partidos-mundial-finde-20-junio-2026.json` (21 × 2026 adentro)
- `src/content/blog/partidos-mundial-finde-27-junio-2026.json` (21 × 2026 adentro)
- `src/content/blog/partidos-mundial-finde-4-julio-2026.json` (23 × 2026 adentro)
- `src/content/calcs-co/calculadora-cuota-moderadora-copago-eps-colombia-2026.json` (27 × 2026 adentro)
- `src/content/calcs/calculadora-derechos-tv-mundial-2026-argentina-espana-mexico-brasil.json` (33 × 2026 adentro)
- `src/content/calcs/calculadora-fantasy-mundial-2026-mejor-once.json` (15 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-bonus-jugador-fase.json` (40 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-botin-oro-goleador-estimador.json` (38 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-camiseta-precio-comparador.json` (38 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-cerveza-comida-estadio-precio.json` (30 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-comparador-selecciones-ranking.json` (24 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-costo-entrada-fase.json` (41 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-costo-viaje-miami-toronto-cdmx.json` (42 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-cupos-confederacion.json` (31 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-descanso-entre-partidos.json` (30 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-dias-hasta-debut-seleccion.json` (73 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-diferencia-gol-desempate.json` (30 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-en-que-canal-pasan-el-partido-por-pais.json` (41 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-estadios-comparador.json` (46 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-goles-argentina-repetir-titulo.json` (34 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-goles-prorroga-promedio.json` (20 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-grupo-muerte-detector.json` (49 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-partidos-faltantes-seleccion.json` (50 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-predictor-campeon-ranking.json` (34 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-probabilidad-ganar-penales.json` (17 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-puntos-clasificar-octavos.json` (41 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-quiniela-pool-probabilidad.json` (24 × 2026 adentro)
- `src/content/calcs/calculadora-mundial-2026-record-messi-goles-minutos.json` (51 × 2026 adentro)
- `src/content/calcs/calculadora-premios-mundial-2026-seleccion-por-fase.json` (48 × 2026 adentro)
- `src/content/calcs/cuanto-falta-mundial-fifa-2026-2030.json` (68 × 2026 adentro)
- `src/content/calcs/pami-prestaciones-monto-copago-2026.json` (13 × 2026 adentro)
- `src/content/historias/mundial-2026-lo-que-tenes-que-saber-hoy.json` (6 × 2026 adentro)
- `src/lib/formulas/cuanto-falta-mundial-fifa-2026-2030.ts` (13 × 2026 adentro)
- `src/lib/formulas/cuota-moderadora-copago-eps-colombia-2026.ts` (5 × 2026 adentro)
- `src/lib/formulas/derechos-tv-mundial-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/mundial-2026-bonus-jugador-fase.ts` (3 × 2026 adentro)
- `src/lib/formulas/mundial-2026-botin-oro-goleador-estimador.ts` (2 × 2026 adentro)
- `src/lib/formulas/mundial-2026-camiseta-precio-comparador.ts` (5 × 2026 adentro)
- `src/lib/formulas/mundial-2026-cerveza-comida-estadio-precio.ts` (4 × 2026 adentro)
- `src/lib/formulas/mundial-2026-comparador-selecciones.ts` (2 × 2026 adentro)
- `src/lib/formulas/mundial-2026-costo-entrada.ts` (5 × 2026 adentro)
- `src/lib/formulas/mundial-2026-costo-viaje.ts` (5 × 2026 adentro)
- `src/lib/formulas/mundial-2026-cupos-confederacion.ts` (6 × 2026 adentro)
- `src/lib/formulas/mundial-2026-descanso.ts` (2 × 2026 adentro)
- `src/lib/formulas/mundial-2026-dias-debut.ts` (26 × 2026 adentro)
- `src/lib/formulas/mundial-2026-diferencia-gol.ts` (2 × 2026 adentro)
- `src/lib/formulas/mundial-2026-en-que-canal-pasan-el-partido-por-pais.ts` (18 × 2026 adentro)
- `src/lib/formulas/mundial-2026-estadios-comparador.ts` (2 × 2026 adentro)
- `src/lib/formulas/mundial-2026-goles-argentina.ts` (2 × 2026 adentro)
- `src/lib/formulas/mundial-2026-goles-prorroga.ts` (2 × 2026 adentro)
- `src/lib/formulas/mundial-2026-grupo-muerte.ts` (2 × 2026 adentro)
- `src/lib/formulas/mundial-2026-messi-record.ts` (25 × 2026 adentro)
- `src/lib/formulas/mundial-2026-partidos-faltantes.ts` (4 × 2026 adentro)
- `src/lib/formulas/mundial-2026-predictor-campeon-ranking.ts` (4 × 2026 adentro)
- `src/lib/formulas/mundial-2026-probabilidad-penales.ts` (2 × 2026 adentro)
- `src/lib/formulas/mundial-2026-puntos-octavos.ts` (2 × 2026 adentro)
- `src/lib/formulas/mundial-2026-quiniela-pool-probabilidad.ts` (2 × 2026 adentro)
- `src/lib/formulas/pami-prestaciones-monto-copago-2026.ts` (1 × 2026 adentro)
- `src/lib/formulas/premios-mundial-2026-seleccion.ts` (6 × 2026 adentro)
- `src/pages/campeon-mundial-2026.astro` (35 × 2026 adentro)
- `src/pages/cuando-juega-[equipo]-mundial-2026.astro` (18 × 2026 adentro)
- `src/pages/cuando-juega-argentina-mundial-2026.astro` (17 × 2026 adentro)
- `src/pages/donde-ver-mundial-2026.astro` (33 × 2026 adentro)
- `src/pages/fixture-mundial-2026.astro` (40 × 2026 adentro)
- `src/pages/goleadores-mundial-2026.astro` (34 × 2026 adentro)
- `src/pages/llave-mundial-2026.astro` (16 × 2026 adentro)
- `src/pages/mundial-2026.astro` (64 × 2026 adentro)
- `src/pages/partidos-hoy-mundial-2026.astro` (33 × 2026 adentro)
- `src/pages/posiciones-mundial-2026.astro` (19 × 2026 adentro)
- `src/pages/pt/quando-joga-brasil-copa-2026.astro` (13 × 2026 adentro)

### contenido-fechado (25)

> Editorial fechado: NO rollover automático. Opcional escribir pieza 2027 nueva y cross-linkear.

- `src/content/blog-pt/ipca-maio-2026-quanto-voce-perdeu.json` (17 × 2026 adentro)
- `src/content/blog/aguinaldo-2026-plazo-fijo-dolar-uva-donde-conviene.json` (13 × 2026 adentro)
- `src/content/blog/aguinaldo-junio-2026-hasta-cuando-pagan.json` (21 × 2026 adentro)
- `src/content/blog/argentino-promedio-ganancias-2026.json` (37 × 2026 adentro)
- `src/content/blog/como-calcular-aguinaldo-2026.json` (45 × 2026 adentro)
- `src/content/blog/como-invertir-en-plazo-fijo-2026.json` (19 × 2026 adentro)
- `src/content/blog/costo-de-vida-argentina-2026.json` (29 × 2026 adentro)
- `src/content/blog/cuanto-cuesta-calefaccionar-casa-invierno-2026.json` (9 × 2026 adentro)
- `src/content/blog/escala-ganancias-2026-argentina-tabla-completa-explicada.json` (52 × 2026 adentro)
- `src/content/blog/finde-largo-10-julio-2026.json` (19 × 2026 adentro)
- `src/content/blog/finde-largo-13-junio-2026.json` (19 × 2026 adentro)
- `src/content/blog/finde-largo-9-julio-2026.json` (19 × 2026 adentro)
- `src/content/blog/ganancias-vencimiento-2026-prorroga-27-julio.json` (27 × 2026 adentro)
- `src/content/blog/guia-completa-monotributo-2026.json` (36 × 2026 adentro)
- `src/content/blog/inflacion-mayo-2026-cuanto-perdiste.json` (19 × 2026 adentro)
- `src/content/blog/informe-financiero-argentina-2026-04.json` (11 × 2026 adentro)
- `src/content/blog/informe-financiero-argentina-2026-05.json` (12 × 2026 adentro)
- `src/content/blog/informe-financiero-argentina-2026-06.json` (12 × 2026 adentro)
- `src/content/blog/informe-financiero-argentina-2026-07.json` (12 × 2026 adentro)
- `src/content/blog/recategorizacion-monotributo-julio-2026-guia-completa.json` (71 × 2026 adentro)
- `src/content/blog/sueldo-real-argentino-2026.json` (24 × 2026 adentro)
- `src/content/historias/aguinaldo-2026-como-se-calcula.json` (4 × 2026 adentro)
- `src/content/historias/aguinaldo-2026-plazo-fijo-dolar-uva.json` (4 × 2026 adentro)
- `src/content/historias/calefaccion-invierno-2026.json` (3 × 2026 adentro)
- `src/content/historias/recategorizacion-monotributo-julio-2026.json` (8 × 2026 adentro)

### dato-oficial (15)

> Esperar publicación oficial del dato 2027 (pipeline update-data). Recién ahí crear la versión 2027 + 301 de la 2026.

- `src/pages/cl/datos-sueldo-chile-2026.astro` (43 × 2026 adentro)
- `src/pages/co/datos-salario-minimo-colombia-2026.astro` (68 × 2026 adentro)
- `src/pages/datos-aguinaldo-2026.astro` (48 × 2026 adentro)
- `src/pages/datos-bienes-personales-2026.astro` (32 × 2026 adentro)
- `src/pages/datos-ganancias-2026.astro` (52 × 2026 adentro)
- `src/pages/datos-monotributo-2026.astro` (59 × 2026 adentro)
- `src/pages/datos-salario-basico-ecuador-2026.astro` (38 × 2026 adentro)
- `src/pages/datos-salario-minimo-latam-2026.astro` (91 × 2026 adentro)
- `src/pages/datos-topes-sipa-2026.astro` (42 × 2026 adentro)
- `src/pages/es/datos-cuota-autonomos-2026.astro` (45 × 2026 adentro)
- `src/pages/mx/datos-salario-minimo-mexico-2026.astro` (52 × 2026 adentro)
- `src/pages/pe/datos-sueldo-minimo-peru-2026.astro` (38 × 2026 adentro)
- `src/pages/pt/dados-inss-irrf-2026.astro` (50 × 2026 adentro)
- `src/pages/pt/dados-salario-minimo-brasil-2026.astro` (26 × 2026 adentro)
- `src/pages/vencimientos-afip-2026.astro` (45 × 2026 adentro)

### calendario-anual (13)

> Crear versión 2027 cuando el país publique el calendario oficial (2° semestre 2026). Mantener la 2026 hasta fin de año, después 301 → 2027.

- `src/content/blog/vacaciones-invierno-2026-cuanto-sale-presupuesto.json` (13 × 2026 adentro)
- `src/content/calcs/calculadora-vacunas-bebe-calendario-2026-argentina-edad.json` (34 × 2026 adentro)
- `src/content/calcs/feriados-argentina-2026.json` (46 × 2026 adentro)
- `src/content/historias/vacaciones-invierno-2026.json` (5 × 2026 adentro)
- `src/lib/formulas/calendario-vacunas-bebe-argentina-2026-completo.ts` (4 × 2026 adentro)
- `src/lib/formulas/feriados-argentina-2026.ts` (21 × 2026 adentro)
- `src/lib/formulas/vacunas-bebe-calendario-2026-argentina-edad.ts` (2 × 2026 adentro)
- `src/pages/feriados-chile-2026.astro` (5 × 2026 adentro)
- `src/pages/feriados-colombia-2026.astro` (7 × 2026 adentro)
- `src/pages/feriados-ecuador-2026.astro` (5 × 2026 adentro)
- `src/pages/feriados-mexico-2026.astro` (7 × 2026 adentro)
- `src/pages/feriados-peru-2026.astro` (7 × 2026 adentro)
- `src/pages/vacaciones-invierno-2026.astro` (37 × 2026 adentro)

### countdown-anual (10)

> Crear slug 2027 apenas pase la fecha + 301 del 2026 → 2027. Evaluar migrar a slug evergreen sin año (con los años como alias 301).

- `src/content/calcs-cl/calculadora-aguinaldo-fiestas-patrias-navidad-chile-2026.json` (26 × 2026 adentro)
- `src/content/calcs/calculadora-cuanto-falta-feriado-proximo-argentina-2026.json` (38 × 2026 adentro)
- `src/content/calcs/calculadora-cuanto-falta-fin-de-ano-2026-dias-horas-segundos.json` (47 × 2026 adentro)
- `src/content/calcs/calculadora-domingos-restantes-navidad-2026-fin-de-ano.json` (65 × 2026 adentro)
- `src/content/calcs/cuanto-falta-para-navidad.json` — slug contiene 2026 aunque el filename no
- `src/lib/formulas/aguinaldo-fiestas-patrias-navidad-chile-2026.ts`
- `src/lib/formulas/cuanto-falta-feriado-proximo-argentina-2026.ts` (9 × 2026 adentro)
- `src/lib/formulas/cuanto-falta-fin-de-año-2026-dias-horas-segundos.ts` (2 × 2026 adentro)
- `src/lib/formulas/domingos-restantes-navidad-2026-fin-de-año.ts` (2 × 2026 adentro)
- `src/pages/cuanto-falta-para-Navidad-2026.astro` (32 × 2026 adentro)

### evento-de-temporada (9)

> Página de ventana temporal: crear equivalente 2027 en su temporada + 301 de la 2026.

- `src/content/calcs-co/calculadora-intereses-cesantias-colombia-enero-2026.json` (15 × 2026 adentro)
- `src/content/calcs/calculadora-bono-anses-jubilados-junio-2026-aumento-mensual.json` (27 × 2026 adentro)
- `src/content/calcs/calculadora-monotributo-categoria-2026-recategorizacion-julio.json` (50 × 2026 adentro)
- `src/content/calcs/eclipse-solar-12-agosto-2026.json` (24 × 2026 adentro)
- `src/content/calcs/gratificacion-peru.json` — slug contiene 2026 aunque el filename no
- `src/lib/formulas/bono-anses-jubilados-junio-2026-aumento-mensual.ts` (9 × 2026 adentro)
- `src/lib/formulas/eclipse-solar-12-agosto-2026.ts` (6 × 2026 adentro)
- `src/lib/formulas/monotributo-categoria-2026-recategorizacion-julio.ts` (10 × 2026 adentro)
- `src/pages/recategorizacion-monotributo-julio-2026.astro` (49 × 2026 adentro)

## CLASE C — datos fiscales / data anual (1599 ítems, 497 archivos)

Dependen de publicación oficial (topes, alícuotas, escalas 2027). Rollover manual o vía pipeline update-data; NO bumpear el año sin actualizar los valores.

### Archivos de data anual (25)

- `src/data/seo/clusters.ts` (10 × 2026)
- `src/lib/data/brasil-2026.ts` (31 × 2026)
- `src/lib/data/chile-2026.ts` (18 × 2026)
- `src/lib/data/colombia-2026.ts` (72 × 2026)
- `src/lib/data/ecuador-2026.ts` (39 × 2026)
- `src/lib/data/feriados-ar-2026.ts` (33 × 2026)
- `src/lib/data/feriados-latam-2026.ts` (109 × 2026)
- `src/lib/data/inflacion-serie-ar.ts` (1 × 2026)
- `src/lib/data/ipca-br.ts` (8 × 2026)
- `src/lib/data/mexico-2026.ts` (97 × 2026)
- `src/lib/data/monotributo-2026.ts` (9 × 2026)
- `src/lib/data/mundial-2026-fixture.json` (107 × 2026)
- `src/lib/data/mundial-2026.ts` (11 × 2026)
- `src/lib/data/mundial-goleadores-historicos.ts` (36 × 2026)
- `src/lib/data/nafta-precios.ts` (3 × 2026)
- `src/lib/data/paraguay-2026.ts` (19 × 2026)
- `src/lib/data/peru-2026.ts` (12 × 2026)
- `src/lib/data/portugal-2026.ts` (34 × 2026)
- `src/lib/data/republica-dominicana-2026.ts` (33 × 2026)
- `src/lib/data/smvm-ar-2026.ts` (8 × 2026)
- `src/lib/data/uruguay-2026.ts` (40 × 2026)
- `src/lib/data/usa-2026.ts` (7 × 2026)
- `src/lib/data/vacaciones-invierno-ar-2026.ts` (64 × 2026)
- `src/lib/data/valores-vigentes.ts` (46 × 2026)
- `src/lib/data/venezuela-2026.ts` (19 × 2026)

### Ocurrencias fiscales en fórmulas (1574 en 472 archivos)

| Archivo | Ocurr. | Subtipos |
|---|---:|---|
| `src/lib/formulas/isr-rentas-de-capital-dividendos-intereses-colombia.ts` | 32 | identificador-con-año, import-data-anual |
| `src/lib/formulas/ingresos-no-constitutivos-renta-colombia-vivienda.ts` | 19 | identificador-con-año |
| `src/lib/formulas/licencia-maternidad-anses-90-dias-extension.ts` | 14 | identificador-con-año |
| `src/lib/formulas/pension-viudez-vs-pension-alimenticia-mexico.ts` | 14 | identificador-con-año, import-data-anual |
| `src/lib/formulas/sueldo-neto-colombia.ts` | 14 | identificador-con-año, import-data-anual |
| `src/lib/formulas/prima-vacacional-mexico-25-porcentaje-dias.ts` | 13 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-iva-portugal.ts` | 11 | identificador-con-año, import-data-anual |
| `src/lib/formulas/aguinaldo-mexico.ts` | 10 | identificador-con-año, import-data-anual |
| `src/lib/formulas/aporte-onp-afp-independiente-peru.ts` | 10 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-liquidacion-final-paraguay.ts` | 10 | identificador-con-año, import-data-anual |
| `src/lib/formulas/pension-imss-modalidad-40-mexico-aportacion.ts` | 10 | identificador-con-año, import-data-anual |
| `src/lib/formulas/salario-minimo-uruguay.ts` | 10 | identificador-con-año, import-data-anual |
| `src/lib/formulas/sueldo-neto-mexico.ts` | 10 | identificador-con-año, import-data-anual |
| `src/lib/data-freshness.ts` | 9 | import-data-anual |
| `src/lib/formulas/calculadora-irpf-uruguay.ts` | 9 | identificador-con-año |
| `src/lib/formulas/deduccion-gastos-medicos-mexico-personales-anual.ts` | 9 | identificador-con-año, import-data-anual |
| `src/lib/formulas/finiquito-mexico-completo-rescision-relacion.ts` | 9 | identificador-con-año |
| `src/lib/formulas/fonasa-chile-tramos-a-b-c-d-cobertura.ts` | 9 | identificador-con-año |
| `src/lib/formulas/imss-trabajadoras-hogar-mexico.ts` | 9 | identificador-con-año, import-data-anual |
| `src/lib/formulas/licencia-maternidad-mexico-imss-12-semanas.ts` | 9 | identificador-con-año, import-data-anual |
| `src/lib/formulas/pension-alimentos-peru.ts` | 9 | identificador-con-año, import-data-anual |
| `src/pages/co/index.astro` | 8 | identificador-con-año, import-data-anual |
| `src/lib/datos-export.ts` | 8 | import-data-anual, identificador-con-año |
| `src/lib/formulas/aguinaldo-proporcional-renuncia-mexico.ts` | 8 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-iva-uruguay.ts` | 8 | identificador-con-año, import-data-anual |
| `src/lib/formulas/gravamen-movimientos-financieros-4-1000-colombia.ts` | 8 | identificador-con-año, import-data-anual |
| `src/lib/formulas/hora-trabajo-jornal-paraguay.ts` | 8 | identificador-con-año, import-data-anual |
| `src/lib/formulas/idu-dividendos-paraguay.ts` | 8 | identificador-con-año, import-data-anual |
| `src/lib/formulas/isr-arrendamiento-arrendador-colombia-deducciones.ts` | 8 | identificador-con-año, import-data-anual |
| `src/lib/formulas/ptu-reparto-utilidades-mexico-10-porcentaje.ts` | 8 | identificador-con-año, import-data-anual |
| `src/lib/formulas/aporte-fondo-solidaridad-pension-fsp-colombia.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/formulas/bono-renta-chile-cuanto-vale-mi-tiempo-uf.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-salario-minimo-republica-dominicana.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/formulas/costo-vida-mensual-ecuador.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/formulas/devolucion-isr-anual-mexico.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/formulas/finiquito-renuncia-paraguay.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/formulas/gratificacion-legal-chile-25-porcentaje-4-75-utm.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/formulas/irpf-aguinaldo-uruguay.ts` | 7 | identificador-con-año |
| `src/lib/formulas/isr-aguinaldo-exento-gravado-mexico.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/formulas/isr-mensual-empleados-subsidio-empleo-mexico.ts` | 7 | identificador-con-año |
| `src/lib/formulas/modelo-347-operaciones-superiores-3005-espana.ts` | 7 | identificador-con-año |
| `src/lib/formulas/pension-alimentos-colombia-padre-divorcio-tabla.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/formulas/reforma-pensional-colombia-2025-pilares-ahorro.ts` | 7 | identificador-con-año |
| `src/lib/formulas/salario-liquido-dependentes.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/formulas/salario-por-hora-colombia.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/formulas/uma-conversion.ts` | 7 | identificador-con-año, import-data-anual |
| `src/lib/decisions/co/cuanto-cobrar-por-hora-independiente.ts` | 6 | identificador-con-año |
| `src/lib/formulas/calculadora-itbis-republica-dominicana.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-preaviso-paraguay.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-salario-neto-paraguay.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-subsidio-desemprego-portugal.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-vacaciones-paraguay.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/colegiaturas-deducibles-sat-mexico.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/decimo-terceiro-proporcional.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/decimo-terceiro-segunda-parcela.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/dolar-hoy-uruguay.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/empleada-domestica-paraguay.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/ferias-clt-integrais.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/ferias-proporcionais-clt.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/ganancia-ocasional-venta-casa-colombia.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuesto-renta-ecuador.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuesto-renta-quinta-categoria-peru.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuesto-salida-divisas-isd-ecuador.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/isr-arrendamiento-deduccion-ciega-mexico.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/jubilacion-iess-ecuador.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/liquidacion-despido-mexico-3-meses-12-dias.ts` | 6 | identificador-con-año |
| `src/lib/formulas/pcs-prestaciones-sociales-colombia-percent-salario.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/postnatal-prenatal-padre-chile-traspaso-6-semanas.ts` | 6 | identificador-con-año |
| `src/lib/formulas/prima-legal-colombia-30-dias-junio-diciembre.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/retencion-fuente-dependencia-ecuador.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/salario-bruto-do-liquido.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/salario-liquido-pensao.ts` | 6 | identificador-con-año, import-data-anual |
| `src/lib/formulas/smg-mexico-conversion.ts` | 6 | identificador-con-año, import-data-anual |
| `src/pages/mx/index.astro` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/afp-vs-onp-peru.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/asignacion-familiar-peru.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/bonificacion-familiar-paraguay.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-costo-vida-republica-dominicana.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-iass-uruguay.ts` | 5 | identificador-con-año |
| `src/lib/formulas/calculadora-imi-portugal.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-irae-uruguay.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-iva-paraguay.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-jornal-uruguay.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/canasta-familiar-colombia-dane-mes.ts` | 5 | identificador-con-año |
| `src/lib/formulas/comparador-comisiones-afp-peru.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/costo-laboral-total-empleador-ecuador.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/credito-leasing-habitacional-colombia-vs-hipoteca.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/cuenta-afc-ahorro-fomento-construccion-colombia.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/devolucion-fonasa-uruguay.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/erte-vs-ere-diferencias-cuantia-espana.ts` | 5 | identificador-con-año |
| `src/lib/formulas/essalud-aporte-peru.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/fondo-pensiones-voluntarias-colombia-deduccion-renta.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/honorarios-asimilados-vs-honorarios-libres-mexico.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuesto-cedular-arrendamiento-mexico.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuesto-circulacion-vehiculo-electrico-colombia.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuesto-herencias-legados-donaciones-ecuador.ts` | 5 | import-data-anual, identificador-con-año |
| `src/lib/formulas/imss-independientes-modalidad-10.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/inflacion-ipc.ts` | 5 | identificador-con-año |
| `src/lib/formulas/infonavit-descuento-sueldo.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/ingreso-anual-total-decimos-ecuador.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/ire-paraguay.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/irpf-anual-devolucion-uruguay.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/isr-acciones-bolsa-mexico-10-por-ciento.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/isr-retiro-ppr-afore-voluntario-anticipado-mexico.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/isr-venta-auto-usado-persona-fisica-mexico.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/isr-venta-casa-mexico-700000-udis.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/liquidacion-laboral-colombia-completa-cesantias.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/pension-imss-1997.ts` | 5 | identificador-con-año |
| `src/lib/formulas/regalia-pascual-proporcional-republica-dominicana.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/roth-vs-traditional-ira-calculator.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/sueldo-neto-peru.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/unidad-indexada-a-pesos-uruguay.ts` | 5 | identificador-con-año, import-data-anual |
| `src/lib/formulas/aguinaldo-proporcional-paraguay.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/alquiler-asequible-ingreso-peru.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/aporte-iess-ecuador.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/aporte-jubilatorio-uruguay.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/aporte-patronal-ips-paraguay.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/asignacion-familiar-pareja-no-casados-chile-derechos.ts` | 4 | identificador-con-año |
| `src/lib/formulas/calculadora-custo-trabalhador-entidade-empregadora-portugal.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-factor-integracion-salarial-imss-mexico.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-horas-extra-uruguay.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-horas-extraordinarias-portugal.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-horas-extras-paraguay.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-licencia-uruguay.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-recibos-verdes-trabalhador-independente-portugal.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-remesas-estados-unidos-republica-dominicana.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-retencion-islr-venezuela.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/canasta-basica-familiar-ecuador.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/cesantias-colombia-liquidacion.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/costo-laboral-empleador-paraguay.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/costo-laboral-total-empleador-peru.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/costo-vida-mensual-peru.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/cuantos-salarios-minimos-paraguay.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/descuento-ips-9-salario.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/devolucion-renta-quinta-categoria-peru.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/finiquito-liquidacion-mexico.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/finiquito-mexico-calculo.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/fp-grado-medio-superior-precio-publica-privada.ts` | 4 | identificador-con-año |
| `src/lib/formulas/gratificacion-julio-diciembre-peru.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuesto-predial-peru.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuesto-renta-arrendamiento-arrendador-chile.ts` | 4 | identificador-con-año |
| `src/lib/formulas/impuesto-segunda-categoria-anual-chile-rentas-altas.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuesto-vehicular-peru.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/indemnizacion-despido-paraguay.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/irpf-servicios-personales-uruguay.ts` | 4 | identificador-con-año |
| `src/lib/formulas/irrf-mensal-folha.ts` | 4 | identificador-con-año |
| `src/lib/formulas/licencia-conducir-chile-renovacion-precio-vencimiento.ts` | 4 | identificador-con-año |
| `src/lib/formulas/liquidacion-beneficios-sociales-peru.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/liquidacion-final-uruguay.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/pañales-mes-bebe-talle-gasto-anual.ts` | 4 | identificador-con-año |
| `src/lib/formulas/pension-alimenticia-ecuador.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/precio-dolares-a-bolivares-bcv-venezuela.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/predial-cdmx-mexico.ts` | 4 | identificador-con-año |
| `src/lib/formulas/prima-servicios-colombia.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/prima-vacacional-mexico.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/salario-diario-integrado-sdi-mexico.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/salario-digno-ecuador.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/side-hustle-tax-savings-calculator.ts` | 4 | identificador-con-año |
| `src/lib/formulas/sueldo-bruto-a-neto-ecuador.ts` | 4 | identificador-con-año, import-data-anual |
| `src/lib/formulas/sueldo-bruto-a-neto-peru.ts` | 4 | identificador-con-año, import-data-anual |
| `src/pages/cl/index.astro` | 3 | identificador-con-año, import-data-anual |
| `src/pages/do/index.astro` | 3 | identificador-con-año, import-data-anual |
| `src/pages/ec/index.astro` | 3 | identificador-con-año, import-data-anual |
| `src/pages/index.astro` | 3 | identificador-con-año, import-data-anual |
| `src/pages/pe/index.astro` | 3 | identificador-con-año, import-data-anual |
| `src/pages/pt-pt/index.astro` | 3 | identificador-con-año, import-data-anual |
| `src/pages/py/index.astro` | 3 | identificador-con-año, import-data-anual |
| `src/pages/uy/index.astro` | 3 | identificador-con-año, import-data-anual |
| `src/pages/ve/index.astro` | 3 | identificador-con-año, import-data-anual |
| `src/lib/decisions/co/cuanto-puedo-gastar-al-mes.ts` | 3 | identificador-con-año |
| `src/lib/formulas/antiguedad-laboral-venezuela.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/aporte-empleador-empleado-chile-total-costo-laboral.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/aporte-patronal-uruguay.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/aporte-voluntario-iess-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/aportes-arl-colombia-empleador-empleado-riesgo.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-aguinaldo-paraguay.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-bps-aportes.ts` | 3 | identificador-con-año |
| `src/lib/formulas/calculadora-brecha-dolar-bcv-paralelo.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-compensacao-despedimento-portugal.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-costo-vida-paraguay.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-cupo-gasolina-subsidiada-venezuela.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-despido-uruguay.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-igtf-venezuela-3.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-isr-republica-dominicana.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-iuc-portugal.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-iva-venezuela-16.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-liquidacion-finiquito-venezuela.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-mais-valias-venda-imovel-portugal.ts` | 3 | identificador-con-año |
| `src/lib/formulas/calculadora-pensao-reforma-seguranca-social-portugal.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-preaviso-venezuela.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-prestaciones-sociales-venezuela.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-remesa-zelle-bolivares-venezuela.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-retencion-isr-salario-republica-dominicana.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-salario-anual-14-meses-portugal.ts` | 3 | identificador-con-año |
| `src/lib/formulas/calculadora-salario-integral-venezuela.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-salario-liquido-portugal.ts` | 3 | identificador-con-año |
| `src/lib/formulas/calculadora-salario-minimo-portugal-hora.ts` | 3 | identificador-con-año |
| `src/lib/formulas/calculadora-subsidio-refeicao-portugal.ts` | 3 | identificador-con-año |
| `src/lib/formulas/calculadora-tss-afp-sfs-republica-dominicana.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-utilidades-aguinaldo-venezuela.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/calculadora-vacaciones-bono-vacacional-venezuela.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/canasta-basica-mexico-costo-mensual-familia.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/coste-notaria-compra-vivienda-espana.ts` | 3 | identificador-con-año |
| `src/lib/formulas/costo-constitucion-empresa-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/costo-empleador-uruguay.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/credito-hipotecario-peru.ts` | 3 | import-data-anual, identificador-con-año |
| `src/lib/formulas/cts-peru-calculo-deposito.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/cuanto-cuesta-llenar-tanque-gasolina-venezuela.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/cuanto-es-bolivares-en-dolares.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/cuanto-es-dolares-en-bolivares.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/cuanto-es-unidad-tributaria-bolivares.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/cuantos-feriados-restan-ano-argentina.ts` | 3 | identificador-con-año |
| `src/lib/formulas/decimo-cuarto-sueldo-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/decimos-mensualizado-vs-acumulado-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/descuento-pension-alimenticia-nomina-mexico.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/dolar-bcv-paralelo-bolivares-hoy.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/dolar-hoy-republica-dominicana.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/embargo-salario-colombia.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/ferias-1-3-empregado-clt.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/finiquito-chile-completo-causal-despido.ts` | 3 | identificador-con-año |
| `src/lib/formulas/finiquito-vs-liquidacion-comparador-mexico.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/fna-cesantias-colombia-vivienda-rentabilidad.ts` | 3 | identificador-con-año |
| `src/lib/formulas/fonasa-aporte-uruguay.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/fondos-de-reserva-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/fopep-pension-publica-colombia-cuantia.ts` | 3 | identificador-con-año |
| `src/lib/formulas/gpu-rental-cost-vast-runpod-calculator.ts` | 3 | identificador-con-año |
| `src/lib/formulas/gratificacion-trunca-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/igv-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuesto-aerolinea-chile-tasa-embarque-internacional.ts` | 3 | identificador-con-año |
| `src/lib/formulas/impuesto-alcabala-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuestos-aerolineas-tasa-aeropuerto-colombia-internacional.ts` | 3 | identificador-con-año |
| `src/lib/formulas/incapacidad-imss-enfermedad-general.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/incapacidad-medica-eps-colombia.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/indemnizacion-despido-sin-justa-causa-colombia.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/irp-paraguay-saldo-anual.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/irp-paraguay-tramos.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/isn-impuesto-nominas-mexico.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/isr-venta-terreno-inmueble-comercial-mexico.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/iva-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/jubilacion-patronal-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/liquidacion-haberes-finiquito-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/monotributo-categoria-ideal.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/monotributo-categoria-ingresos-tope.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/monotributo-colombia-pequenos-comercios.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/pension-imss-ley-73-mexico.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/pension-invalidez-imss-mexico.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/pj-vs-clt-comparador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/prestamo-quirografario-iess-ecuador.ts` | 3 | import-data-anual, identificador-con-año |
| `src/lib/formulas/prima-antiguedad-mexico.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/prima-dominical-dias-festivos-mexico.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/prima-riesgo-trabajo-imss-siniestralidad.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/pro-labore-socio.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/recargo-nocturno-ecuador.ts` | 3 | import-data-anual, identificador-con-año |
| `src/lib/formulas/recargo-nocturno-paraguay.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/recargo-nocturno-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/recargo-nocturno-republica-dominicana.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/recibo-agua-sedapal-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/regimen-especial-renta-rer-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/regimen-mype-tributario-rmt-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/renta-cuarta-categoria-honorarios-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/renta-presunta-chile-agricola-transporte-mineria.ts` | 3 | identificador-con-año |
| `src/lib/formulas/renta-segunda-categoria-ganancia-capital-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/retencion-honorarios-profesionales-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/retiro-afore-desempleo-mexico.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/retiro-cts-desempleo-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/revision-tecnica-vehicular-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/salario-liquido-clt-inss-irrf.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/salario-por-hora-mensual-diario-mexico.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/simulador-holerite-clt.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/soat-peru-precio.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/subsidio-enfermedad-iess-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/sueldo-empleados-comercio-cct-130-75.ts` | 3 | identificador-con-año |
| `src/lib/formulas/sueldo-neto-chile.ts` | 3 | identificador-con-año |
| `src/lib/formulas/sueldo-neto-deducciones-venezuela.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/sueldo-neto-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/tarifa-electrica-edenor-edesur-segmentacion-n1-n2-n3.ts` | 3 | identificador-con-año |
| `src/lib/formulas/utilidades-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/utilidades-tope-iess-ecuador.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/vacaciones-truncas-peru.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/verificacion-vehicular-mx.ts` | 3 | identificador-con-año, import-data-anual |
| `src/lib/formulas/13-salario-liquido-bruto-clt.ts` | 2 | identificador-con-año |
| `src/lib/formulas/aguinaldo-uruguay.ts` | 2 | identificador-con-año |
| `src/lib/formulas/aporte-previsional-solidario-aps-chile.ts` | 2 | identificador-con-año |
| `src/lib/formulas/aporte-trabajador-honorarios-chile-cotizacion-obligatoria.ts` | 2 | identificador-con-año |
| `src/lib/formulas/asignacion-zona-extrema-chile-aysen-magallanes-arica.ts` | 2 | identificador-con-año |
| `src/lib/formulas/bono-cumplimiento-laboral-chile-pago-empresa.ts` | 2 | identificador-con-año |
| `src/lib/formulas/bonos-estado-espana-rentabilidad-vencimiento.ts` | 2 | identificador-con-año |
| `src/lib/formulas/calculadora-irs-jovem-portugal.ts` | 2 | identificador-con-año |
| `src/lib/formulas/calculadora-subsidio-ferias-portugal.ts` | 2 | identificador-con-año |
| `src/lib/formulas/calculadora-subsidio-natal-portugal.ts` | 2 | identificador-con-año |
| `src/lib/formulas/credit-card-payoff-time-calculator.ts` | 2 | identificador-con-año |
| `src/lib/formulas/cripto-bitcoin-impuestos-mexico-isr-ganancia.ts` | 2 | identificador-con-año |
| `src/lib/formulas/cuenta-2-afp-chile-aporte-voluntario-rendimiento.ts` | 2 | identificador-con-año |
| `src/lib/formulas/decimo-tercer-sueldo-ecuador.ts` | 2 | identificador-con-año, import-data-anual |
| `src/lib/formulas/fecha-boda-ideal.ts` | 2 | identificador-con-año |
| `src/lib/formulas/hipoteca-mensual-cuota-fija.ts` | 2 | identificador-con-año |
| `src/lib/formulas/home-affordability-by-income-calculator.ts` | 2 | identificador-con-año |
| `src/lib/formulas/impuesto-herencias-donaciones-chile-tabla.ts` | 2 | identificador-con-año |
| `src/lib/formulas/impuesto-renta-empresa-regimen-general-peru.ts` | 2 | identificador-con-año, import-data-anual |
| `src/lib/formulas/impuesto-territorial-contribuciones-bienes-raices-chile.ts` | 2 | identificador-con-año |
| `src/lib/formulas/isr-sueldo-mexico.ts` | 2 | identificador-con-año |
| `src/lib/formulas/licencia-medica-chile-pago-subsidio-isapre-fonasa.ts` | 2 | identificador-con-año |
| `src/lib/formulas/licencia-paternidad-peru.ts` | 2 | identificador-con-año, import-data-anual |
| `src/lib/formulas/mortgage-payment-monthly-calculator.ts` | 2 | identificador-con-año |
| `src/lib/formulas/patente-auto-cordoba.ts` | 2 | identificador-con-año |
| `src/lib/formulas/paycheck-take-home-pay-calculator-usa.ts` | 2 | identificador-con-año |
| `src/lib/formulas/pension-rais-vs-prima-media-colombia.ts` | 2 | identificador-con-año |
| `src/lib/formulas/permiso-postnatal-chile-12-semanas-extension.ts` | 2 | identificador-con-año |
| `src/lib/formulas/planilla-luz-cnel-ecuador.ts` | 2 | identificador-con-año, import-data-anual |
| `src/lib/formulas/prima-de-antiguedad-mexico.ts` | 2 | identificador-con-año |
| `src/lib/formulas/pyme-chile-regimen-14d-tributacion-simplificada.ts` | 2 | identificador-con-año |
| `src/lib/formulas/revision-tecnica-vehicular-ecuador.ts` | 2 | identificador-con-año, import-data-anual |
| `src/lib/formulas/salario-vacacional-uruguay.ts` | 2 | identificador-con-año |
| `src/lib/formulas/seguro-cesantia-chile-afc-cuota-fondo.ts` | 2 | identificador-con-año |
| `src/lib/formulas/student-loan-payoff-time-calculator.ts` | 2 | identificador-con-año |
| `src/lib/formulas/sueldo-anual-republica-dominicana.ts` | 2 | identificador-con-año, import-data-anual |
| `src/lib/formulas/sueldo-docente-ademys-caba.ts` | 2 | identificador-con-año |
| `src/lib/mundial-live.ts` | 2 | import-data-anual |
| `src/components/CalcLayoutV2.astro` | 2 | identificador-con-año, import-data-anual |
| `src/components/ResultContext.astro` | 2 | identificador-con-año |
| `src/pages/aumento-jubilaciones.astro` | 1 | código-fiscal-sin-clasificar |
| `src/lib/decisions/monotributo-o-responsable-inscripto.ts` | 1 | import-data-anual |
| `src/lib/decisions/que-categoria-de-monotributo-me-corresponde.ts` | 1 | import-data-anual |
| `src/lib/formulas/401k-contribution-match-calculator.ts` | 1 | import-data-anual |
| `src/lib/formulas/abono-pis-pasep.ts` | 1 | import-data-anual |
| `src/lib/formulas/actualizacion-inflacion-inpc-venezuela.ts` | 1 | import-data-anual |
| `src/lib/formulas/actualizacion-inflacion-ipc-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/actualizacion-inflacion-ipc-paraguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/actualizacion-inflacion-ipc-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/actualizacion-inflacion-ipc-republica-dominicana.ts` | 1 | import-data-anual |
| `src/lib/formulas/actualizacion-inflacion-ipc-uruguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/anticipo-impuesto-renta-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/antiguedad-laboral-colombia.ts` | 1 | import-data-anual |
| `src/lib/formulas/antiguedad-laboral-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/antiguedad-laboral-paraguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/antiguedad-laboral-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/antiguedad-laboral-republica-dominicana.ts` | 1 | import-data-anual |
| `src/lib/formulas/antiguedad-laboral-uruguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/aposentadoria-inss-especial.ts` | 1 | import-data-anual |
| `src/lib/formulas/aposentadoria-inss-idade-progressiva.ts` | 1 | import-data-anual |
| `src/lib/formulas/aposentadoria-inss-idade.ts` | 1 | import-data-anual |
| `src/lib/formulas/aposentadoria-inss-pedagio-100.ts` | 1 | import-data-anual |
| `src/lib/formulas/aposentadoria-inss-pedagio-50.ts` | 1 | import-data-anual |
| `src/lib/formulas/aposentadoria-inss-pontos.ts` | 1 | import-data-anual |
| `src/lib/formulas/aposentadoria-inss-tempo-contrib.ts` | 1 | import-data-anual |
| `src/lib/formulas/aposentadoria-professor-inss.ts` | 1 | import-data-anual |
| `src/lib/formulas/arriendo-maximo-legal-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/articulo-86-retraso-prestaciones-republica-dominicana.ts` | 1 | import-data-anual |
| `src/lib/formulas/asignacion-desempleo-seguro-prestacion-anses.ts` | 1 | import-data-anual |
| `src/lib/formulas/auxilio-doenca-inss.ts` | 1 | import-data-anual |
| `src/lib/formulas/bono-nocturno-venezuela.ts` | 1 | import-data-anual |
| `src/lib/formulas/bonos-tesoro-chile-bcu-bce-rendimiento.ts` | 1 | identificador-con-año |
| `src/lib/formulas/bpc-idoso-deficiente.ts` | 1 | import-data-anual |
| `src/lib/formulas/calculadora-bonificacion-republica-dominicana.ts` | 1 | identificador-con-año |
| `src/lib/formulas/calculadora-horas-extras-republica-dominicana.ts` | 1 | identificador-con-año |
| `src/lib/formulas/calculadora-imt-compra-casa-portugal.ts` | 1 | import-data-anual |
| `src/lib/formulas/calculadora-liquidacion-republica-dominicana.ts` | 1 | identificador-con-año |
| `src/lib/formulas/calculadora-prestacao-credito-habitacao-portugal.ts` | 1 | import-data-anual |
| `src/lib/formulas/calculadora-vacaciones-republica-dominicana.ts` | 1 | identificador-con-año |
| `src/lib/formulas/canasta-basica-peru-inei.ts` | 1 | import-data-anual |
| `src/lib/formulas/cesantia-iess-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/cestaticket-bono-alimentacion-venezuela.ts` | 1 | import-data-anual |
| `src/lib/formulas/contribuciones-morosas-tgr-chile.ts` | 1 | import-data-anual |
| `src/lib/formulas/copago-bonificacion-fonasa-chile.ts` | 1 | import-data-anual |
| `src/lib/formulas/costo-construccion-m2-chile.ts` | 1 | import-data-anual |
| `src/lib/formulas/costo-construccion-m2-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/costo-construccion-m2-mexico.ts` | 1 | import-data-anual |
| `src/lib/formulas/costo-construccion-m2-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/costo-empleador-republica-dominicana.ts` | 1 | identificador-con-año |
| `src/lib/formulas/costo-universidad-privada-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/costo-universidad-privada-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/credito-consumo-bci-chile-cuota-cae.ts` | 1 | import-data-anual |
| `src/lib/formulas/credito-vehicular-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/cuanto-es-en-guaranies-peso-argentino.ts` | 1 | import-data-anual |
| `src/lib/formulas/cuanto-es-en-guaranies-real-brasileno.ts` | 1 | import-data-anual |
| `src/lib/formulas/cuota-prestamo-paraguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/deposito-plazo-fijo-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/deposito-plazo-fijo-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/descuento-tardanzas-faltas-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/despido-injustificado-republica-dominicana.ts` | 1 | identificador-con-año |
| `src/lib/formulas/detracciones-igv-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/doble-sueldo-republica-dominicana.ts` | 1 | identificador-con-año |
| `src/lib/formulas/dolar-hoy-paraguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/facturacion-maxima-monotributo.ts` | 1 | import-data-anual |
| `src/lib/formulas/fgts-compra-imovel.ts` | 1 | import-data-anual |
| `src/lib/formulas/fondo-desempleo-anses-monto-tiempo.ts` | 1 | import-data-anual |
| `src/lib/formulas/ganancias-monotributista-pase-regimen-general.ts` | 1 | import-data-anual |
| `src/lib/formulas/horario-de-verano-cambio-hora-por-pais.ts` | 1 | año-de-referencia-de-data |
| `src/lib/formulas/horas-extra-suplementarias-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/horas-extras-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/horas-extras-venezuela.ts` | 1 | import-data-anual |
| `src/lib/formulas/impuesto-1-5-por-mil-activos-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/impuesto-alcabala-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/impuesto-plusvalia-inmueble-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/impuesto-predial-ecuador.ts` | 1 | año-de-ejercicio-fiscal |
| `src/lib/formulas/impuesto-rodaje-vehiculos-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/impuesto-transferencia-inmobiliaria-republica-dominicana.ts` | 1 | import-data-anual |
| `src/lib/formulas/impuestos-monotributo-freelance.ts` | 1 | import-data-anual |
| `src/lib/formulas/inces-venezuela.ts` | 1 | import-data-anual |
| `src/lib/formulas/indemnizacion-despido-arbitrario-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/indemnizacion-despido-intempestivo-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/inss-autonomo-individual.ts` | 1 | import-data-anual |
| `src/lib/formulas/intereses-moratorios-sunat-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/intereses-prestaciones-sociales-venezuela.ts` | 1 | import-data-anual |
| `src/lib/formulas/ipi-republica-dominicana.ts` | 1 | import-data-anual |
| `src/lib/formulas/irpf-alquiler-uruguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/itf-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/itp-uruguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/jubilacion-bps-uruguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/jubilacion-ips-paraguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/licencia-maternidad-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/licencia-maternidad-subsidio-essalud-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/liquidacion-trabajadora-hogar-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/marbete-republica-dominicana.ts` | 1 | import-data-anual |
| `src/lib/formulas/matriculacion-vehicular-ecuador.ts` | 1 | año-de-ejercicio-fiscal |
| `src/lib/formulas/mei-das-mensal-comercio.ts` | 1 | import-data-anual |
| `src/lib/formulas/mei-das-mensal-servicos.ts` | 1 | import-data-anual |
| `src/lib/formulas/mei-das-mensal-transporte.ts` | 1 | import-data-anual |
| `src/lib/formulas/mei-limite-faturamento.ts` | 1 | import-data-anual |
| `src/lib/formulas/mei-migrar-me.ts` | 1 | import-data-anual |
| `src/lib/formulas/millas-latam-pass-acumulacion-valor-chile.ts` | 1 | import-data-anual |
| `src/lib/formulas/monotributo-uruguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/monotributo-vs-autonomo-vs-empleado-mismo-ingreso.ts` | 1 | import-data-anual |
| `src/lib/formulas/monotributo-vs-inscripto.ts` | 1 | import-data-anual |
| `src/lib/formulas/monotributo.ts` | 1 | import-data-anual |
| `src/lib/formulas/multa-interes-mora-sri-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/patente-municipal-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/patente-vehiculo-paraguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/pensao-por-morte-inss.ts` | 1 | import-data-anual |
| `src/lib/formulas/pension-65-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/pension-afp-republica-dominicana.ts` | 1 | identificador-con-año |
| `src/lib/formulas/pension-jubilacion-onp-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/pension-sobrevivencia-afp-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/plazo-fijo-paraguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/prestamo-hipotecario-republica-dominicana.ts` | 1 | import-data-anual |
| `src/lib/formulas/prestamo-personal-republica-dominicana.ts` | 1 | import-data-anual |
| `src/lib/formulas/prestamo-personal-tcea-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/rebaja-gastos-personales-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/recargo-nocturno-uruguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/recibo-luz-peru-osinergmin.ts` | 1 | import-data-anual |
| `src/lib/formulas/regalia-pascual-republica-dominicana.ts` | 1 | identificador-con-año |
| `src/lib/formulas/renta-primera-categoria-alquiler-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/retiro-afp-jubilacion-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/retiro-cesantia-cic-afc-chile.ts` | 1 | import-data-anual |
| `src/lib/formulas/retroactivo-aumento-sueldo-venezuela.ts` | 1 | import-data-anual |
| `src/lib/formulas/rimpe-emprendedor-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/rimpe-negocio-popular-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/rus-nuevo-regimen-unico-simplificado-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/salario-liquido-uruguay.ts` | 1 | identificador-con-año |
| `src/lib/formulas/salario-maternidade-inss.ts` | 1 | import-data-anual |
| `src/lib/formulas/salario-minimo.ts` | 1 | import-data-anual |
| `src/lib/formulas/salario-neto-republica-dominicana.ts` | 1 | identificador-con-año |
| `src/lib/formulas/salario-por-hora-chile.ts` | 1 | import-data-anual |
| `src/lib/formulas/salario-por-hora-dia-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/salario-por-hora-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/salario-por-hora-republica-dominicana.ts` | 1 | import-data-anual |
| `src/lib/formulas/salario-por-hora-uruguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/salario-por-hora-venezuela.ts` | 1 | import-data-anual |
| `src/lib/formulas/seguro-desemprego-valor.ts` | 1 | import-data-anual |
| `src/lib/formulas/sppat-seguro-accidentes-transito-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/subsidio-incapacidad-temporal-essalud-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/subsidio-maternidad-uruguay.ts` | 1 | import-data-anual |
| `src/lib/formulas/sueldo-autonomo-neto.ts` | 1 | import-data-anual |
| `src/lib/formulas/sueldo-bruto-a-neto-republica-dominicana.ts` | 1 | identificador-con-año |
| `src/lib/formulas/sueldo-nominal-a-liquido-uruguay.ts` | 1 | identificador-con-año |
| `src/lib/formulas/tarjeta-credito-pago-minimo-ecuador.ts` | 1 | import-data-anual |
| `src/lib/formulas/tarjeta-credito-pago-minimo-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/traspaso-vehiculo-republica-dominicana.ts` | 1 | import-data-anual |
| `src/lib/formulas/utilidades-peru.ts` | 1 | import-data-anual |
| `src/lib/formulas/vacaciones-ecuador.ts` | 1 | import-data-anual |
| `src/components/FeriadosLanding.astro` | 1 | import-data-anual |
| `src/components/LiveEconContext.astro` | 1 | import-data-anual |

## FECHA — fechas puntuales en código (371)

Countdown/objetivos con fecha completa. NO auto-bumpear: adelantar una fecha que todavía no pasó rompe el cálculo (ej: Navidad 2026 bumpeada en noviembre daría ~390 días). Revisar cada una DESPUÉS de que pase la fecha, o reescribir la fórmula para derivar el año de `new Date().getFullYear()`.

| Archivo | Línea | Código |
|---|---:|---|
| `src/components/CalcLayoutV2.astro` | 278 | `: (calc.slug.includes('mundial-2026') ¦¦ calc.slug === 'cuanto-falta-mundial-fifa-2026-2030' ¦¦ calc.slug ===…` |
| `src/components/CalendarioFeriados.astro` | 7 | `{ fecha: '2026-01-01', nombre: 'Año Nuevo', tipo: 'inamovible' },` |
| `src/components/CalendarioFeriados.astro` | 8 | `{ fecha: '2026-02-16', nombre: 'Carnaval', tipo: 'trasladable' },` |
| `src/components/CalendarioFeriados.astro` | 9 | `{ fecha: '2026-02-17', nombre: 'Carnaval', tipo: 'trasladable' },` |
| `src/components/CalendarioFeriados.astro` | 10 | `{ fecha: '2026-03-24', nombre: 'Día de la Memoria', tipo: 'inamovible' },` |
| `src/components/CalendarioFeriados.astro` | 11 | `{ fecha: '2026-04-02', nombre: 'Día del Veterano (Malvinas)', tipo: 'inamovible' },` |
| `src/components/CalendarioFeriados.astro` | 12 | `{ fecha: '2026-04-03', nombre: 'Viernes Santo', tipo: 'inamovible' },` |
| `src/components/CalendarioFeriados.astro` | 13 | `{ fecha: '2026-05-01', nombre: 'Día del Trabajador', tipo: 'inamovible' },` |
| `src/components/CalendarioFeriados.astro` | 14 | `{ fecha: '2026-05-25', nombre: 'Revolución de Mayo', tipo: 'inamovible' },` |
| `src/components/CalendarioFeriados.astro` | 15 | `{ fecha: '2026-06-15', nombre: 'Paso a la Inmortalidad Gral. Güemes', tipo: 'trasladable' },` |
| `src/components/CalendarioFeriados.astro` | 16 | `{ fecha: '2026-06-20', nombre: 'Paso a la Inmortalidad Gral. Belgrano', tipo: 'inamovible' },` |
| `src/components/CalendarioFeriados.astro` | 17 | `{ fecha: '2026-07-09', nombre: 'Día de la Independencia', tipo: 'inamovible' },` |
| `src/components/CalendarioFeriados.astro` | 18 | `{ fecha: '2026-08-17', nombre: 'Paso a la Inmortalidad Gral. San Martín', tipo: 'trasladable' },` |
| `src/components/CalendarioFeriados.astro` | 19 | `{ fecha: '2026-10-12', nombre: 'Día del Respeto a la Diversidad Cultural', tipo: 'trasladable' },` |
| `src/components/CalendarioFeriados.astro` | 20 | `{ fecha: '2026-11-20', nombre: 'Día de la Soberanía Nacional', tipo: 'trasladable' },` |
| `src/components/CalendarioFeriados.astro` | 21 | `{ fecha: '2026-12-08', nombre: 'Inmaculada Concepción de María', tipo: 'no-laborable' },` |
| `src/components/CalendarioFeriados.astro` | 22 | `{ fecha: '2026-12-25', nombre: 'Navidad', tipo: 'inamovible' },` |
| `src/components/DateRangePresetsTable.astro` | 148 | `"2026-01-01", "2026-02-16", "2026-02-17", "2026-03-24",` |
| `src/components/DateRangePresetsTable.astro` | 148 | `"2026-01-01", "2026-02-16", "2026-02-17", "2026-03-24",` |
| `src/components/DateRangePresetsTable.astro` | 148 | `"2026-01-01", "2026-02-16", "2026-02-17", "2026-03-24",` |
| `src/components/DateRangePresetsTable.astro` | 148 | `"2026-01-01", "2026-02-16", "2026-02-17", "2026-03-24",` |
| `src/components/DateRangePresetsTable.astro` | 149 | `"2026-04-02", "2026-04-03", "2026-05-01", "2026-05-25",` |
| `src/components/DateRangePresetsTable.astro` | 149 | `"2026-04-02", "2026-04-03", "2026-05-01", "2026-05-25",` |
| `src/components/DateRangePresetsTable.astro` | 149 | `"2026-04-02", "2026-04-03", "2026-05-01", "2026-05-25",` |
| `src/components/DateRangePresetsTable.astro` | 149 | `"2026-04-02", "2026-04-03", "2026-05-01", "2026-05-25",` |
| `src/components/DateRangePresetsTable.astro` | 150 | `"2026-06-15", "2026-06-22", "2026-07-09", "2026-08-17",` |
| `src/components/DateRangePresetsTable.astro` | 150 | `"2026-06-15", "2026-06-22", "2026-07-09", "2026-08-17",` |
| `src/components/DateRangePresetsTable.astro` | 150 | `"2026-06-15", "2026-06-22", "2026-07-09", "2026-08-17",` |
| `src/components/DateRangePresetsTable.astro` | 150 | `"2026-06-15", "2026-06-22", "2026-07-09", "2026-08-17",` |
| `src/components/DateRangePresetsTable.astro` | 151 | `"2026-10-12", "2026-11-23", "2026-12-08", "2026-12-25"` |
| `src/components/DateRangePresetsTable.astro` | 151 | `"2026-10-12", "2026-11-23", "2026-12-08", "2026-12-25"` |
| `src/components/DateRangePresetsTable.astro` | 151 | `"2026-10-12", "2026-11-23", "2026-12-08", "2026-12-25"` |
| `src/components/DateRangePresetsTable.astro` | 151 | `"2026-10-12", "2026-11-23", "2026-12-08", "2026-12-25"` |
| `src/components/Header.astro` | 91 | `{ href: '/mx/calculadora-aguinaldo-mexico-2026-15-dias-tope-30', label: 'Aguinaldo', activePath: '/mx/calcula…` |
| `src/layouts/Layout.astro` | 413 | `2026-05-25: REMOVIDO ’noarchive’ porque bloqueaba Copilot/grounding results` |
| `src/layouts/Layout.astro` | 624 | `de JS unused sin agregar funcionalidad. (PSI audit 2026-05-19: confirmado). -->` |
| `src/lib/datos-export.ts` | 131 | `temporalCoverage: '2026-01/2026-06',` |
| `src/lib/datos-export.ts` | 131 | `temporalCoverage: '2026-01/2026-06',` |
| `src/lib/datos-export.ts` | 173 | `source: 'ANSES — Resolución 139/2026 (Ley 24.241)',` |
| `src/lib/datos-export.ts` | 175 | `temporalCoverage: '2026-06',` |
| `src/lib/datos-export.ts` | 227 | `fechas_pago_2026: { primera_cuota_limite: '2026-06-30', segunda_cuota_limite: '2026-12-18', tolerancia_dias_h…` |
| `src/lib/datos-export.ts` | 227 | `fechas_pago_2026: { primera_cuota_limite: '2026-06-30', segunda_cuota_limite: '2026-12-18', tolerancia_dias_h…` |
| `src/lib/datos-export.ts` | 243 | `{ pais: 'Brasil', iso: 'BR', instrumento: 'Salário mínimo nacional', valor_mensual: round2(SM_BR), moneda: 'B…` |
| `src/lib/datos-export.ts` | 245 | `{ pais: 'Ecuador', iso: 'EC', instrumento: 'Salario Básico Unificado (SBU)', valor_mensual: ECUADOR_2026.sbu,…` |
| `src/lib/decisions/cl/cuando-alcanzo-mi-meta-de-ahorro.ts` | 49 | `const d = new Date(2026, 6, 1); // jul 2026 (referencia)` |
| `src/lib/decisions/co/cuando-alcanzo-mi-meta-de-ahorro.ts` | 49 | `const d = new Date(2026, 6, 1); // jul 2026 (referencia)` |
| `src/lib/decisions/co/cuanto-cobrar-por-hora-independiente.ts` | 177 | `{ slug: 'co/calculadora-ibc-independientes-contratista-colombia-2026-40-porciento', label: 'IBC del independi…` |
| `src/lib/decisions/cuando-alcanzo-mi-meta-de-ahorro.ts` | 51 | `const d = new Date(2026, 5, 1); // jun 2026 (referencia 2026-06)` |
| `src/lib/decisions/mx/cuando-alcanzo-mi-meta-de-ahorro.ts` | 53 | `const d = new Date(2026, 6, 1); // jul 2026 (referencia 2026-07)` |
| `src/lib/decisions/mx/cuanto-fondo-de-emergencia-necesito.ts` | 198 | `{ slug: 'mx/calculadora-aguinaldo-mexico-2026-15-dias-tope-30', label: 'Aguinaldo 2026' },` |
| `src/lib/decisions/pe/cuando-alcanzo-mi-meta-de-ahorro.ts` | 51 | `const d = new Date(2026, 6, 1); // jul 2026 (referencia 2026-07)` |
| `src/lib/formulas/_bcra-icl.ts` | 7 | `export const ICL_LAST_UPDATED = '2026-07-07';` |
| `src/lib/formulas/_bcra-icl.ts` | 2021 | `'2026-01-01',` |
| `src/lib/formulas/_bcra-icl.ts` | 2022 | `'2026-01-02',` |
| `src/lib/formulas/_bcra-icl.ts` | 2023 | `'2026-01-03',` |
| `src/lib/formulas/_bcra-icl.ts` | 2024 | `'2026-01-04',` |
| `src/lib/formulas/_bcra-icl.ts` | 2025 | `'2026-01-05',` |
| `src/lib/formulas/_bcra-icl.ts` | 2026 | `'2026-01-06',` |
| `src/lib/formulas/_bcra-icl.ts` | 2027 | `'2026-01-07',` |
| `src/lib/formulas/_bcra-icl.ts` | 2028 | `'2026-01-08',` |
| `src/lib/formulas/_bcra-icl.ts` | 2029 | `'2026-01-09',` |
| `src/lib/formulas/_bcra-icl.ts` | 2030 | `'2026-01-10',` |
| `src/lib/formulas/_bcra-icl.ts` | 2031 | `'2026-01-11',` |
| `src/lib/formulas/_bcra-icl.ts` | 2032 | `'2026-01-12',` |
| `src/lib/formulas/_bcra-icl.ts` | 2033 | `'2026-01-13',` |
| `src/lib/formulas/_bcra-icl.ts` | 2034 | `'2026-01-14',` |
| `src/lib/formulas/_bcra-icl.ts` | 2035 | `'2026-01-15',` |
| `src/lib/formulas/_bcra-icl.ts` | 2036 | `'2026-01-16',` |
| `src/lib/formulas/_bcra-icl.ts` | 2037 | `'2026-01-17',` |
| `src/lib/formulas/_bcra-icl.ts` | 2038 | `'2026-01-18',` |
| `src/lib/formulas/_bcra-icl.ts` | 2039 | `'2026-01-19',` |
| `src/lib/formulas/_bcra-icl.ts` | 2040 | `'2026-01-20',` |
| `src/lib/formulas/_bcra-icl.ts` | 2041 | `'2026-01-21',` |
| `src/lib/formulas/_bcra-icl.ts` | 2042 | `'2026-01-22',` |
| `src/lib/formulas/_bcra-icl.ts` | 2043 | `'2026-01-23',` |
| `src/lib/formulas/_bcra-icl.ts` | 2044 | `'2026-01-24',` |
| `src/lib/formulas/_bcra-icl.ts` | 2045 | `'2026-01-25',` |
| `src/lib/formulas/_bcra-icl.ts` | 2046 | `'2026-01-26',` |
| `src/lib/formulas/_bcra-icl.ts` | 2047 | `'2026-01-27',` |
| `src/lib/formulas/_bcra-icl.ts` | 2048 | `'2026-01-28',` |
| `src/lib/formulas/_bcra-icl.ts` | 2049 | `'2026-01-29',` |
| `src/lib/formulas/_bcra-icl.ts` | 2050 | `'2026-01-30',` |
| `src/lib/formulas/_bcra-icl.ts` | 2051 | `'2026-01-31',` |
| `src/lib/formulas/_bcra-icl.ts` | 2052 | `'2026-02-01',` |
| `src/lib/formulas/_bcra-icl.ts` | 2053 | `'2026-02-02',` |
| `src/lib/formulas/_bcra-icl.ts` | 2054 | `'2026-02-03',` |
| `src/lib/formulas/_bcra-icl.ts` | 2055 | `'2026-02-04',` |
| `src/lib/formulas/_bcra-icl.ts` | 2056 | `'2026-02-05',` |
| `src/lib/formulas/_bcra-icl.ts` | 2057 | `'2026-02-06',` |
| `src/lib/formulas/_bcra-icl.ts` | 2058 | `'2026-02-07',` |
| `src/lib/formulas/_bcra-icl.ts` | 2059 | `'2026-02-08',` |
| `src/lib/formulas/_bcra-icl.ts` | 2060 | `'2026-02-09',` |
| `src/lib/formulas/_bcra-icl.ts` | 2061 | `'2026-02-10',` |
| `src/lib/formulas/_bcra-icl.ts` | 2062 | `'2026-02-11',` |
| `src/lib/formulas/_bcra-icl.ts` | 2063 | `'2026-02-12',` |
| `src/lib/formulas/_bcra-icl.ts` | 2064 | `'2026-02-13',` |
| `src/lib/formulas/_bcra-icl.ts` | 2065 | `'2026-02-14',` |
| `src/lib/formulas/_bcra-icl.ts` | 2066 | `'2026-02-15',` |
| `src/lib/formulas/_bcra-icl.ts` | 2067 | `'2026-02-16',` |
| `src/lib/formulas/_bcra-icl.ts` | 2068 | `'2026-02-17',` |
| `src/lib/formulas/_bcra-icl.ts` | 2069 | `'2026-02-18',` |
| `src/lib/formulas/_bcra-icl.ts` | 2070 | `'2026-02-19',` |
| `src/lib/formulas/_bcra-icl.ts` | 2071 | `'2026-02-20',` |
| `src/lib/formulas/_bcra-icl.ts` | 2072 | `'2026-02-21',` |
| `src/lib/formulas/_bcra-icl.ts` | 2073 | `'2026-02-22',` |
| `src/lib/formulas/_bcra-icl.ts` | 2074 | `'2026-02-23',` |
| `src/lib/formulas/_bcra-icl.ts` | 2075 | `'2026-02-24',` |
| `src/lib/formulas/_bcra-icl.ts` | 2076 | `'2026-02-25',` |
| `src/lib/formulas/_bcra-icl.ts` | 2077 | `'2026-02-26',` |
| `src/lib/formulas/_bcra-icl.ts` | 2078 | `'2026-02-27',` |
| `src/lib/formulas/_bcra-icl.ts` | 2079 | `'2026-02-28',` |
| `src/lib/formulas/_bcra-icl.ts` | 2080 | `'2026-03-01',` |
| `src/lib/formulas/_bcra-icl.ts` | 2081 | `'2026-03-02',` |
| `src/lib/formulas/_bcra-icl.ts` | 2082 | `'2026-03-03',` |
| `src/lib/formulas/_bcra-icl.ts` | 2083 | `'2026-03-04',` |
| `src/lib/formulas/_bcra-icl.ts` | 2084 | `'2026-03-05',` |
| `src/lib/formulas/_bcra-icl.ts` | 2085 | `'2026-03-06',` |
| `src/lib/formulas/_bcra-icl.ts` | 2086 | `'2026-03-07',` |
| `src/lib/formulas/_bcra-icl.ts` | 2087 | `'2026-03-08',` |
| `src/lib/formulas/_bcra-icl.ts` | 2088 | `'2026-03-09',` |
| `src/lib/formulas/_bcra-icl.ts` | 2089 | `'2026-03-10',` |
| `src/lib/formulas/_bcra-icl.ts` | 2090 | `'2026-03-11',` |
| `src/lib/formulas/_bcra-icl.ts` | 2091 | `'2026-03-12',` |
| `src/lib/formulas/_bcra-icl.ts` | 2092 | `'2026-03-13',` |
| `src/lib/formulas/_bcra-icl.ts` | 2093 | `'2026-03-14',` |
| `src/lib/formulas/_bcra-icl.ts` | 2094 | `'2026-03-15',` |
| `src/lib/formulas/_bcra-icl.ts` | 2095 | `'2026-03-16',` |
| `src/lib/formulas/_bcra-icl.ts` | 2096 | `'2026-03-17',` |
| `src/lib/formulas/_bcra-icl.ts` | 2097 | `'2026-03-18',` |
| `src/lib/formulas/_bcra-icl.ts` | 2098 | `'2026-03-19',` |
| `src/lib/formulas/_bcra-icl.ts` | 2099 | `'2026-03-20',` |
| `src/lib/formulas/_bcra-icl.ts` | 2100 | `'2026-03-21',` |
| `src/lib/formulas/_bcra-icl.ts` | 2101 | `'2026-03-22',` |
| `src/lib/formulas/_bcra-icl.ts` | 2102 | `'2026-03-23',` |
| `src/lib/formulas/_bcra-icl.ts` | 2103 | `'2026-03-24',` |
| `src/lib/formulas/_bcra-icl.ts` | 2104 | `'2026-03-25',` |
| `src/lib/formulas/_bcra-icl.ts` | 2105 | `'2026-03-26',` |
| `src/lib/formulas/_bcra-icl.ts` | 2106 | `'2026-03-27',` |
| `src/lib/formulas/_bcra-icl.ts` | 2107 | `'2026-03-28',` |
| `src/lib/formulas/_bcra-icl.ts` | 2108 | `'2026-03-29',` |
| `src/lib/formulas/_bcra-icl.ts` | 2109 | `'2026-03-30',` |
| `src/lib/formulas/_bcra-icl.ts` | 2110 | `'2026-03-31',` |
| `src/lib/formulas/_bcra-icl.ts` | 2111 | `'2026-04-01',` |
| `src/lib/formulas/_bcra-icl.ts` | 2112 | `'2026-04-02',` |
| `src/lib/formulas/_bcra-icl.ts` | 2113 | `'2026-04-03',` |
| `src/lib/formulas/_bcra-icl.ts` | 2114 | `'2026-04-04',` |
| `src/lib/formulas/_bcra-icl.ts` | 2115 | `'2026-04-05',` |
| `src/lib/formulas/_bcra-icl.ts` | 2116 | `'2026-04-06',` |
| `src/lib/formulas/_bcra-icl.ts` | 2117 | `'2026-04-07',` |
| `src/lib/formulas/_bcra-icl.ts` | 2118 | `'2026-04-08',` |
| `src/lib/formulas/_bcra-icl.ts` | 2119 | `'2026-04-09',` |
| `src/lib/formulas/_bcra-icl.ts` | 2120 | `'2026-04-10',` |
| `src/lib/formulas/_bcra-icl.ts` | 2121 | `'2026-04-11',` |
| `src/lib/formulas/_bcra-icl.ts` | 2122 | `'2026-04-12',` |
| `src/lib/formulas/_bcra-icl.ts` | 2123 | `'2026-04-13',` |
| `src/lib/formulas/_bcra-icl.ts` | 2124 | `'2026-04-14',` |
| `src/lib/formulas/_bcra-icl.ts` | 2125 | `'2026-04-15',` |
| `src/lib/formulas/_bcra-icl.ts` | 2126 | `'2026-04-16',` |
| `src/lib/formulas/_bcra-icl.ts` | 2127 | `'2026-04-17',` |
| `src/lib/formulas/_bcra-icl.ts` | 2128 | `'2026-04-18',` |
| `src/lib/formulas/_bcra-icl.ts` | 2129 | `'2026-04-19',` |
| `src/lib/formulas/_bcra-icl.ts` | 2130 | `'2026-04-20',` |
| `src/lib/formulas/_bcra-icl.ts` | 2131 | `'2026-04-21',` |
| `src/lib/formulas/_bcra-icl.ts` | 2132 | `'2026-04-22',` |
| `src/lib/formulas/_bcra-icl.ts` | 2133 | `'2026-04-23',` |
| `src/lib/formulas/_bcra-icl.ts` | 2134 | `'2026-04-24',` |
| `src/lib/formulas/_bcra-icl.ts` | 2135 | `'2026-04-25',` |
| `src/lib/formulas/_bcra-icl.ts` | 2136 | `'2026-04-26',` |
| `src/lib/formulas/_bcra-icl.ts` | 2137 | `'2026-04-27',` |
| `src/lib/formulas/_bcra-icl.ts` | 2138 | `'2026-04-28',` |
| `src/lib/formulas/_bcra-icl.ts` | 2139 | `'2026-04-29',` |
| `src/lib/formulas/_bcra-icl.ts` | 2140 | `'2026-04-30',` |
| `src/lib/formulas/_bcra-icl.ts` | 2141 | `'2026-05-01',` |
| `src/lib/formulas/_bcra-icl.ts` | 2142 | `'2026-05-02',` |
| `src/lib/formulas/_bcra-icl.ts` | 2143 | `'2026-05-03',` |
| `src/lib/formulas/_bcra-icl.ts` | 2144 | `'2026-05-04',` |
| `src/lib/formulas/_bcra-icl.ts` | 2145 | `'2026-05-05',` |
| `src/lib/formulas/_bcra-icl.ts` | 2146 | `'2026-05-06',` |
| `src/lib/formulas/_bcra-icl.ts` | 2147 | `'2026-05-07',` |
| `src/lib/formulas/_bcra-icl.ts` | 2148 | `'2026-05-08',` |
| `src/lib/formulas/_bcra-icl.ts` | 2149 | `'2026-05-09',` |
| `src/lib/formulas/_bcra-icl.ts` | 2150 | `'2026-05-10',` |
| `src/lib/formulas/_bcra-icl.ts` | 2151 | `'2026-05-11',` |
| `src/lib/formulas/_bcra-icl.ts` | 2152 | `'2026-05-12',` |
| `src/lib/formulas/_bcra-icl.ts` | 2153 | `'2026-05-13',` |
| `src/lib/formulas/_bcra-icl.ts` | 2154 | `'2026-05-14',` |
| `src/lib/formulas/_bcra-icl.ts` | 2155 | `'2026-05-15',` |
| `src/lib/formulas/_bcra-icl.ts` | 2156 | `'2026-05-16',` |
| `src/lib/formulas/_bcra-icl.ts` | 2157 | `'2026-05-17',` |
| `src/lib/formulas/_bcra-icl.ts` | 2158 | `'2026-05-18',` |
| `src/lib/formulas/_bcra-icl.ts` | 2159 | `'2026-05-19',` |
| `src/lib/formulas/_bcra-icl.ts` | 2160 | `'2026-05-20',` |
| `src/lib/formulas/_bcra-icl.ts` | 2161 | `'2026-05-21',` |
| `src/lib/formulas/_bcra-icl.ts` | 2162 | `'2026-05-22',` |
| `src/lib/formulas/_bcra-icl.ts` | 2163 | `'2026-05-23',` |
| `src/lib/formulas/_bcra-icl.ts` | 2164 | `'2026-05-24',` |
| `src/lib/formulas/_bcra-icl.ts` | 2165 | `'2026-05-25',` |
| `src/lib/formulas/_bcra-icl.ts` | 2166 | `'2026-05-26',` |
| `src/lib/formulas/_bcra-icl.ts` | 2167 | `'2026-05-27',` |
| `src/lib/formulas/_bcra-icl.ts` | 2168 | `'2026-05-28',` |
| `src/lib/formulas/_bcra-icl.ts` | 2169 | `'2026-05-29',` |
| `src/lib/formulas/_bcra-icl.ts` | 2170 | `'2026-05-30',` |
| `src/lib/formulas/_bcra-icl.ts` | 2171 | `'2026-05-31',` |
| `src/lib/formulas/_bcra-icl.ts` | 2172 | `'2026-06-01',` |
| `src/lib/formulas/_bcra-icl.ts` | 2173 | `'2026-06-02',` |
| `src/lib/formulas/_bcra-icl.ts` | 2174 | `'2026-06-03',` |
| `src/lib/formulas/_bcra-icl.ts` | 2175 | `'2026-06-04',` |
| `src/lib/formulas/_bcra-icl.ts` | 2176 | `'2026-06-05',` |
| `src/lib/formulas/_bcra-icl.ts` | 2177 | `'2026-06-06',` |
| `src/lib/formulas/_bcra-icl.ts` | 2178 | `'2026-06-07',` |
| `src/lib/formulas/_bcra-icl.ts` | 2179 | `'2026-06-08',` |
| `src/lib/formulas/_bcra-icl.ts` | 2180 | `'2026-06-09',` |
| `src/lib/formulas/_bcra-icl.ts` | 2181 | `'2026-06-10',` |
| `src/lib/formulas/_bcra-icl.ts` | 2182 | `'2026-06-11',` |
| `src/lib/formulas/_bcra-icl.ts` | 2183 | `'2026-06-12',` |
| `src/lib/formulas/_bcra-icl.ts` | 2184 | `'2026-06-13',` |
| `src/lib/formulas/_bcra-icl.ts` | 2185 | `'2026-06-14',` |
| `src/lib/formulas/_bcra-icl.ts` | 2186 | `'2026-06-15',` |
| `src/lib/formulas/_bcra-icl.ts` | 2187 | `'2026-06-16',` |
| `src/lib/formulas/_bcra-icl.ts` | 2188 | `'2026-06-17',` |
| `src/lib/formulas/_bcra-icl.ts` | 2189 | `'2026-06-18',` |
| `src/lib/formulas/_bcra-icl.ts` | 2190 | `'2026-06-19',` |
| `src/lib/formulas/_bcra-icl.ts` | 2191 | `'2026-06-20',` |
| `src/lib/formulas/_bcra-icl.ts` | 2192 | `'2026-06-21',` |
| `src/lib/formulas/_bcra-icl.ts` | 2193 | `'2026-06-22',` |
| `src/lib/formulas/_bcra-icl.ts` | 2194 | `'2026-06-23',` |
| `src/lib/formulas/_bcra-icl.ts` | 2195 | `'2026-06-24',` |
| `src/lib/formulas/_bcra-icl.ts` | 2196 | `'2026-06-25',` |
| `src/lib/formulas/_bcra-icl.ts` | 2197 | `'2026-06-26',` |
| `src/lib/formulas/_bcra-icl.ts` | 2198 | `'2026-06-27',` |
| `src/lib/formulas/_bcra-icl.ts` | 2199 | `'2026-06-28',` |
| `src/lib/formulas/_bcra-icl.ts` | 2200 | `'2026-06-29',` |
| `src/lib/formulas/_bcra-icl.ts` | 2201 | `'2026-06-30',` |
| `src/lib/formulas/_bcra-icl.ts` | 2202 | `'2026-07-01',` |
| `src/lib/formulas/_bcra-icl.ts` | 2203 | `'2026-07-02',` |
| `src/lib/formulas/_bcra-icl.ts` | 2204 | `'2026-07-03',` |
| `src/lib/formulas/_bcra-icl.ts` | 2205 | `'2026-07-04',` |
| `src/lib/formulas/_bcra-icl.ts` | 2206 | `'2026-07-05',` |
| `src/lib/formulas/_bcra-icl.ts` | 2207 | `'2026-07-06',` |
| `src/lib/formulas/_bcra-icl.ts` | 2208 | `'2026-07-07',` |
| `src/lib/formulas/antiguedad-laboral-colombia.ts` | 45 | `fechaHasta = new Date(2026, 6, 6); // hoy: 2026-07-06` |
| `src/lib/formulas/antiguedad-laboral-ecuador.ts` | 45 | `fechaHasta = new Date(2026, 6, 6); // hoy: 2026-07-06` |
| `src/lib/formulas/antiguedad-laboral-espana.ts` | 47 | `fechaHasta = new Date(2026, 6, 6); // hoy: 2026-07-06` |
| `src/lib/formulas/antiguedad-laboral-paraguay.ts` | 43 | `fechaHasta = new Date(2026, 6, 6); // hoy: 2026-07-06` |
| `src/lib/formulas/antiguedad-laboral-peru.ts` | 43 | `fechaHasta = new Date(2026, 6, 6); // hoy: 2026-07-06` |
| `src/lib/formulas/antiguedad-laboral-republica-dominicana.ts` | 66 | `fechaHasta = new Date(2026, 6, 6); // hoy: 2026-07-06` |
| `src/lib/formulas/antiguedad-laboral-uruguay.ts` | 42 | `fechaHasta = new Date(2026, 6, 6); // hoy: 2026-07-06` |
| `src/lib/formulas/beca-comedor-escolar-espana-renta-umbrales.ts` | 175 | `elegibilidad = '❌ Tu renta supera el umbral de referencia para tu CCAA y número de miembros. No tendrías dere…` |
| `src/lib/formulas/beca-comedor-escolar-espana-renta-umbrales.ts` | 192 | `'Esta calculadora ofrece resultados orientativos basados en los criterios generales de las convocatorias 2025…` |
| `src/lib/formulas/calculadora-salario-minimo-republica-dominicana.ts` | 70 | `nota: 'Operadores de maquinaria pesada. Resol. CNS-02-2026. Otros oficios de construcción se fijan a destajo.…` |
| `src/lib/formulas/costo-constitucion-empresa-peru.ts` | 100 | `insightText = ’Constituir tu ${modalidad === 'sacs' ? 'SACS digital' : 'empresa'} cuesta alrededor de **${fmt…` |
| `src/lib/formulas/cuando-es-el-dia-del-padre-madre-nino-por-pais.ts` | 38 | `const HOY_BASE = '2026-06-21';` |
| `src/lib/formulas/cuando-son-las-proximas-elecciones-por-pais.ts` | 192 | `fechaISO: '2026-11-03',` |
| `src/lib/formulas/cuando-son-las-proximas-elecciones-por-pais.ts` | 214 | `fechaISO: '2026-10-04',` |
| `src/lib/formulas/cuando-son-las-proximas-elecciones-por-pais.ts` | 268 | `const HOY_FALLBACK = '2026-06-21';` |
| `src/lib/formulas/cuanto-falta-cumpleanos-fecha-personalizada-eventos.ts` | 17 | `const targetDateStr = i.target_date ¦¦ "2026-12-25";` |
| `src/lib/formulas/cuantos-feriados-restan-ano-argentina.ts` | 29 | `return { resultado: '—', resumen: 'Fecha inválida. Usá el formato AAAA-MM-DD (ej.: 2026-06-08).' };` |
| `src/lib/formulas/cuantos-feriados-restan-ano-argentina.ts` | 33 | `return { resultado: '—', resumen: 'Fecha inválida. Usá el formato AAAA-MM-DD (ej.: 2026-06-08).' };` |
| `src/lib/formulas/curp-colombia-cedula-ciudadania-extranjeria-validez.ts` | 136 | `const hoy = new Date('2026-04-28');` |
| `src/lib/formulas/dias-licencia-maternidad-paternidad-pais.ts` | 67 | `fuente: 'Ley 19.161 + Ley 20.312/2025 (desde 01/01/2026)',` |
| `src/lib/formulas/dias-licencia-maternidad-paternidad-pais.ts` | 73 | `fuente: 'CLT art. 392 + Lei 15.371/2026',` |
| `src/lib/formulas/distancia-barrera-tiro-libre.ts` | 81 | `distanciaReglamento: ’9.15 m (10 yardas / 30 pies) según IFAB Laws of the Game 2025-2026 (Law 13).’,` |
| `src/lib/formulas/etiqueta-dgt-coche-espana-eco-cero-b-c.ts` | 168 | `text: ’Tu vehículo obtiene la etiqueta **C**: circula con **limitaciones horarias** y está sujeto a **restric…` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 6 | `'2026-01-01','2026-02-16','2026-02-17','2026-03-23','2026-03-24',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 6 | `'2026-01-01','2026-02-16','2026-02-17','2026-03-23','2026-03-24',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 6 | `'2026-01-01','2026-02-16','2026-02-17','2026-03-23','2026-03-24',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 6 | `'2026-01-01','2026-02-16','2026-02-17','2026-03-23','2026-03-24',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 6 | `'2026-01-01','2026-02-16','2026-02-17','2026-03-23','2026-03-24',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 7 | `'2026-04-02','2026-04-03','2026-05-01','2026-05-25','2026-06-17',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 7 | `'2026-04-02','2026-04-03','2026-05-01','2026-05-25','2026-06-17',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 7 | `'2026-04-02','2026-04-03','2026-05-01','2026-05-25','2026-06-17',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 7 | `'2026-04-02','2026-04-03','2026-05-01','2026-05-25','2026-06-17',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 7 | `'2026-04-02','2026-04-03','2026-05-01','2026-05-25','2026-06-17',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 8 | `'2026-06-20','2026-07-09','2026-08-17','2026-10-12','2026-11-20',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 8 | `'2026-06-20','2026-07-09','2026-08-17','2026-10-12','2026-11-20',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 8 | `'2026-06-20','2026-07-09','2026-08-17','2026-10-12','2026-11-20',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 8 | `'2026-06-20','2026-07-09','2026-08-17','2026-10-12','2026-11-20',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 8 | `'2026-06-20','2026-07-09','2026-08-17','2026-10-12','2026-11-20',` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 9 | `'2026-12-08','2026-12-25'` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 9 | `'2026-12-08','2026-12-25'` |
| `src/lib/formulas/impuesto-sellos-inmueble-contrato.ts` | 54 | `cordoba:            { nombre: 'Córdoba',                compraventa: 1.0, alquiler: 0.5, ley: 'Ley 11090/2026…` |
| `src/lib/formulas/inflacion-ipc.ts` | 11 | `'2026-01': { label: 'enero 2026', pct: 2.9 },` |
| `src/lib/formulas/inflacion-ipc.ts` | 12 | `'2026-02': { label: 'febrero 2026', pct: 2.9 },` |
| `src/lib/formulas/inflacion-ipc.ts` | 13 | `'2026-03': { label: 'marzo 2026', pct: 3.4 },` |
| `src/lib/formulas/inflacion-ipc.ts` | 14 | `'2026-04': { label: 'abril 2026', pct: 2.6 },` |
| `src/lib/formulas/inflacion-ipc.ts` | 15 | `'2026-05': { label: 'mayo 2026', pct: 2.1 },` |
| `src/lib/formulas/licencia-paternidad-colombia-2-semanas.ts` | 92 | `const aviso_reforma = 'ℹ️ En tramite legislativo: Proyecto de Ley ampliar a 4 semanas (28 días). Estado: Disc…` |
| `src/lib/formulas/monotributo-categoria-ideal.ts` | 91 | `const explicacion = ’Con facturación anual de $${facturacion.toLocaleString()} (${actividad}), tu categoría i…` |
| `src/lib/formulas/nombre-bebe-significado.ts` | 6 | `'emma': { sig: 'Universal, mujer industriosa, la que es grande', orig: 'Germánico', pop: 'Top 5 en Argentina …` |
| `src/lib/formulas/nombre-bebe-significado.ts` | 6 | `'emma': { sig: 'Universal, mujer industriosa, la que es grande', orig: 'Germánico', pop: 'Top 5 en Argentina …` |
| `src/lib/formulas/nombre-bebe-significado.ts` | 12 | `'mateo': { sig: 'Don de Dios', orig: 'Hebreo', pop: 'Top 3 en Argentina (2020-2026)', vars: 'Matías, Matteo, …` |
| `src/lib/formulas/nombre-bebe-significado.ts` | 12 | `'mateo': { sig: 'Don de Dios', orig: 'Hebreo', pop: 'Top 3 en Argentina (2020-2026)', vars: 'Matías, Matteo, …` |
| `src/lib/formulas/revision-tecnomecanica-colombia-precio-multa.ts` | 22 | `const HOY = new Date('2026-04-28');` |
| `src/lib/formulas/salario-por-hora-colombia.ts` | 14 | `const desde15Jul = fecha >= new Date('2026-07-15');` |
| `src/lib/formulas/sueldo-vs-promedio-argentino.ts` | 15 | `const RIPTE_BASE_MONTH = '2026-02';` |
| `src/lib/formulas/tipo-cambio-dolar-peso-chile-clp-banco-central.ts` | 43 | `'2026-04-28': 945.50,` |
| `src/lib/formulas/tipo-cambio-dolar-peso-chile-clp-banco-central.ts` | 44 | `'2026-04-27': 944.75,` |
| `src/lib/formulas/tipo-cambio-dolar-peso-chile-clp-banco-central.ts` | 45 | `'2026-04-26': 946.25,` |
| `src/lib/formulas/tipo-cambio-dolar-peso-chile-clp-banco-central.ts` | 46 | `'2026-04-25': 945.00,` |
| `src/lib/formulas/tipo-cambio-dolar-peso-chile-clp-banco-central.ts` | 47 | `'2026-04-24': 944.50,` |
| `src/lib/gone-410.ts` | 263 | `"/calculadora-iva-espana-2026-21-tipo-general-formula",` |
| `src/lib/informes/registry.ts` | 116 | `fechaPublicacion: '2026-07-01',` |
| `src/lib/informes/registry.ts` | 138 | `fechaPublicacion: '2026-07-01',` |
| `src/lib/informes/registry.ts` | 160 | `fechaPublicacion: '2026-07-01',` |
| `src/lib/informes/registry.ts` | 182 | `fechaPublicacion: '2026-07-01',` |
| `src/lib/markdown.ts` | 97 | `// 145 calcs afectadas (bug detectado 2026-05-19, PSI deep audit).` |
| `src/pages/[...slug].astro` | 1098 | `calc.slug === 'cuanto-falta-mundial-fifa-2026-2030' ¦¦` |
| `src/pages/aumento-jubilaciones.astro` | 143 | `datePublished: '2026-04-16',` |
| `src/pages/aumento-jubilaciones.astro` | 144 | `dateModified: (inflacion as any)._meta?.fetchedAt?.slice(0, 10) ?? '2026-07-11',` |
| `src/pages/cl/index.astro` | 76 | `const liveMes = new Date((clLive as any)?._meta?.fetchedAt ?? '2026-06-01').toLocaleDateString('es-CL', { mon…` |
| `src/pages/co/index.astro` | 75 | `const liveMes = new Date((coLive as any)?._meta?.fetchedAt ?? '2026-06-01').toLocaleDateString('es-CO', { mon…` |
| `src/pages/co/validar-nit.astro` | 101 | `dateModified: '2026-07-09',` |
| `src/pages/euro-hoy.astro` | 26 | `const FALLBACK_EUR: EurOficial = { moneda: 'EUR', casa: 'oficial', compra: 1688.43, venta: 1702.42, fechaActu…` |
| `src/pages/euro-hoy.astro` | 30 | `last_update: '2026-07-10T19:45:51-03:00',` |
| `src/pages/fin-de-semana/index.astro` | 14 | `const dateModified = new Date('2026-07-03T00:00:00Z').toISOString();` |
| `src/pages/guia/[slug].astro` | 48 | `datePublished: guia.datePublished ¦¦ '2026-04-19T00:00:00Z',` |
| `src/pages/index.astro` | 31 | `const showMundialSeasonal = buildDay <= '2026-07-19';` |
| `src/pages/index.astro` | 32 | `const showMonotributoSeasonal = buildDay <= '2026-08-05';` |
| `src/pages/inflacion-argentina.astro` | 101 | `a: 'Argentina 2025-2026 tuvo inflación anual entre <strong>25% y 35%</strong>, muy por encima del promedio gl…` |
| `src/pages/mx/index.astro` | 63 | `'calculadora-aguinaldo-mexico-2026-15-dias-tope-30',` |
| `src/pages/mx/index.astro` | 73 | `const liveMes = new Date((mxLive as any)?._meta?.fetchedAt ?? '2026-06-01').toLocaleDateString('es-MX', { mon…` |
| `src/pages/mx/index.astro` | 109 | `{ ar: 'calculadora-aguinaldo-sac', arLabel: 'Aguinaldo (SAC) Argentina', mx: 'calculadora-aguinaldo-mexico-20…` |
| `src/pages/pe/index.astro` | 73 | `const liveMes = new Date((peLive as any)?._meta?.fetchedAt ?? '2026-06-01').toLocaleDateString('es-PE', { mon…` |
| `src/pages/pt-pt/index.astro` | 93 | `{ k: 'IMT Jovem (isenção HPP)', v: ’até ${fmtEUR(P.imt.isencaoJovemAte)} (compradores até aos ${P.imt.isencao…` |
| `src/pages/pt-pt/index.astro` | 144 | `a: ’O IMT calcula-se por escalões sobre o maior valor entre o preço e o VPT. Para habitação própria e permane…` |
| `src/pages/pt/dados-ipca-brasil-historico.astro` | 51 | `temporalCoverage: '2024/2026',` |
| `src/pages/riesgo-pais-hoy.astro` | 20 | `{ valor: 496, fecha: '2026-05-11' }, { valor: 511, fecha: '2026-05-12' }, { valor: 523, fecha: '2026-05-13' },` |
| `src/pages/riesgo-pais-hoy.astro` | 20 | `{ valor: 496, fecha: '2026-05-11' }, { valor: 511, fecha: '2026-05-12' }, { valor: 523, fecha: '2026-05-13' },` |
| `src/pages/riesgo-pais-hoy.astro` | 20 | `{ valor: 496, fecha: '2026-05-11' }, { valor: 511, fecha: '2026-05-12' }, { valor: 523, fecha: '2026-05-13' },` |
| `src/pages/riesgo-pais-hoy.astro` | 21 | `{ valor: 525, fecha: '2026-05-14' }, { valor: 538, fecha: '2026-05-15' }, { valor: 543, fecha: '2026-05-18' },` |
| `src/pages/riesgo-pais-hoy.astro` | 21 | `{ valor: 525, fecha: '2026-05-14' }, { valor: 538, fecha: '2026-05-15' }, { valor: 543, fecha: '2026-05-18' },` |
| `src/pages/riesgo-pais-hoy.astro` | 21 | `{ valor: 525, fecha: '2026-05-14' }, { valor: 538, fecha: '2026-05-15' }, { valor: 543, fecha: '2026-05-18' },` |
| `src/pages/riesgo-pais-hoy.astro` | 22 | `{ valor: 547, fecha: '2026-05-19' }, { valor: 524, fecha: '2026-05-20' }, { valor: 516, fecha: '2026-05-21' },` |
| `src/pages/riesgo-pais-hoy.astro` | 22 | `{ valor: 547, fecha: '2026-05-19' }, { valor: 524, fecha: '2026-05-20' }, { valor: 516, fecha: '2026-05-21' },` |
| `src/pages/riesgo-pais-hoy.astro` | 22 | `{ valor: 547, fecha: '2026-05-19' }, { valor: 524, fecha: '2026-05-20' }, { valor: 516, fecha: '2026-05-21' },` |
| `src/pages/riesgo-pais-hoy.astro` | 23 | `{ valor: 514, fecha: '2026-05-22' }, { valor: 514, fecha: '2026-05-25' }, { valor: 508, fecha: '2026-05-26' },` |
| `src/pages/riesgo-pais-hoy.astro` | 23 | `{ valor: 514, fecha: '2026-05-22' }, { valor: 514, fecha: '2026-05-25' }, { valor: 508, fecha: '2026-05-26' },` |
| `src/pages/riesgo-pais-hoy.astro` | 23 | `{ valor: 514, fecha: '2026-05-22' }, { valor: 514, fecha: '2026-05-25' }, { valor: 508, fecha: '2026-05-26' },` |
| `src/pages/riesgo-pais-hoy.astro` | 24 | `{ valor: 500, fecha: '2026-05-27' }, { valor: 494, fecha: '2026-05-28' }, { valor: 493, fecha: '2026-05-29' },` |
| `src/pages/riesgo-pais-hoy.astro` | 24 | `{ valor: 500, fecha: '2026-05-27' }, { valor: 494, fecha: '2026-05-28' }, { valor: 493, fecha: '2026-05-29' },` |
| `src/pages/riesgo-pais-hoy.astro` | 24 | `{ valor: 500, fecha: '2026-05-27' }, { valor: 494, fecha: '2026-05-28' }, { valor: 493, fecha: '2026-05-29' },` |
| `src/pages/riesgo-pais-hoy.astro` | 25 | `{ valor: 490, fecha: '2026-06-01' }, { valor: 488, fecha: '2026-06-02' }, { valor: 492, fecha: '2026-06-03' },` |
| `src/pages/riesgo-pais-hoy.astro` | 25 | `{ valor: 490, fecha: '2026-06-01' }, { valor: 488, fecha: '2026-06-02' }, { valor: 492, fecha: '2026-06-03' },` |
| `src/pages/riesgo-pais-hoy.astro` | 25 | `{ valor: 490, fecha: '2026-06-01' }, { valor: 488, fecha: '2026-06-02' }, { valor: 492, fecha: '2026-06-03' },` |
| `src/pages/riesgo-pais-hoy.astro` | 26 | `{ valor: 486, fecha: '2026-06-04' }, { valor: 499, fecha: '2026-06-05' }, { valor: 494, fecha: '2026-06-08' },` |
| `src/pages/riesgo-pais-hoy.astro` | 26 | `{ valor: 486, fecha: '2026-06-04' }, { valor: 499, fecha: '2026-06-05' }, { valor: 494, fecha: '2026-06-08' },` |
| `src/pages/riesgo-pais-hoy.astro` | 26 | `{ valor: 486, fecha: '2026-06-04' }, { valor: 499, fecha: '2026-06-05' }, { valor: 494, fecha: '2026-06-08' },` |
| `src/pages/riesgo-pais-hoy.astro` | 27 | `{ valor: 498, fecha: '2026-06-09' }, { valor: 503, fecha: '2026-06-10' }, { valor: 443, fecha: '2026-06-11' },` |
| `src/pages/riesgo-pais-hoy.astro` | 27 | `{ valor: 498, fecha: '2026-06-09' }, { valor: 503, fecha: '2026-06-10' }, { valor: 443, fecha: '2026-06-11' },` |
| `src/pages/riesgo-pais-hoy.astro` | 27 | `{ valor: 498, fecha: '2026-06-09' }, { valor: 503, fecha: '2026-06-10' }, { valor: 443, fecha: '2026-06-11' },` |
| `src/pages/riesgo-pais-hoy.astro` | 28 | `{ valor: 437, fecha: '2026-06-12' }, { valor: 425, fecha: '2026-06-15' }, { valor: 430, fecha: '2026-06-16' },` |
| `src/pages/riesgo-pais-hoy.astro` | 28 | `{ valor: 437, fecha: '2026-06-12' }, { valor: 425, fecha: '2026-06-15' }, { valor: 430, fecha: '2026-06-16' },` |
| `src/pages/riesgo-pais-hoy.astro` | 28 | `{ valor: 437, fecha: '2026-06-12' }, { valor: 425, fecha: '2026-06-15' }, { valor: 430, fecha: '2026-06-16' },` |
| `src/pages/riesgo-pais-hoy.astro` | 29 | `{ valor: 435, fecha: '2026-06-17' }, { valor: 429, fecha: '2026-06-18' }, { valor: 429, fecha: '2026-06-19' },` |
| `src/pages/riesgo-pais-hoy.astro` | 29 | `{ valor: 435, fecha: '2026-06-17' }, { valor: 429, fecha: '2026-06-18' }, { valor: 429, fecha: '2026-06-19' },` |
| `src/pages/riesgo-pais-hoy.astro` | 29 | `{ valor: 435, fecha: '2026-06-17' }, { valor: 429, fecha: '2026-06-18' }, { valor: 429, fecha: '2026-06-19' },` |
| `src/pages/riesgo-pais-hoy.astro` | 30 | `{ valor: 421, fecha: '2026-06-22' }, { valor: 433, fecha: '2026-06-23' }, { valor: 437, fecha: '2026-06-24' },` |
| `src/pages/riesgo-pais-hoy.astro` | 30 | `{ valor: 421, fecha: '2026-06-22' }, { valor: 433, fecha: '2026-06-23' }, { valor: 437, fecha: '2026-06-24' },` |
| `src/pages/riesgo-pais-hoy.astro` | 30 | `{ valor: 421, fecha: '2026-06-22' }, { valor: 433, fecha: '2026-06-23' }, { valor: 437, fecha: '2026-06-24' },` |
| `src/pages/riesgo-pais-hoy.astro` | 31 | `{ valor: 437, fecha: '2026-06-25' }, { valor: 437, fecha: '2026-06-26' }, { valor: 431, fecha: '2026-06-29' },` |
| `src/pages/riesgo-pais-hoy.astro` | 31 | `{ valor: 437, fecha: '2026-06-25' }, { valor: 437, fecha: '2026-06-26' }, { valor: 431, fecha: '2026-06-29' },` |
| `src/pages/riesgo-pais-hoy.astro` | 31 | `{ valor: 437, fecha: '2026-06-25' }, { valor: 437, fecha: '2026-06-26' }, { valor: 431, fecha: '2026-06-29' },` |
| `src/pages/riesgo-pais-hoy.astro` | 32 | `{ valor: 426, fecha: '2026-06-30' }, { valor: 421, fecha: '2026-07-01' }, { valor: 415, fecha: '2026-07-02' },` |
| `src/pages/riesgo-pais-hoy.astro` | 32 | `{ valor: 426, fecha: '2026-06-30' }, { valor: 421, fecha: '2026-07-01' }, { valor: 415, fecha: '2026-07-02' },` |
| `src/pages/riesgo-pais-hoy.astro` | 32 | `{ valor: 426, fecha: '2026-06-30' }, { valor: 421, fecha: '2026-07-01' }, { valor: 415, fecha: '2026-07-02' },` |
| `src/pages/riesgo-pais-hoy.astro` | 33 | `{ valor: 415, fecha: '2026-07-03' }, { valor: 408, fecha: '2026-07-06' }, { valor: 405, fecha: '2026-07-07' },` |
| `src/pages/riesgo-pais-hoy.astro` | 33 | `{ valor: 415, fecha: '2026-07-03' }, { valor: 408, fecha: '2026-07-06' }, { valor: 405, fecha: '2026-07-07' },` |
| `src/pages/riesgo-pais-hoy.astro` | 33 | `{ valor: 415, fecha: '2026-07-03' }, { valor: 408, fecha: '2026-07-06' }, { valor: 405, fecha: '2026-07-07' },` |
| `src/pages/riesgo-pais-hoy.astro` | 34 | `{ valor: 408, fecha: '2026-07-08' }, { valor: 404, fecha: '2026-07-09' }, { valor: 402, fecha: '2026-07-10' },` |
| `src/pages/riesgo-pais-hoy.astro` | 34 | `{ valor: 408, fecha: '2026-07-08' }, { valor: 404, fecha: '2026-07-09' }, { valor: 402, fecha: '2026-07-10' },` |
| `src/pages/riesgo-pais-hoy.astro` | 34 | `{ valor: 408, fecha: '2026-07-08' }, { valor: 404, fecha: '2026-07-09' }, { valor: 402, fecha: '2026-07-10' },` |

## TEXTO — revisar editorialmente (18763 ocurrencias en 3362 archivos)

Años en prosa, FAQ, títulos, keywords, comentarios y referencias a slugs. La mayoría se resuelve al migrar el calc B correspondiente o al refrescar contenido 2027. Agregado por directorio + top 60 archivos:

| Directorio | Ocurrencias |
|---|---:|
| `src/content/calcs` | 6109 |
| `src/lib/formulas` | 2010 |
| `src/content/calcs-pt` | 1321 |
| `src/content/calcs-mx` | 1196 |
| `src/content/calcs-en` | 1185 |
| `src/content/calcs-cl` | 1035 |
| `src/content/calcs-co` | 985 |
| `src/content/calcs-pe` | 776 |
| `src/content/calcs-es` | 702 |
| `src/content/calcs-ec` | 668 |
| `src/content/comparaciones` | 340 |
| `src/content/calcs-uy` | 312 |
| `src/lib/decisions` | 240 |
| `src/content/calcs-do` | 210 |
| `src/content/calcs-py` | 198 |
| `src/content/calcs-pt-pt` | 186 |
| `src/content/calcs-ve` | 89 |
| `src/content/glosario` | 70 |
| `src/content/guias` | 70 |
| `src/pages/categoria` | 54 |
| `src/pages/co` | 53 |
| `src/pages/index.astro` | 52 |
| `src/pages/mx` | 47 |
| `src/pages/cl` | 41 |
| `src/components/FeriadosLanding.astro` | 41 |
| `src/lib/data-freshness.ts` | 39 |
| `src/pages/pt-pt` | 34 |
| `src/lib/pillars.ts` | 33 |
| `src/pages/ec` | 31 |
| `src/pages/pe` | 31 |
| `src/lib/datos-export.ts` | 30 |
| `src/pages/py` | 24 |
| `src/lib/datos-source-map.ts` | 24 |
| `src/pages/ve` | 23 |
| `src/pages/uy` | 22 |
| `src/components/Footer.astro` | 19 |
| `src/content/argentina` | 18 |
| `src/pages/do` | 18 |
| `src/pages/simulador-jubilacion-anses.astro` | 18 |
| `src/pages/top` | 18 |
| `src/pages/es` | 17 |
| `src/pages/pt` | 17 |
| `src/lib/gone-410.ts` | 17 |
| `src/lib/profile` | 17 |
| `src/components/Header.astro` | 17 |
| `src/lib/category-guide-map.ts` | 16 |
| `src/lib/category-hubs.ts` | 16 |
| `src/pages/calendarios.astro` | 14 |
| `src/lib/clusters.ts` | 14 |
| `src/pages/[...slug].astro` | 13 |
| `src/pages/calculadora-consumo-electrodomesticos.astro` | 13 |
| `src/pages/datasets` | 13 |
| `src/pages/valores-bcra.astro` | 13 |
| `src/pages/valores-vigentes.astro` | 13 |
| `src/pages/argentina` | 12 |
| `src/pages/calculadora-formula-1.astro` | 11 |
| `src/content/blog` | 9 |
| `src/pages/iibb` | 9 |
| `src/components/CalcLayoutV2.astro` | 8 |
| `src/components/Calculator.astro` | 8 |
| `src/pages/tabla` | 6 |
| `src/lib/products` | 6 |
| `src/components/DateRangePresetsTable.astro` | 5 |
| `src/content/tablas` | 4 |
| `src/pages/comparador-plazo-fijo.astro` | 4 |
| `src/pages/que-sueldo-necesito.astro` | 4 |
| `src/lib/offers.ts` | 4 |
| `src/components/CalendarioFeriados.astro` | 4 |
| `src/pages/alertas.astro` | 3 |
| `src/pages/aumento-jubilaciones.astro` | 3 |
| `src/pages/cambio-de-monedas.astro` | 3 |
| `src/pages/prensa.astro` | 3 |
| `src/lib/category-layout.ts` | 3 |
| `src/lib/ezoic.ts` | 3 |
| `src/lib/informes` | 3 |
| `src/lib/partners` | 3 |
| `src/lib/wikidata-entities.ts` | 3 |
| `src/pages/blog` | 2 |
| `src/pages/buscar.astro` | 2 |
| `src/pages/calculadora.astro` | 2 |
| `src/pages/calculadoras.astro` | 2 |
| `src/pages/dolar-hoy-chile.astro` | 2 |
| `src/pages/dolar-hoy-colombia.astro` | 2 |
| `src/pages/dolar-hoy-mexico.astro` | 2 |
| `src/pages/dolar-hoy-venezuela.astro` | 2 |
| `src/pages/enlazanos.astro` | 2 |
| `src/pages/plazo-fijo-[banco].astro` | 2 |
| `src/pages/populares.astro` | 2 |
| `src/pages/sitemap-fresh.xml.ts` | 2 |
| `src/pages/validar-cuit.astro` | 2 |
| `src/pages/wordpress.astro` | 2 |
| `src/lib/journeys.ts` | 2 |
| `src/lib/mundial-live.ts` | 2 |
| `src/lib/review-dates.ts` | 2 |
| `src/components/AuthorByline.astro` | 2 |
| `src/components/CalendarGrid.astro` | 2 |
| `src/components/IclVsIpcVsUvaTable.astro` | 2 |
| `src/components/ResultContext.astro` | 2 |
| `src/content/historias` | 1 |
| `src/pages/calculadora-cientifica.astro` | 1 |
| `src/pages/calculadoras-evento.astro` | 1 |
| `src/pages/cuanto-perdio-tu-sueldo.astro` | 1 |
| `src/pages/en` | 1 |
| `src/pages/euro-hoy.astro` | 1 |
| `src/pages/informes` | 1 |
| `src/pages/mcp.ts` | 1 |
| `src/pages/presupuesto-familiar.astro` | 1 |
| `src/pages/reloj-inflacion-argentina.astro` | 1 |
| `src/pages/riesgo-pais-hoy.astro` | 1 |
| `src/pages/search-index.json.ts` | 1 |
| `src/pages/tracker-embarazo-semana-a-semana.astro` | 1 |
| `src/lib/alerts` | 1 |
| `src/lib/interpret.ts` | 1 |
| `src/lib/markdown.ts` | 1 |
| `src/components/WhatChanged.astro` | 1 |
| `src/layouts/Layout.astro` | 1 |

### Top 60 archivos por ocurrencias

| Archivo | Ocurr. | Subtipos |
|---|---:|---|
| `src/content/calcs/inflacion-ipc.json` | 59 | json-prosa |
| `src/pages/categoria/[cat]/[...page].astro` | 54 | prosa-string, prosa-astro-template |
| `src/content/calcs/alquiler-icl.json` | 53 | json-prosa |
| `src/content/calcs/cuanto-falta-para-navidad.json` | 52 | json-prosa |
| `src/pages/index.astro` | 52 | comentario, referencia-slug-con-año, prosa-string, prosa-astro-template |
| `src/content/calcs-mx/calculadora-imss-trabajadoras-hogar-mexico.json` | 50 | json-prosa |
| `src/pages/co/index.astro` | 48 | prosa-string, referencia-slug-con-año, comentario, prosa-astro-template |
| `src/pages/mx/index.astro` | 45 | prosa-string, referencia-slug-con-año, comentario, prosa-astro-template |
| `src/components/FeriadosLanding.astro` | 41 | referencia-slug-con-año, prosa-string, prosa-astro-template |
| `src/lib/data-freshness.ts` | 39 | referencia-slug-con-año, comentario |
| `src/content/calcs/interes-judicial-tasa.json` | 38 | json-prosa |
| `src/pages/cl/index.astro` | 38 | prosa-string, referencia-slug-con-año, comentario, prosa-astro-template |
| `src/content/calcs/cuantos-feriados-restan-ano-argentina.json` | 37 | json-prosa |
| `src/content/calcs/fondo-asistencia-laboral-fal.json` | 36 | json-prosa |
| `src/content/calcs-pe/retiro-cts-desempleo-peru.json` | 36 | json-prosa |
| `src/content/calcs-co/calculadora-ingresos-no-constitutivos-renta-colombia-vivienda.json` | 35 | json-prosa |
| `src/content/calcs/bienes-personales.json` | 34 | json-prosa |
| `src/content/calcs/calculadora-tarifa-electrica-edenor-edesur-segmentacion-n1-n2-n3.json` | 34 | json-prosa |
| `src/content/calcs/costo-m2-construccion.json` | 34 | json-prosa |
| `src/content/calcs/renta-colombia-persona-natural.json` | 33 | json-prosa |
| `src/content/calcs-en/electric-car-savings-vs-gas-annual.json` | 33 | json-prosa |
| `src/pages/pt-pt/index.astro` | 33 | referencia-slug-con-año, comentario, prosa-string, prosa-astro-template |
| `src/lib/pillars.ts` | 33 | comentario, prosa-string, referencia-slug-con-año |
| `src/content/calcs-cl/calculadora-bono-marzo-bono-invierno-chile-cuantia-requisitos.json` | 32 | json-prosa |
| `src/content/calcs-mx/calculadora-pension-imss-modalidad-40-mexico-aportacion.json` | 32 | json-prosa |
| `src/content/calcs-mx/calculadora-salario-diario-integrado-sdi-mexico.json` | 32 | json-prosa |
| `src/content/calcs/que-dia.json` | 31 | json-prosa |
| `src/content/calcs/sueldo-empleados-comercio-cct-130-75.json` | 31 | json-prosa |
| `src/content/calcs-mx/calculadora-isr-venta-casa-mexico-700000-udis.json` | 31 | json-prosa |
| `src/content/calcs-pe/costo-vida-mensual-peru.json` | 31 | json-prosa |
| `src/content/calcs-pt/salario-liquido-com-dependentes-br.json` | 31 | json-prosa |
| `src/content/calcs/sueldo-ar.json` | 30 | json-prosa |
| `src/content/calcs-en/401k-contribution-match-calculator.json` | 30 | json-prosa |
| `src/content/calcs-pt/simulador-holerite-clt.json` | 30 | json-prosa |
| `src/lib/datos-export.ts` | 30 | referencia-slug-con-año, comentario, prosa-string |
| `src/content/calcs/cuenta-regresiva.json` | 29 | json-prosa |
| `src/content/calcs-en/gaming-pc-budget-fps-components.json` | 29 | json-prosa |
| `src/content/calcs-pe/impuesto-predial-peru.json` | 29 | json-prosa |
| `src/content/calcs/aguinaldo.json` | 28 | json-prosa |
| `src/content/calcs/antiguedad-laboral.json` | 28 | json-prosa |
| `src/content/calcs/autovia-peajes-argentina-ruta-2-ruta-3.json` | 28 | json-prosa |
| `src/content/calcs/dias-entre-fechas.json` | 28 | json-prosa |
| `src/content/calcs-ec/pension-alimenticia-ecuador.json` | 28 | json-prosa |
| `src/content/calcs/fecha-boda-ideal.json` | 27 | json-prosa |
| `src/content/calcs/jubilacion-minima.json` | 27 | json-prosa |
| `src/content/calcs/precio-dolar-producto.json` | 27 | json-prosa |
| `src/content/calcs-en/side-hustle-tax-savings-calculator.json` | 27 | json-prosa |
| `src/content/calcs-mx/calculadora-cuenta-de-ahorro-mexico-rendimiento-cetes-directo-nu-mercado-pago.json` | 27 | json-prosa |
| `src/content/calcs-mx/calculadora-factor-integracion-salarial-imss-mexico.json` | 27 | json-prosa |
| `src/content/calcs-pe/deposito-plazo-fijo-peru.json` | 27 | json-prosa |
| `src/content/calcs-pe/soat-peru-precio.json` | 27 | json-prosa |
| `src/pages/ec/index.astro` | 27 | prosa-string, comentario, prosa-astro-template, referencia-slug-con-año |
| `src/pages/pe/index.astro` | 27 | prosa-string, comentario, referencia-slug-con-año, prosa-astro-template |
| `src/content/calcs/ganancias-sueldo.json` | 26 | json-prosa |
| `src/content/calcs-es/calculadora-subsidio-mayores-52-anos-espana-cuantia-meses.json` | 26 | json-prosa |
| `src/content/calcs-mx/calculadora-uma-conversion-mexico.json` | 26 | json-prosa |
| `src/content/calcs-pt/salario-bruto-a-partir-liquido-br.json` | 26 | json-prosa |
| `src/content/calcs/cambio-moneda.json` | 25 | json-prosa |
| `src/content/calcs/impuesto-transferencia-itu-iti-inmueble.json` | 25 | json-prosa |
| `src/content/calcs-co/calculadora-incapacidad-medica-eps-colombia.json` | 25 | json-prosa |

## REVIEW — código sin clasificar (13)

El año aparece en código pero no matchea ningún patrón seguro (tablas por año, arrays, asignaciones con nombre ambiguo). Revisar a mano.

| Archivo | Línea | Subtipo | Código |
|---|---:|---|---|
| `src/components/CalendarGrid.astro` | 18 | código-sin-clasificar | `const { feriados, pais, year = 2026 } = Astro.props as Props;` |
| `src/lib/formulas/fecha-boda-ideal.ts` | 15 | candidato-A-acoplado-a-dataset-2026-local (const-año (anio)) | `const anio = 2026;` |
| `src/lib/formulas/generacion-perteneces.ts` | 18 | key-de-tabla-por-año | `max: idx === GENS.length - 1 ? 2026 : g.hasta,` |
| `src/lib/formulas/iva-honorarios-chile-10-porciento-retencion.ts` | 26 | key-de-tabla-por-año | `2026: 0.1525,  // 15,25% vigente 2026 (subió desde 14,5% en 2025)` |
| `src/lib/formulas/mortgage-payment-monthly-calculator.ts` | 50 | candidato-A-acoplado-a-dataset-2026-local (fallback-año-actual (startYear)) | `const startYear = Number(i.start_year) ¦¦ 2026;` |
| `src/lib/formulas/reforma-pensional-colombia-2025-pilares-ahorro.ts` | 41 | candidato-A-acoplado-a-dataset-2026-local (const-año (AÑO_ACTUAL)) | `const AÑO_ACTUAL = 2026;` |
| `src/lib/formulas/semanas-imss-faltantes.ts` | 32 | key-de-tabla-por-año | `2026: 875, 2027: 900, 2028: 925, 2029: 950, 2030: 975,` |
| `src/lib/formulas/sueldo-vs-promedio-argentino.ts` | 36 | código-sin-clasificar | `{ year: 2026, nominal: RIPTE_NOMINAL, real_pesos_actuales: RIPTE_NOMINAL },` |
| `src/lib/formulas/sueldo-vs-promedio-argentino.ts` | 79 | código-sin-clasificar | `bestYear.year === 2026` |
| `src/lib/wikidata-entities.ts` | 202 | código-sin-clasificar | `patterns: [/mundial 2026/i, /world cup 2026/i, /fifa 2026/i, /copa mundial.*2026/i],` |
| `src/lib/wikidata-entities.ts` | 202 | código-sin-clasificar | `patterns: [/mundial 2026/i, /world cup 2026/i, /fifa 2026/i, /copa mundial.*2026/i],` |
| `src/lib/wikidata-entities.ts` | 202 | código-sin-clasificar | `patterns: [/mundial 2026/i, /world cup 2026/i, /fifa 2026/i, /copa mundial.*2026/i],` |
| `src/lib/wikidata-entities.ts` | 202 | código-sin-clasificar | `patterns: [/mundial 2026/i, /world cup 2026/i, /fifa 2026/i, /copa mundial.*2026/i],` |

## Metodología y heurísticas

- Escaneo: `src/content`, `src/pages`, `src/lib`, `src/components`, `src/layouts`, `src/data` (extensiones .ts/.js/.astro/.json).
- Excluidos: node_modules, dist, .astro, .git, data viva (`src/data/live`) y generados (`related-auto.json`, `calc-compute-index.json`, etc.).
- Un "año" es el literal 2026 como número de 4 dígitos aislado (no parte de un número más largo).
- Tokenizador TS aproximado distingue código / string / comentario (soporta template literals con \${} anidado).
- Anti-falso-positivo: URLs y citas de fuente se ignoran; fechas de dato (lastReviewed, dataUpdate, sources[].date, DATA_AS_OF) se ignoran; prosa va a TEXTO, no a A.
- Clase A exige: archivo SIN año en el nombre, fuera de src/lib/data y src/data, nombre de variable "de año" (anio/año/year/actual/base/…) o aritmética de edad, y SIN keyword fiscal ni monto ≥5 dígitos en la misma línea.

## Limitaciones conocidas

- La demotión fiscal es por LÍNEA: un año calendario legítimo en un archivo 100% fiscal puede quedar en C (falso negativo conservador, intencional).
- FECHA no distingue fecha-objetivo recurrente (Navidad) de fecha de evento único (debut del Mundial): ambas requieren ojo humano.
- El template de .astro se clasifica como prosa: una constante JS dentro de un `<script>` inline del template caería en TEXTO.
- TEXTO en JSON cuenta ocurrencias por archivo pero no propone reemplazos (el texto correcto depende de si el dato 2027 existe).
- `--apply` NO bumpea `lastReviewed` de los calc JSON asociados: hacerlo a mano o el sitemap no se mueve (CLAUDE.md §2).

