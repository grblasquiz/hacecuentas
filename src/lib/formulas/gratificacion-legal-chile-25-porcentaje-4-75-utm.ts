// Ingreso mínimo mensual y tope de gratificación 2026 desde la fuente única.
import { CHILE_2026 } from "../data/chile-2026";

export interface Inputs {
  sueldo_mensual: number;
  modalidad: '25_remuneracion' | '30_utilidades';
  utilidades_anuales: number;
  region: 'metropolitana' | 'valparaiso' | 'ohiggins' | 'maule' | 'biobio' | 'araucania' | 'losrios' | 'loslagos' | 'aysen' | 'magallanes' | 'arica' | 'tarapaca' | 'antofagasta' | 'atacama' | 'coquimbo' | 'ñuble';
}

export interface Outputs {
  gratificacion_mensual_25: number;
  gratificacion_anual_25: number;
  gratificacion_mensual_30: number;
  gratificacion_anual_30: number;
  iusc_25_anual: number;
  iusc_30_anual: number;
  gratificacion_neta_25: number;
  gratificacion_neta_30: number;
  diferencia_modalidades: number;
  tope_maximo_umm: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Art. 50 CT: la gratificación no excede 4,75 ingresos mínimos mensuales (IMM) AL AÑO.
  const IMM_2026 = CHILE_2026.imm; // $553.553 (Ley 21.830, desde may-2026)
  const TOPE_GRATIFICACION_ANUAL = CHILE_2026.gratificacionArt50.topeImmAnual * IMM_2026; // 4,75 × IMM = $2.629.377 al año
  const TOPE_GRATIFICACION = TOPE_GRATIFICACION_ANUAL / 12; // tope mensual equivalente = $219.115

  // Tasas IUSC por región — Fuente: SII 2026
  const iusc_rates: { [key in Inputs['region']]: number } = {
    metropolitana: 0.0095,
    valparaiso: 0.0095,
    ohiggins: 0.0095,
    maule: 0.0095,
    biobio: 0.0095,
    araucania: 0.0095,
    losrios: 0.0095,
    loslagos: 0.0095,
    aysen: 0.0144,
    magallanes: 0.0144,
    arica: 0.0095,
    tarapaca: 0.0144,
    antofagasta: 0.0144,
    atacama: 0.0095,
    coquimbo: 0.0095,
    ñuble: 0.0095
  };

  const iusc_rate = iusc_rates[i.region];

  // Validaciones básicas
  const sueldo_valido = Math.max(i.sueldo_mensual, IMM_2026);
  const utilidades_validas = Math.max(i.utilidades_anuales, 0);

  // MODALIDAD 25% DE REMUNERACIÓN
  const gratificacion_sin_tope_25 = sueldo_valido * 0.25;
  const gratificacion_mensual_25 = Math.min(gratificacion_sin_tope_25, TOPE_GRATIFICACION);
  const gratificacion_anual_25 = gratificacion_mensual_25 * 12;
  const iusc_25_anual = gratificacion_anual_25 * iusc_rate;
  const gratificacion_neta_25 = gratificacion_anual_25 - iusc_25_anual;

  // MODALIDAD 30% DE UTILIDADES
  const gratificacion_anual_30 = utilidades_validas * 0.30;
  const gratificacion_mensual_30 = utilidades_validas > 0 ? gratificacion_anual_30 / 12 : 0;
  const iusc_30_anual = gratificacion_anual_30 * iusc_rate;
  const gratificacion_neta_30 = gratificacion_anual_30 - iusc_30_anual;

  // Diferencia (positivo = modalidad 30% es mayor)
  const diferencia_modalidades = gratificacion_neta_30 - gratificacion_neta_25;

  // Insight: ¿el tope de 4,75 UMM recorta la gratificación del 25%?
  const tope_aplica = gratificacion_sin_tope_25 > TOPE_GRATIFICACION;
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  let _insight: any;
  if (tope_aplica) {
    _insight = {
      title: 'Tope legal alcanzado',
      text: `Tu 25% da ${fmt(gratificacion_sin_tope_25)} mensual, pero la ley topa la gratificación en **4,75 ingresos mínimos al año (tope mensual ${fmt(TOPE_GRATIFICACION)})**, así que cobrás ese máximo. En el año son **${fmt(gratificacion_anual_25)}** y te quedan **${fmt(gratificacion_neta_25)}** netos tras el IUSC.`,
      tone: 'warn',
      icon: '🚧',
    };
  } else if (utilidades_validas > 0 && diferencia_modalidades > 0) {
    _insight = {
      title: 'Te conviene el 30% de utilidades',
      text: `Con el 30% de utilidades cobrarías **${fmt(gratificacion_neta_30)}** netos al año, **${fmt(Math.abs(diferencia_modalidades))} más** que con el 25% de tu sueldo (${fmt(gratificacion_neta_25)}). El empleador puede elegir la modalidad, pero esta te favorece.`,
      tone: 'good',
      icon: '📈',
    };
  } else if (utilidades_validas > 0 && diferencia_modalidades < 0) {
    _insight = {
      title: 'Te conviene el 25% de tu sueldo',
      text: `El 25% de tu sueldo te deja **${fmt(gratificacion_neta_25)}** netos al año, **${fmt(Math.abs(diferencia_modalidades))} más** que el 30% de utilidades (${fmt(gratificacion_neta_30)}). Sin tope aplicado, esta es la opción más alta para vos.`,
      tone: 'good',
      icon: '💰',
    };
  } else {
    _insight = {
      title: 'Tu gratificación anual',
      text: `Con el 25% de tu sueldo cobrás **${fmt(gratificacion_anual_25)}** brutos al año (**${fmt(gratificacion_mensual_25)}** mensuales), que quedan en **${fmt(gratificacion_neta_25)}** netos tras descontar el IUSC.`,
      tone: 'neutral',
      icon: '💵',
    };
  }

  // Gráfico: el bruto anual del 25% se reparte en neto + IUSC retenido
  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Gratificación neta', value: Math.round(gratificacion_neta_25) },
      { label: 'IUSC retenido', value: Math.round(iusc_25_anual) },
    ],
    prefix: '$',
    centerValue: fmt(gratificacion_anual_25),
    centerLabel: 'Bruto anual',
    ariaLabel: 'Composición de la gratificación anual del 25%: monto neto más el IUSC retenido',
  };

  return {
    gratificacion_mensual_25: Math.round(gratificacion_mensual_25),
    gratificacion_anual_25: Math.round(gratificacion_anual_25),
    gratificacion_mensual_30: Math.round(gratificacion_mensual_30),
    gratificacion_anual_30: Math.round(gratificacion_anual_30),
    iusc_25_anual: Math.round(iusc_25_anual),
    iusc_30_anual: Math.round(iusc_30_anual),
    gratificacion_neta_25: Math.round(gratificacion_neta_25),
    gratificacion_neta_30: Math.round(gratificacion_neta_30),
    diferencia_modalidades: Math.round(diferencia_modalidades),
    tope_maximo_umm: Math.round(TOPE_GRATIFICACION),
    _insight,
    _chart
  };
}
