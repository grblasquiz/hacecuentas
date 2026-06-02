/** Edad de la tortuga en años humanos según especie. */
export interface Inputs {
  edadAnios: number;
  especie?: string;
}
export interface Outputs {
  edadHumana: number;
  etapaVital: string;
  madurezSexual: string;
  expectativaTotal: number;
  _insight?: any;
  _chart?: any;
}

export function edadHumanaTortuga(i: Inputs): Outputs {
  const e = Math.max(0, Number(i.edadAnios));
  const especie = String(i.especie || 'mediterranea');

  // Factores: primeros años más lentos, luego lineal
  const factores: Record<string, { primerosAnios: number; ratioPrimeros: number; ratioAdulto: number; expectativa: number; madurez: number }> = {
    'mediterranea': { primerosAnios: 5, ratioPrimeros: 1.6, ratioAdulto: 1.1, expectativa: 70, madurez: 8 },
    'rusa': { primerosAnios: 5, ratioPrimeros: 1.8, ratioAdulto: 1.3, expectativa: 50, madurez: 7 },
    'sulcata': { primerosAnios: 5, ratioPrimeros: 1.2, ratioAdulto: 1.05, expectativa: 85, madurez: 17 },
    'leopardo': { primerosAnios: 5, ratioPrimeros: 1.2, ratioAdulto: 1.05, expectativa: 70, madurez: 12 },
    'trachemys': { primerosAnios: 5, ratioPrimeros: 2.0, ratioAdulto: 1.6, expectativa: 25, madurez: 4 },
    'matamata': { primerosAnios: 5, ratioPrimeros: 1.6, ratioAdulto: 1.3, expectativa: 30, madurez: 7 },
    'otra-acuatica': { primerosAnios: 5, ratioPrimeros: 1.8, ratioAdulto: 1.4, expectativa: 30, madurez: 5 },
  };
  const f = factores[especie] ?? factores['mediterranea'];

  let humana = 0;
  if (e <= f.primerosAnios) humana = e * f.ratioPrimeros;
  else humana = f.primerosAnios * f.ratioPrimeros + (e - f.primerosAnios) * f.ratioAdulto;

  // Etapa vital (tomando expectativa)
  const pct = e / f.expectativa;
  let etapa = '';
  if (e < 2) etapa = 'Cría';
  else if (e < f.madurez) etapa = 'Juvenil';
  else if (pct < 0.3) etapa = 'Adulto joven';
  else if (pct < 0.7) etapa = 'Adulto';
  else if (pct < 0.9) etapa = 'Adulto mayor';
  else etapa = 'Anciano';

  const madurezTxt = e >= f.madurez
    ? 'Ya alcanzó madurez sexual'
    : `~${Math.round(f.madurez - e)} años hasta madurez sexual`;

  const edadHumanaR = Math.round(humana);
  const insightTone = pct < 0.7 ? 'good' : pct < 0.9 ? 'neutral' : 'warn';
  const insightText = pct < 0.7
    ? `Tu tortuga de **${e} año${e !== 1 ? 's' : ''}** equivale a **${edadHumanaR} años humanos** (**${etapa}**). Le queda muchísima vida por delante: estas especies viven ~**${f.expectativa} años**. ${madurezTxt}.`
    : pct < 0.9
      ? `Con **${e} años** equivale a **${edadHumanaR} años humanos** (**${etapa}**), ya entrada en la madurez para una expectativa de ~**${f.expectativa} años**. ${madurezTxt}.`
      : `A los **${e} años** es una tortuga **${etapa}** (**${edadHumanaR} años humanos**), cerca de la expectativa de ~**${f.expectativa} años**. Extremá los cuidados de temperatura, dieta y revisiones.`;

  return {
    edadHumana: edadHumanaR,
    etapaVital: etapa,
    madurezSexual: madurezTxt,
    expectativaTotal: f.expectativa,
    _insight: {
      title: 'Tu tortuga en edad humana',
      text: insightText,
      tone: insightTone,
      icon: '🐢',
    },
    _chart: {
      type: 'scale',
      marker: e,
      markerLabel: `${e} año${e !== 1 ? 's' : ''} · ${etapa}`,
      min: 0,
      segments: [
        { nombre: 'Cría/Juvenil', max: Math.round(f.madurez), color: '#bfdbfe', colorDark: '#1e3a5f' },
        { nombre: 'Adulto joven', max: Math.round(f.expectativa * 0.3), color: '#4ade80', colorDark: '#166534' },
        { nombre: 'Adulto', max: Math.round(f.expectativa * 0.7), color: '#a3e635', colorDark: '#3f6212' },
        { nombre: 'Adulto mayor', max: Math.round(f.expectativa * 0.9), color: '#fb923c', colorDark: '#7c2d12' },
        { nombre: 'Anciano', max: Math.max(Math.round(f.expectativa), Math.ceil(e) + 1), color: '#f87171', colorDark: '#7f1d1d' },
      ],
      ariaLabel: `Etapa de vida de la tortuga a los ${e} años: ${etapa}, sobre una expectativa de ${f.expectativa} años`,
    },
  };
}
