/** Costo aproximado de construcción por m² (Argentina) */
export interface Inputs {
  m2: number;
  tipo?: string;
  provincia?: string;
}
export interface Outputs {
  costoPorM2USD: number;
  costoPorM2ARS: number;
  costoTotalUSD: number;
  costoTotalARS: number;
  desglose: string;
  tipo: string;
  _insight?: any;
  _chart?: any;
}

// Costos orientativos Argentina 2026 en USD/m² (fuente: CAC, CPIC, índice ICCo).
// Valores base referencia CABA/GBA sur. Revisar semestralmente: CAC publica
// cada mes un índice que se puede contrastar para validar rangos.
const TIPOS: Record<string, { nombre: string; usd: number }> = {
  economico: { nombre: 'Económico (vivienda social, campo)', usd: 800 },
  estandar: { nombre: 'Estándar (casa media urbana)', usd: 1000 },
  medio: { nombre: 'Casa media (clase media, GBA/CABA)', usd: 1300 },
  alto: { nombre: 'Casa de alta categoría (country, barrio cerrado)', usd: 1900 },
  premium: { nombre: 'Premium (alta gama, mármol, domótica)', usd: 2900 },
  ampliacion: { nombre: 'Ampliación sobre obra existente', usd: 800 },
  reforma: { nombre: 'Reforma integral (con estructura)', usd: 600 },
  dpto_estandar: { nombre: 'Departamento torre estándar', usd: 1200 },
  dpto_premium: { nombre: 'Departamento premium (Puerto Madero)', usd: 2300 },
  galpon: { nombre: 'Galpón industrial tipo', usd: 500 },
};

// Ajuste por provincia/zona. Factores 2026 basados en distancia a mayoristas,
// costos logísticos y exigencias climáticas/estructurales locales.
// Patagonia austral (TDF, Santa Cruz) + norte andino (Jujuy, Salta) tienen
// recargos por transporte + aislamiento térmico/sísmico obligatorio.
const AJUSTE: Record<string, number> = {
  caba: 1.25,
  gba_norte: 1.15,
  gba_sur: 1.00,
  cordoba: 0.95,
  rosario: 0.95,
  mendoza: 0.90,
  'la-pampa': 0.92,                 // llanura accesible, logística intermedia
  patagonia_norte: 1.10,            // Neuquén, Río Negro, Chubut — aislamiento + costos
  patagonia_austral: 1.35,          // Santa Cruz — logística austral
  'tierra-del-fuego': 1.40,         // TDF: +40% por aislamiento sísmico+térmico obligatorio, logística marítima
  interior: 0.88,                   // default interior (era 0.85, ajustado)
};

export function costoM2Construccion(i: Inputs): Outputs {
  const m2 = Number(i.m2);
  const tipo = String(i.tipo || 'estandar');
  const prov = String(i.provincia || 'gba_sur');
  if (!m2 || m2 <= 0) throw new Error('Ingresá los m²');
  if (!TIPOS[tipo]) throw new Error('Tipo no válido');

  const t = TIPOS[tipo];
  const ajuste = AJUSTE[prov] || 1;
  const usd = t.usd * ajuste;
  const ars = usd * 1200; // estimación dólar blue/MEP ~$1.200 abril 2026

  const desglose = 'Materiales 50% · Mano de obra 30% · Dirección+honorarios 10% · Permisos+contingencias 10%';

  const totalUSD = Math.round(usd * m2);
  const matUSD = Math.round(totalUSD * 0.5);
  const moUSD = Math.round(totalUSD * 0.3);
  const dirUSD = Math.round(totalUSD * 0.1);
  const permUSD = totalUSD - matUSD - moUSD - dirUSD; // resto exacto para que sume el total
  const fmtUSD = (n: number) => `US$${Math.round(n).toLocaleString('es-AR')}`;

  return {
    costoPorM2USD: Math.round(usd),
    costoPorM2ARS: Math.round(ars),
    costoTotalUSD: totalUSD,
    costoTotalARS: Math.round(ars * m2),
    desglose,
    tipo: t.nombre,
    _insight: {
      title: 'Cuánto sale construir esos m²',
      text: `Construir **${m2} m²** del tipo "${t.nombre}" cuesta unos **${fmtUSD(totalUSD)}** (${fmtUSD(usd)}/m²). La mitad (${fmtUSD(matUSD)}) se va en materiales y un 30% (${fmtUSD(moUSD)}) en mano de obra; el resto es dirección, honorarios y permisos.`,
      tone: 'neutral',
      icon: '🏗️',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Materiales', value: matUSD },
        { label: 'Mano de obra', value: moUSD },
        { label: 'Dirección + honorarios', value: dirUSD },
        { label: 'Permisos + contingencias', value: permUSD },
      ],
      prefix: 'US$',
      centerValue: fmtUSD(totalUSD),
      centerLabel: 'Costo total',
      ariaLabel: `El costo total de ${fmtUSD(totalUSD)} se reparte en materiales ${fmtUSD(matUSD)}, mano de obra ${fmtUSD(moUSD)}, dirección y honorarios ${fmtUSD(dirUSD)} y permisos más contingencias ${fmtUSD(permUSD)}.`,
    },
  };
}
