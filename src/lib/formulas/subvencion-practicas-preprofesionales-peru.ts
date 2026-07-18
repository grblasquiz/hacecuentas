/**
 * Subvención de prácticas preprofesionales y profesionales — Perú (Ley 28518).
 * Subvención mensual mínima = 1 RMV (S/ 1.130 en 2026) cumpliendo la jornada máxima;
 * si la jornada es menor, la subvención mínima es proporcional a las horas.
 * Jornada máxima: preprofesional 6 h/día o 30 h/semana · profesional 8 h/día o 48 h/semana.
 * Además: media subvención adicional por cada 6 meses continuos, 15 días de descanso
 * subvencionado si la práctica dura 12+ meses, y seguro de salud a cargo de la empresa.
 * La subvención NO está afecta a AFP/ONP ni retenciones (no es remuneración).
 * Fuente: SUNAFIL / MTPE. Verificado 2026-07-18.
 */
import { PERU_2026, PRACTICAS_PERU_2026, fmtPEN2 } from '../data/peru-2026.ts';

export interface Inputs {
  tipo?: string;                 // 'preprofesional' | 'profesional'
  horas?: number | string;       // horas por semana
  duracion?: number | string;    // duración del convenio en meses
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const tipo = (String(i.tipo) === 'profesional' ? 'profesional' : 'preprofesional') as 'preprofesional' | 'profesional';
  const jornadaMax = PRACTICAS_PERU_2026.jornadaMaxSemanal[tipo];
  const horas = Math.max(1, Math.min(jornadaMax, Number(i.horas) || jornadaMax));
  const duracion = Math.max(1, Math.min(60, Math.floor(Number(i.duracion) || 6)));
  const rmv = PERU_2026.rmv;

  const proporcion = horas / jornadaMax;
  const subvencionMensual = rmv * proporcion;
  const periodosDe6 = Math.floor(duracion / 6);
  const adicional = periodosDe6 * (subvencionMensual / 2);
  const totalPeriodo = subvencionMensual * duracion + adicional;

  const jornadaTxt = tipo === 'preprofesional' ? '6 h/día o 30 h/semana' : '8 h/día o 48 h/semana';
  const _insight = {
    title: `Tu subvención mínima: ${fmtPEN2(subvencionMensual)}/mes`,
    text: proporcion >= 1
      ? `Como practicante **${tipo}** a jornada completa (${jornadaTxt}), tu subvención mensual no puede ser menor a **1 RMV = ${fmtPEN2(rmv)}**.${periodosDe6 > 0 ? ` Además, por ${duracion} meses te tocan **${periodosDe6} pago(s) adicional(es)** de media subvención (${fmtPEN2(subvencionMensual / 2)} cada uno): el convenio completo suma **${fmtPEN2(totalPeriodo)}**.` : ''} La empresa también debe darte seguro de salud y, si la práctica llega a 12 meses, 15 días de descanso subvencionado.`
      : `Con **${horas} h/semana** (jornada parcial sobre un máximo de ${jornadaMax} h), tu subvención mínima proporcional es **${fmtPEN2(subvencionMensual)}** al mes (${(proporcion * 100).toFixed(0)}% de la RMV ${fmtPEN2(rmv)}).${periodosDe6 > 0 ? ` Por ${duracion} meses sumas ${periodosDe6} media(s) subvención(es) extra: total del convenio **${fmtPEN2(totalPeriodo)}**.` : ''} Es un mínimo legal: la empresa puede pagar más.`,
    tone: 'neutral',
    icon: '🎓',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: `Subvención (${duracion} meses)`, value: Math.round(subvencionMensual * duracion * 100) / 100 },
      ...(adicional > 0 ? [{ label: `Adicional por 6 meses (×${periodosDe6})`, value: Math.round(adicional * 100) / 100 }] : []),
    ],
    prefix: 'S/ ',
    centerValue: fmtPEN2(totalPeriodo),
    centerLabel: 'Convenio',
    ariaLabel: `Subvención total del convenio: ${fmtPEN2(totalPeriodo)}.`,
  };

  return {
    subvencionMensual: fmtPEN2(subvencionMensual),
    adicionalSemestral: periodosDe6 > 0 ? `${fmtPEN2(subvencionMensual / 2)} × ${periodosDe6} = ${fmtPEN2(adicional)}` : 'Aún no aplica (menos de 6 meses)',
    totalConvenio: fmtPEN2(totalPeriodo),
    detalle: `${tipo === 'preprofesional' ? 'Práctica preprofesional' : 'Práctica profesional'}: ${horas} h/sem ÷ ${jornadaMax} h máx = ${(proporcion * 100).toFixed(0)}% × RMV ${fmtPEN2(rmv)} = ${fmtPEN2(subvencionMensual)}/mes · ${duracion} meses + ${periodosDe6} adicional(es) de media subvención = ${fmtPEN2(totalPeriodo)}.`,
    _insight,
    _chart,
  };
}
