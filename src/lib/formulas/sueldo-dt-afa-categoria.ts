/** Sueldo estimado DT AFA según categoría de liga y experiencia */
export interface Inputs {
  categoria: string; // 'primera-a' | 'primera-nacional' | 'primera-b-metro' | 'primera-c' | 'primera-d' | 'reserva' | 'juveniles'
  experienciaAnos: number;
  titulosGanados: number;
  viaticos: boolean;
  premioContrato: number; // % sueldo anual en premios
}

export interface Outputs {
  sueldoMensualBase: number;
  adicionalExperiencia: number;
  adicionalTitulos: number;
  viaticosMensuales: number;
  sueldoMensualTotal: number;
  sueldoAnual: number;
  premioObjetivos: number;
  moneda: string;
  resumen: string;
}

// Valores estimados de referencia AFA / Sindicato de Entrenadores abril 2026
const BASE: Record<string, { mensual: number; nombre: string }> = {
  'primera-a': { mensual: 3_000_000, nombre: 'Liga Profesional (Primera A)' },
  'primera-nacional': { mensual: 1_500_000, nombre: 'Primera Nacional (Ascenso)' },
  'primera-b-metro': { mensual: 800_000, nombre: 'Primera B Metropolitana' },
  'primera-c': { mensual: 450_000, nombre: 'Primera C' },
  'primera-d': { mensual: 280_000, nombre: 'Primera D' },
  reserva: { mensual: 700_000, nombre: 'Reserva / Profesional joven' },
  juveniles: { mensual: 400_000, nombre: 'Inferiores / Juveniles' },
};

export function sueldoDtAfaCategoria(i: Inputs): Outputs {
  const cat = String(i.categoria || 'primera-b-metro');
  const exp = Math.max(0, Number(i.experienciaAnos) || 0);
  const tit = Math.max(0, Number(i.titulosGanados) || 0);
  const viaticos = Boolean(i.viaticos);
  const pctPremio = Math.max(0, Number(i.premioContrato) || 0);

  const info = BASE[cat] || BASE['primera-b-metro'];
  const base = info.mensual;
  const adicExp = Math.min(0.5, exp * 0.04) * base; // hasta +50% por 12+ años
  const adicTit = Math.min(1.0, tit * 0.15) * base; // hasta +100% por 7 títulos
  const viaticosM = viaticos ? base * 0.08 : 0;
  const totalMensual = base + adicExp + adicTit + viaticosM;
  const anual = totalMensual * 13; // 12 + SAC
  const premios = anual * (pctPremio / 100);

  return {
    sueldoMensualBase: Math.round(base),
    adicionalExperiencia: Math.round(adicExp),
    adicionalTitulos: Math.round(adicTit),
    viaticosMensuales: Math.round(viaticosM),
    sueldoMensualTotal: Math.round(totalMensual),
    sueldoAnual: Math.round(anual),
    premioObjetivos: Math.round(premios),
    moneda: 'ARS',
    resumen: `DT ${info.nombre}: **$${Math.round(totalMensual).toLocaleString('es-AR')} /mes** (base $${base.toLocaleString('es-AR')} + exp $${Math.round(adicExp).toLocaleString('es-AR')} + títulos $${Math.round(adicTit).toLocaleString('es-AR')}). Anual: **$${Math.round(anual).toLocaleString('es-AR')}**.`,
  };
}
