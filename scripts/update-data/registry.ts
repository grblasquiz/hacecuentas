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
import { fetchIpc } from './fetchers/ipc.ts';
import { fetchMonotributo } from './fetchers/monotributo.ts';
import { fetchGananciasEscala } from './fetchers/ganancias-escala.ts';
import { fetchSmvm } from './fetchers/smvm.ts';
import { fetchJubilacionAnses } from './fetchers/jubilacion-anses.ts';
import { fetchBienesPersonales } from './fetchers/bienes-personales.ts';
import { fetchCostoLaboral } from './fetchers/costo-laboral.ts';
import { fetchMonotributoVsInscripto } from './fetchers/monotributo-vs-inscripto.ts';

export interface FetcherEntry {
  name: string;
  slugs: string[];
  frequency: Frequency;
  run: (opts: { dry?: boolean }) => Promise<boolean>;
}

export const REGISTRY: FetcherEntry[] = [
  {
    name: 'dolar',
    slugs: ['conversor-dolar-argentina', 'conversor-dolar-euro-pesos-argentinos'],
    frequency: 'daily',
    run: fetchDolar,
  },
  {
    name: 'bcra',
    slugs: [
      'calculadora-actualizacion-alquiler-icl',
      'calculadora-credito-uva-vs-tasa-fija',
      'calculadora-plazo-fijo',
    ],
    frequency: 'monthly',
    run: fetchBcra,
  },
  {
    name: 'ipc',
    slugs: ['calculadora-actualizacion-inflacion-ipc'],
    frequency: 'monthly',
    run: fetchIpc,
  },
  {
    name: 'monotributo',
    // Solo `calculadora-monotributo-2026` usa la formula monotributo.ts.
    // `calculadora-monotributo-vs-responsable-inscripto` usa monotributo-vs-inscripto.ts
    // con otra estructura (tabla simplificada con cuota unificada) — fetcher propio.
    slugs: ['calculadora-monotributo-2026'],
    frequency: 'biannual',
    run: fetchMonotributo,
  },
  {
    name: 'monotributo-vs-inscripto',
    // Tabla aparte con 11 categorías { letra, topeFactServ, topeFactCom, cuota }
    slugs: ['calculadora-monotributo-vs-responsable-inscripto'],
    frequency: 'biannual',
    run: fetchMonotributoVsInscripto,
  },
  {
    name: 'ganancias-escala',
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
    slugs: ['salario-minimo-vital-movil-argentina'],
    frequency: 'biannual',
    run: fetchSmvm,
  },
  {
    name: 'jubilacion-anses',
    slugs: ['calculadora-jubilacion-minima-anses'],
    frequency: 'monthly',
    run: fetchJubilacionAnses,
  },
  {
    name: 'bienes-personales',
    // Ley 27.743 baja alícuotas 2024→2027 — ARCA actualiza MNI y escala anualmente.
    slugs: ['calculadora-bienes-personales-2026'],
    frequency: 'yearly',
    run: fetchBienesPersonales,
  },
  {
    name: 'costo-laboral',
    // Alícuotas patronales grande/pyme + ART promedio.
    slugs: ['calculadora-costo-laboral-empleado'],
    frequency: 'yearly',
    run: fetchCostoLaboral,
  },
];

/** Slugs que tienen fetcher implementado. Útil para reportar cobertura. */
export const IMPLEMENTED_SLUGS = new Set<string>(REGISTRY.flatMap((e) => e.slugs));
