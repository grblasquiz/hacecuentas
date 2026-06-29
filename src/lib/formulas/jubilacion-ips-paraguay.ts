/**
 * Jubilación IPS — PARAGUAY 2026.
 * Estima el tipo de jubilación y el haber según edad, años de aporte y el promedio
 * salarial de los últimos 120 meses (10 años), conforme a la Ley N° 7746/2024 que
 * unificó la base de cálculo del IPS en el promedio de los últimos 120 salarios.
 *
 * Tipos (requisitos IPS):
 *   Ordinaria   → edad ≥ 60 y aportes ≥ 25 años  → 100% del promedio.
 *   Anticipada  → edad ≥ 55 y aportes ≥ 30 años  → 80% + 4 puntos por año sobre 55
 *                 (tope 100% a los 60), jubilación proporcional reducida por adelanto.
 *   Proporcional→ edad ≥ 65 y aportes ≥ 15 años  → haber proporcional a los años
 *                 aportados (60% × años/25). ⚠️ El % proporcional exacto depende de la
 *                 reglamentación del IPS; este valor es una ESTIMACIÓN orientativa.
 *
 * Fuente: IPS, Ley 7746/2024. El haber es una estimación: el cálculo definitivo lo
 * realiza el IPS sobre el historial real de aportes.
 */
import { fmtPYG } from '../data/paraguay-2026';

export interface JubilacionIpsParaguayInputs {
  edad?: number | string;
  anosAporte?: number | string;
  promedioSalario120m?: number | string;
}

export interface JubilacionIpsParaguayOutputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function jubilacionIpsParaguay(i: JubilacionIpsParaguayInputs): JubilacionIpsParaguayOutputs {
  const edad = Math.max(0, Number(i.edad) || 0);
  const anosAporte = Math.max(0, Number(i.anosAporte) || 0);
  const promedio = Math.max(0, Number(i.promedioSalario120m) || 0);

  if (edad <= 0) throw new Error('Ingresá tu edad');
  if (promedio <= 0) throw new Error('Ingresá el promedio de tus últimos 120 salarios (Gs.)');

  let tipoJubilacion = '';
  let porcentaje = 0;
  let cumpleRequisitos = 'No';
  let estimacion = false;

  if (edad >= 60 && anosAporte >= 25) {
    tipoJubilacion = 'Ordinaria';
    porcentaje = 1.0;
    cumpleRequisitos = 'Sí';
  } else if (edad >= 55 && anosAporte >= 30) {
    tipoJubilacion = 'Anticipada';
    // 80% a los 55, +4 pp por cada año hasta tope 100% a los 60.
    porcentaje = Math.min(1.0, 0.8 + 0.04 * Math.max(0, Math.min(edad, 59) - 55));
    cumpleRequisitos = 'Sí';
  } else if (edad >= 65 && anosAporte >= 15) {
    tipoJubilacion = 'Proporcional';
    porcentaje = 0.6 * (anosAporte / 25);
    cumpleRequisitos = 'Sí';
    estimacion = true; // % proporcional orientativo
  } else {
    tipoJubilacion = 'No cumple requisitos';
    porcentaje = 0;
    cumpleRequisitos = 'No';
  }

  const haberEstimado = promedio * porcentaje;

  const _insight = cumpleRequisitos === 'Sí'
    ? {
        type: 'highlight' as const,
        icon: '🧓',
        text:
          `Con **${edad} años** y **${anosAporte} años** de aportes accedés a la jubilación **${tipoJubilacion}**, ` +
          `que paga el **${(porcentaje * 100).toFixed(0)}%** del promedio de tus últimos 120 salarios. ` +
          `Sobre un promedio de **${fmtPYG(promedio)}**, el haber estimado es **${fmtPYG(haberEstimado)}** por mes.` +
          (estimacion ? ' ⚠️ El porcentaje proporcional es orientativo; el IPS define el monto exacto.' : ''),
      }
    : {
        type: 'highlight' as const,
        icon: '⏳',
        text:
          `Con **${edad} años** y **${anosAporte} años** de aportes **todavía no cumplís** los requisitos del IPS. ` +
          `Necesitás: Ordinaria (60 años y 25 de aportes), Anticipada (55 años y 30 de aportes) o ` +
          `Proporcional (65 años y 15 de aportes).`,
      };

  const _table = {
    title: 'Requisitos de jubilación del IPS (Paraguay)',
    headers: ['Tipo', 'Edad mínima', 'Años de aporte', 'Haber sobre el promedio'],
    rows: [
      ['Ordinaria', '60 años', '25 años', '100%'],
      ['Anticipada', '55 años', '30 años', '80% + 4 pp/año (tope 100% a los 60)'],
      ['Proporcional', '65 años', '15 años', 'Proporcional a los años aportados (estimado)'],
    ],
    note: `Base de cálculo: promedio de los últimos 120 salarios (Ley 7746/2024). El haber mostrado es una estimación; el monto definitivo lo determina el IPS sobre el historial real de aportes.`,
  };

  return {
    tipoJubilacion,
    porcentaje: Number((porcentaje * 100).toFixed(1)),
    haberEstimado: Math.round(haberEstimado),
    cumpleRequisitos,
    resumen: cumpleRequisitos === 'Sí'
      ? `${tipoJubilacion}: ${(porcentaje * 100).toFixed(0)}% × ${fmtPYG(promedio)} = ${fmtPYG(haberEstimado)}/mes (estimado)`
      : 'No cumple los requisitos mínimos del IPS',
    _insight,
    _table,
  };
}
