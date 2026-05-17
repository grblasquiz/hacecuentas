// Mapa: calc slug → datasets descargables relacionados.
// Se usa en src/pages/[...slug].astro para inyectar Schema.org Dataset
// en las calcs que usan/exponen datos descargables. Esto las hace
// descubribles en Google Dataset Search desde la URL de la calc, no
// sólo desde /datasets.
//
// Source of truth de datasets: public/datasets/index.json
// (actualizar este mapa cuando se sumen calcs nuevas con datos vivos).

export interface CalcDatasetRef {
  slug: string;        // matchea public/datasets/<slug>.{csv,json}
  name: string;
  description: string;
  keywords: string[];
}

const DOLAR_OFICIAL: CalcDatasetRef = {
  slug: 'dolar-oficial-argentina-historico',
  name: 'Cotización histórica del dólar oficial (BNA)',
  description: 'Histórico diario del dólar oficial Banco Nación, compra y venta.',
  keywords: ['Dólar oficial', 'BNA', 'Cambio Argentina'],
};

const DOLAR_BLUE: CalcDatasetRef = {
  slug: 'dolar-blue-argentina-historico',
  name: 'Cotización histórica del dólar blue (paralelo)',
  description: 'Histórico diario del dólar blue compra y venta en Argentina.',
  keywords: ['Dólar blue', 'Paralelo', 'Cambio'],
};

const INFLACION: CalcDatasetRef = {
  slug: 'inflacion-argentina-historica-mensual',
  name: 'Inflación mensual histórica de Argentina (IPC INDEC)',
  description: 'Variación mensual del IPC publicado por INDEC. Histórico desde 1943.',
  keywords: ['Inflación', 'IPC', 'INDEC'],
};

const UVA: CalcDatasetRef = {
  slug: 'uva-argentina-historico',
  name: 'UVA (Unidad de Valor Adquisitivo) — histórico BCRA',
  description: 'Valor diario de la UVA publicado por el BCRA. Se ajusta por inflación CER.',
  keywords: ['UVA', 'BCRA', 'CER', 'Hipotecario'],
};

const TASA_PF: CalcDatasetRef = {
  slug: 'tasa-plazo-fijo-30dias-argentina-historico',
  name: 'Tasa plazo fijo a 30 días (TNA) — histórico BCRA',
  description: 'TNA diaria de plazo fijo a 30 días en bancos privados argentinos.',
  keywords: ['Plazo fijo', 'TNA', 'BCRA'],
};

// Mapa principal: calc slug → datasets relacionados.
// SOLO slugs que existen en src/content/calcs/*.json (renderizados via
// [...slug].astro). Las páginas específicas (cambio-de-monedas, inflacion-argentina,
// cotizacion-cripto, comparador-plazo-fijo, simulador-jubilacion-anses) NO usan
// este template y deben recibir Schema Dataset por edición manual de su .astro.
export const CALC_DATASETS: Record<string, CalcDatasetRef[]> = {
  'calculadora-plazo-fijo': [TASA_PF, INFLACION],
  'calculadora-plazo-fijo-ganancia-neta-anual': [TASA_PF, INFLACION],
  'calculadora-plazo-fijo-uva-precancelable-rendimiento': [UVA, TASA_PF, INFLACION],
  'calculadora-ahorro-uva-vs-pesos-vs-dolar-12-meses': [UVA, DOLAR_OFICIAL, DOLAR_BLUE, INFLACION],
  'calculadora-hipoteca-divisa-extranjera-vs-uva': [UVA, DOLAR_OFICIAL],
  'calculadora-hipoteca-uva-bbva-argentina': [UVA, INFLACION],
  'calculadora-cuota-credito-hipotecario-uva-banco-nacion': [UVA, INFLACION],
  'calculadora-ingreso-minimo-credito-hipotecario-uva-banco-nacion': [UVA, INFLACION],
  'calculadora-capacidad-credito-hipotecario': [UVA, INFLACION],
  'calculadora-ajuste-sueldo-inflacion': [INFLACION],
  'calculadora-cuotas-sin-interes-vs-contado-inflacion-argentina': [INFLACION],
  'calculadora-cuotas-sin-interes-costo-real-inflacion': [INFLACION],
};

/** Genera Schema.org Dataset[] para una calc. Vacío si la calc no tiene datasets. */
export function datasetSchemasForCalc(slug: string) {
  const refs = CALC_DATASETS[slug];
  if (!refs || refs.length === 0) return [];
  return refs.map((d) => ({
    '@type': 'Dataset',
    '@id': `https://hacecuentas.com/${slug}#dataset-${d.slug}`,
    name: d.name,
    description: d.description,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: {
      '@type': 'Organization',
      name: 'Hacé Cuentas',
      url: 'https://hacecuentas.com',
    },
    keywords: d.keywords,
    isAccessibleForFree: true,
    inLanguage: 'es-AR',
    spatialCoverage: { '@type': 'Place', name: 'Argentina' },
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `https://hacecuentas.com/datasets/${d.slug}.csv`,
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `https://hacecuentas.com/datasets/${d.slug}.json`,
      },
    ],
  }));
}
