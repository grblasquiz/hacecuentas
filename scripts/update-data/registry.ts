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
    // con otra estructura — requiere su propio fetcher (pendiente).
    slugs: ['calculadora-monotributo-2026'],
    frequency: 'biannual',
    run: fetchMonotributo,
  },
];

/** Slugs que tienen fetcher implementado. Útil para reportar cobertura. */
export const IMPLEMENTED_SLUGS = new Set<string>(REGISTRY.flatMap((e) => e.slugs));
