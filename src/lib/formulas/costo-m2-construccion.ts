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
}

// Costos orientativos Argentina 2026 en USD/m² (CAC, CPIC estimaciones)
const TIPOS: Record<string, { nombre: string; usd: number }> = {
  economico: { nombre: 'Económico (vivienda social, campo)', usd: 600 },
  estandar: { nombre: 'Estándar (casa media urbana)', usd: 900 },
  medio: { nombre: 'Casa media (clase media, GBA/CABA)', usd: 1200 },
  alto: { nombre: 'Casa de alta categoría (country, barrio cerrado)', usd: 1800 },
  premium: { nombre: 'Premium (alta gama, mármol, domótica)', usd: 2800 },
  ampliacion: { nombre: 'Ampliación sobre obra existente', usd: 700 },
  reforma: { nombre: 'Reforma integral (con estructura)', usd: 500 },
  dpto_estandar: { nombre: 'Departamento torre estándar', usd: 1100 },
  dpto_premium: { nombre: 'Departamento premium (Puerto Madero)', usd: 2200 },
  galpon: { nombre: 'Galpón industrial tipo', usd: 450 },
};

// Ajuste por provincia
const AJUSTE: Record<string, number> = {
  caba: 1.25,
  gba_norte: 1.15,
  gba_sur: 1.00,
  cordoba: 0.95,
  rosario: 0.95,
  mendoza: 0.90,
  interior: 0.85,
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

  return {
    costoPorM2USD: Math.round(usd),
    costoPorM2ARS: Math.round(ars),
    costoTotalUSD: Math.round(usd * m2),
    costoTotalARS: Math.round(ars * m2),
    desglose,
    tipo: t.nombre,
  };
}
