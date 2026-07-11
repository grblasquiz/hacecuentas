/**
 * Calculadora de Prima de Antigüedad México (LFT art. 162)
 * 12 días de salario por cada año de servicio, con tope 2 SMG diarios.
 * Aplica en jubilación, despido, defunción, o renuncia con 15+ años.
 * Constantes desde src/lib/data/mexico-2026.ts (SM general 2026: $315.04/día).
 */
import { MEXICO_2026 } from '../data/mexico-2026.ts';

export interface Inputs {
  salarioDiario: number;
  aniosAntiguedad: number;
  // Motivos vigentes + retro-compat (jubilacion, despido, renuncia-15, renuncia-menos15)
  motivo?:
    | 'despido-injustificado'
    | 'despido-justificado'
    | 'renuncia'
    | 'incapacidad'
    | 'defuncion'
    | 'jubilacion'
    | 'despido'
    | 'renuncia-15'
    | 'renuncia-menos15';
  smgDiario?: number;
  // retro-compat
  sueldoDiario?: number;
  aniosServicio?: number;
  salarioMinimoGeneral?: number;
}

export interface Outputs {
  primaAntiguedad: number;
  salarioAplicable: number;
  diasPrima: number;
  aplica: string;
  salarioTope: number;
  mensaje: string;
  _insight?: any;
}

export function primaAntiguedadMexico(i: Inputs): Outputs {
  const sueldo = Number(i.salarioDiario ?? i.sueldoDiario);
  const anios = Number(i.aniosAntiguedad ?? i.aniosServicio);
  // Guard de default: ''/null/undefined/0 → SM general 2026 (nunca || que pise un valor válido)
  const smgRaw = i.smgDiario ?? i.salarioMinimoGeneral;
  const smgNum = Number(smgRaw);
  const smgDiario = (smgRaw === undefined || smgRaw === null || (smgRaw as unknown) === '' || !Number.isFinite(smgNum) || smgNum <= 0)
    ? MEXICO_2026.salarioMinimo.generalDiario
    : smgNum;
  const motivo = i.motivo ?? 'despido';

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá el salario diario');
  if (!anios || anios <= 0) throw new Error('Ingresá los años de antigüedad');

  const tope = smgDiario * 2;
  const salarioAplicable = Math.min(sueldo, tope);
  const diasPrima = 12 * anios;

  // Solo aplica en: jubilación, despido, defunción, renuncia con 15+ años
  const aplicaFinal = motivo !== 'renuncia-menos15';
  const primaAntiguedad = aplicaFinal ? diasPrima * salarioAplicable : 0;

  const mxn = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');
  const topeAplicado = aplicaFinal && sueldo > tope;
  const _insight = aplicaFinal
    ? {
        title: 'Tu prima de antigüedad',
        text: `Por **${anios} año${anios === 1 ? '' : 's'}** de servicio te corresponden **${diasPrima} días** a razón de **${mxn(salarioAplicable)}/día**, lo que da una prima de **${mxn(primaAntiguedad)}**.${topeAplicado ? ` Tu salario supera el tope de 2 SMG (${mxn(tope)}/día), así que la prima se liquida sobre ese límite (LFT art. 162).` : ''}`,
        tone: 'neutral' as const,
        icon: '⚖️',
      }
    : {
        title: 'No te corresponde prima',
        text: `Por **renuncia voluntaria con menos de 15 años** no aplica la prima de antigüedad (LFT art. 162). Solo se paga en jubilación, despido, defunción o renuncia con **15+ años**.`,
        tone: 'warn' as const,
        icon: '⚖️',
      };

  return {
    primaAntiguedad: Number(primaAntiguedad.toFixed(2)),
    salarioAplicable: Number(salarioAplicable.toFixed(2)),
    diasPrima,
    aplica: aplicaFinal ? 'Sí aplica' : 'No aplica (renuncia con menos de 15 años)',
    salarioTope: Number(tope.toFixed(2)),
    mensaje: aplicaFinal
      ? `Por ${anios} años te corresponden ${diasPrima} días × $${salarioAplicable.toFixed(2)} = $${primaAntiguedad.toFixed(2)} de prima de antigüedad.`
      : `No aplica prima de antigüedad por renuncia con menos de 15 años (LFT Art. 162).`,
    _insight,
  };
}
