/**
 * Registro central de fetchers: mapea slugs de calcs a la función que actualiza
 * sus datos. El orchestrator usa esto para decidir qué correr según el filtro.
 *
 * Agregar un fetcher nuevo:
 *   1. Crear scripts/update-data/fetchers/<nombre>.ts exportando una función
 *      async ({ dry }) => Promise<boolean>.
 *   2. Importarla acá y agregar su entry con los slugs que actualiza y su freq.
 *   3. Asegurarse de que las calcs correspondientes tengan updateType correcto
 *      en su dataUpdate (auto-api, auto-scrape, auto-llm).
 */

import type { Frequency } from './utils/freshness.ts';
import { fetchDolar } from './fetchers/dolar.ts';
import { fetchBcra } from './fetchers/bcra.ts';
import { fetchBcraSeries } from './fetchers/bcra-series.ts';
import { fetchIpc } from './fetchers/ipc.ts';
import { fetchMonotributo } from './fetchers/monotributo.ts';
import { fetchGananciasEscala } from './fetchers/ganancias-escala.ts';
import { fetchSmvm } from './fetchers/smvm.ts';
import { fetchJubilacionAnses } from './fetchers/jubilacion-anses.ts';
import { fetchBienesPersonales } from './fetchers/bienes-personales.ts';
import { fetchCostoLaboral } from './fetchers/costo-laboral.ts';
import { fetchMonotributoVsInscripto } from './fetchers/monotributo-vs-inscripto.ts';
import { fetchCostoMochilero } from './fetchers/costo-mochilero.ts';
import { fetchPropinas } from './fetchers/propinas.ts';
import { fetchGasNatural } from './fetchers/gas-natural.ts';
import { fetchCostoM2 } from './fetchers/costo-m2.ts';
import { fetchGananciasRG830 } from './fetchers/ganancias-rg830.ts';
import { fetchIngresosBrutos } from './fetchers/ingresos-brutos.ts';
import { fetchRipte } from './fetchers/ripte.ts';

export interface FetcherEntry {
  name: string;
  slugs: string[];
  frequency: Frequency;
  /**
   * Camino de datos del fetcher:
   *  - 'deterministic': API/tabla estructurada, no necesita LLM.
   *  - 'hybrid': camino determinístico principal, LLM solo fallback/cross-check.
   *  - 'llm': depende de ask-claude — sin ANTHROPIC_API_KEY queda 'pending'
   *    y el orchestrator lo marca con WARN visible en el summary (nunca silencio).
   */
  path: 'deterministic' | 'hybrid' | 'llm';
  run: (opts: { dry?: boolean }) => Promise<boolean>;
}

export const REGISTRY: FetcherEntry[] = [
  {
    name: 'dolar',
    path: 'deterministic',
    slugs: [
      'conversor-dolar-argentina',
      'conversor-dolar-euro-pesos-argentinos',
      'conversor-moneda-dolar-peso-real-latam',
    ],
    frequency: 'daily',
    run: fetchDolar,
  },
  {
    name: 'bcra',
    path: 'deterministic',
    slugs: [
      'calculadora-actualizacion-alquiler-icl',
      'calculadora-credito-uva-vs-tasa-fija',
      'calculadora-plazo-fijo',
    ],
    frequency: 'monthly',
    run: fetchBcra,
  },
  {
    name: 'bcra-series',
    path: 'deterministic',
    // Persiste series históricas (ICL/UVA/CER/TM20/plazo-fijo-30d) en db/*.json
    // para uso por componentes que muestren gráficos o snapshots offline.
    // Daily porque las 5 series son diarias en el BCRA y el costo es bajo (~7s).
    // Bumpea lastUpdated en TODAS las calcs cuyo valor depende de UVA/ICL/plazo
    // fijo (ver refreshSlugs por serie en bcra-series.ts).
    slugs: [
      'calculadora-actualizacion-alquiler-icl',
      'calculadora-credito-uva-vs-tasa-fija',
      'calculadora-credito-uva-cuota-actual',
      'calculadora-hipoteca-uva-bbva-argentina',
      'calculadora-hipoteca-uva-santander-argentina',
      'calculadora-hipoteca-divisa-extranjera-vs-uva',
      'calculadora-ingreso-minimo-credito-hipotecario-uva-banco-nacion',
      'calculadora-cuota-credito-hipotecario-uva-banco-nacion',
      'calculadora-ahorro-uva-vs-pesos-vs-dolar-12-meses',
      'calculadora-plazo-fijo-uva-precancelable-rendimiento',
      'calculadora-uva-hipoteca-vs-inflacion-riesgo',
      'calculadora-plazo-fijo',
    ],
    frequency: 'daily',
    run: fetchBcraSeries,
  },
  {
    name: 'ipc',
    path: 'deterministic',
    slugs: ['calculadora-actualizacion-inflacion-ipc'],
    frequency: 'monthly',
    run: fetchIpc,
  },
  {
    name: 'monotributo',
    path: 'llm',
    // Solo `calculadora-monotributo-2026` usa la formula monotributo.ts.
    // `calculadora-monotributo-vs-responsable-inscripto` usa monotributo-vs-inscripto.ts
    // con otra estructura (tabla simplificada con cuota unificada) — fetcher propio.
    slugs: ['calculadora-monotributo-2026'],
    frequency: 'biannual',
    run: fetchMonotributo,
  },
  {
    name: 'monotributo-vs-inscripto',
    path: 'llm',
    // Tabla aparte con 11 categorías { letra, topeFactServ, topeFactCom, cuota }
    slugs: ['calculadora-monotributo-vs-responsable-inscripto'],
    frequency: 'biannual',
    run: fetchMonotributoVsInscripto,
  },
  {
    name: 'ganancias-escala',
    path: 'llm',
    // Los 3 calcs comparten `_ganancias-escala.ts` (MNI + INCREMENTO + ESCALA).
    // sueldo-en-mano y sueldo-neto-a-bruto importan de sueldo-ar.ts que a su
    // vez lee la escala compartida — un solo patch los actualiza a los 3.
    slugs: [
      'calculadora-impuesto-ganancias-sueldo',
      'calculadora-sueldo-neto-a-bruto',
      'sueldo-en-mano-argentina',
    ],
    frequency: 'biannual',
    run: fetchGananciasEscala,
  },
  {
    name: 'smvm',
    path: 'hybrid',
    // El SMVM argentino se reajusta CASI TODOS LOS MESES (cronograma del Consejo
    // del Salario, alta inflación). Estaba en 'biannual' → quedaba viejo hasta 6
    // meses (ej. jul-2026 $372.400 → ago-2026 $376.600 no se capturaba). monthly.
    slugs: ['salario-minimo-vital-movil-argentina'],
    frequency: 'monthly',
    run: fetchSmvm,
  },
  {
    name: 'jubilacion-anses',
    path: 'hybrid',
    slugs: ['calculadora-jubilacion-minima-anses'],
    frequency: 'monthly',
    run: fetchJubilacionAnses,
  },
  {
    name: 'bienes-personales',
    path: 'llm',
    // Ley 27.743 baja alícuotas 2024→2027 — ARCA actualiza MNI y escala anualmente.
    slugs: ['calculadora-bienes-personales-2026'],
    frequency: 'yearly',
    run: fetchBienesPersonales,
  },
  {
    name: 'costo-laboral',
    path: 'llm',
    // Alícuotas patronales grande/pyme + ART promedio.
    // Patchea consts en src/lib/formulas/costo-laboral.ts (CARGA_GRANDE/PYME/ART)
    // y bumpea lastUpdated en las calcs que reflejan esas alícuotas.
    // aportes-patronales-...-2026 también depende de Dec. 814/2001: cuando la
    // suma total cambia, su desglose interno (SIPA/INSSJP/FNE/AAFF) suele cambiar
    // también — el editorial revisa el PR antes de mergear.
    slugs: [
      'calculadora-costo-laboral-empleado',
      'calculadora-aportes-patronales-empleado-registrado-cargas-sociales-2026',
    ],
    frequency: 'yearly',
    run: fetchCostoLaboral,
  },
  {
    name: 'costo-mochilero',
    path: 'llm',
    // Presupuestos diarios USD/día para 29 países (Nomadic Matt, BBP, Budget Your Trip).
    slugs: ['calculadora-costo-mochilero-por-pais'],
    frequency: 'yearly',
    run: fetchCostoMochilero,
  },
  {
    name: 'propinas',
    path: 'llm',
    // % propina por 12 países (restaurante, taxi, hotel) + regla local.
    slugs: ['calculadora-propina-por-pais-viaje'],
    frequency: 'yearly',
    run: fetchPropinas,
  },
  {
    name: 'gas-natural',
    path: 'llm',
    // Cuadro tarifario ENARGAS: precio/m³ + cargo fijo bimestral R1/R2/R3.
    slugs: ['calculadora-gas-natural-consumo-m3'],
    frequency: 'yearly',
    run: fetchGasNatural,
  },
  {
    name: 'costo-m2',
    path: 'llm',
    // Costo construcción USD/m² × 10 tipologías (CAC / CPIC / Reporte Inmobiliario).
    slugs: ['calculadora-costo-m2-construccion-argentina'],
    frequency: 'yearly',
    run: fetchCostoM2,
  },
  {
    name: 'ganancias-rg830',
    path: 'llm',
    // Anexo VIII RG 830 — MNI + alícuotas + escala progresiva (ARCA actualiza 2x/año).
    slugs: ['calculadora-retencion-ganancias-rg-830'],
    frequency: 'biannual',
    run: fetchGananciasRG830,
  },
  {
    name: 'ingresos-brutos',
    path: 'llm',
    // Alícuotas IIBB 5 provincias × 5 actividades (ley tarifaria provincial anual).
    slugs: ['calculadora-ingresos-brutos-provincial'],
    frequency: 'yearly',
    run: fetchIngresosBrutos,
  },
  {
    name: 'ripte',
    path: 'deterministic',
    // RIPTE — Remuneración promedio trabajadores estables. INDEC/Min Capital Humano.
    // Publicada con ~3-5 meses de retraso. Persiste serie histórica en db/ripte.json.
    slugs: [
      'sueldo-vs-promedio-argentino',
      'calculadora-jubilacion-haber-movilidad-trimestral',
      'calculadora-ripte-actualizacion-jubilatoria-sueldo',
    ],
    frequency: 'monthly',
    run: fetchRipte,
  },
];

/** Slugs que tienen fetcher implementado. Útil para reportar cobertura. */
export const IMPLEMENTED_SLUGS = new Set<string>(REGISTRY.flatMap((e) => e.slugs));
