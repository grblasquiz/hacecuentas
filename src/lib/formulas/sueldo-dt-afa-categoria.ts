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
  _chart?: any;
  _insight?: any;
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

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Base', value: Math.round(base) },
      { label: 'Adic. experiencia', value: Math.round(adicExp) },
      { label: 'Adic. títulos', value: Math.round(adicTit) },
      { label: 'Viáticos', value: Math.round(viaticosM) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalMensual).toLocaleString('es-AR'),
    centerLabel: 'Total mensual',
    ariaLabel: 'Composición del sueldo mensual del DT: base, adicional por experiencia, adicional por títulos y viáticos.',
  };

  const adicionales = adicExp + adicTit + viaticosM;
  const pctAdic = totalMensual > 0 ? Math.round((adicionales / totalMensual) * 100) : 0;
  const insight = {
    title: 'Cuánto pesan tus adicionales',
    text: pctAdic >= 25
      ? `Tu experiencia, títulos y viáticos suman **$${Math.round(adicionales).toLocaleString('es-AR')}/mes**, el **${pctAdic}%** del total — bastante por encima del básico de la categoría.`
      : `El grueso del sueldo es el básico de ${info.nombre}: los adicionales aportan **$${Math.round(adicionales).toLocaleString('es-AR')}/mes** (**${pctAdic}%**). Sumar títulos y antigüedad es la palanca para subirlo.`,
    tone: pctAdic >= 25 ? 'good' : 'neutral',
    icon: '⚽',
  };

  return {
    sueldoMensualBase: Math.round(base),
    adicionalExperiencia: Math.round(adicExp),
    adicionalTitulos: Math.round(adicTit),
    viaticosMensuales: Math.round(viaticosM),
    sueldoMensualTotal: Math.round(totalMensual),
    sueldoAnual: Math.round(anual),
    premioObjetivos: Math.round(premios),
    moneda: 'ARS',
    _chart: chart,
    _insight: insight,
    resumen: `DT ${info.nombre}: **$${Math.round(totalMensual).toLocaleString('es-AR')} /mes** (base $${base.toLocaleString('es-AR')} + exp $${Math.round(adicExp).toLocaleString('es-AR')} + títulos $${Math.round(adicTit).toLocaleString('es-AR')}). Anual: **$${Math.round(anual).toLocaleString('es-AR')}**.`,
  };
}
