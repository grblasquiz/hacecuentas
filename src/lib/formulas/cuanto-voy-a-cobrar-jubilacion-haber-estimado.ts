/**
 * Estimador de haber jubilatorio ("cuánto voy a cobrar") — SIPA/ANSES, Ley 24.241.
 *
 * ⚠️ ESTIMACIÓN ORIENTATIVA. El haber real lo determina ANSES con las
 * remuneraciones actualizadas por los índices oficiales, la movilidad vigente y
 * las reglas del caso. Esto NO reemplaza el cálculo de ANSES.
 *
 * Modelo simplificado (componente proporcional + piso garantizado):
 *   Haber proporcional = 1,5% × años de aportes × promedio de remuneraciones
 *                        actualizadas (art. 30/32, coeficiente 1,5% por año)
 *   Haber estimado     = máximo(haber mínimo garantizado, haber proporcional)
 *
 * El haber mínimo garantizado vigente, compartido con el resto de las
 * calculadoras previsionales del sitio, actúa de piso. Este modelo omite
 * el componente fijo PBU por separado (queda absorbido por el piso), así que el
 * haber real puede ser algo mayor que el proporcional puro.
 */

export interface Inputs {
  promedioRemuneracion: number; // promedio mensual de remuneraciones actualizadas (últimos ~10 años)
  anosAportes: number;          // años con aportes computables
}

export interface Outputs {
  haberEstimado: string;
  haberProporcional: string;
  haberMinimo: string;
  tasaSustitucion: string;
  aplicaPiso: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Haber mínimo garantizado ANSES — referencial 2026 (misma fuente que
// jubilacion-anses-monto-minimo-maxima-2026.ts). Rota con la movilidad.
import { HABER_MINIMO_ANSES } from '../data/anses-2026';

const HABER_MINIMO = HABER_MINIMO_ANSES;
const COEF_ANUAL = 0.015; // 1,5% por año de aportes (Ley 24.241 art. 30/32)

const fmt = (n: number): string => '$' + Math.round(n).toLocaleString('es-AR');

export function compute(i: Inputs): Outputs {
  const promedio = Number(i.promedioRemuneracion) || 0;
  const anios = Math.max(0, Number(i.anosAportes) || 0);
  if (promedio <= 0) throw new Error('Ingresá el promedio de tus remuneraciones actualizadas.');
  if (anios <= 0) throw new Error('Ingresá tus años de aportes computables.');

  const haberProporcional = COEF_ANUAL * anios * promedio;
  const aplicaPiso = haberProporcional < HABER_MINIMO;
  const haberEstimado = Math.max(HABER_MINIMO, haberProporcional);
  const tasaSustitucion = promedio > 0 ? (haberEstimado / promedio) * 100 : 0;

  const _insight = {
    title: `Haber estimado ${fmt(haberEstimado)}`,
    text: aplicaPiso
      ? `Con **${anios} años de aportes** y un promedio de **${fmt(promedio)}**, el componente proporcional (1,5% × ${anios} × promedio) da **${fmt(haberProporcional)}**, por debajo del **haber mínimo garantizado (${fmt(HABER_MINIMO)})**, así que cobrarías al menos el mínimo. Es una **estimación orientativa**: el haber real lo calcula ANSES.`
      : `Con **${anios} años de aportes** y un promedio de **${fmt(promedio)}**, el haber estimado es **${fmt(haberEstimado)}/mes**, una tasa de sustitución del **${tasaSustitucion.toFixed(0)}%** de tu sueldo. Es una **estimación orientativa** (1,5% por año de aportes); el haber real lo determina ANSES con las remuneraciones actualizadas y la movilidad vigente.`,
    tone: 'warn',
    icon: '👵',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Haber estimado', 'Haber mínimo', 'Tu promedio'],
    values: [Math.round(haberEstimado), HABER_MINIMO, Math.round(promedio)],
    prefix: '$',
    ariaLabel: `Haber estimado ${fmt(haberEstimado)} frente al haber mínimo ${fmt(HABER_MINIMO)} y tu promedio de remuneraciones ${fmt(promedio)}.`,
  };

  return {
    haberEstimado: fmt(haberEstimado),
    haberProporcional: fmt(haberProporcional),
    haberMinimo: fmt(HABER_MINIMO),
    tasaSustitucion: tasaSustitucion.toFixed(0) + '%',
    aplicaPiso: aplicaPiso ? 'Sí, cobra el haber mínimo garantizado' : 'No, supera el mínimo',
    detalle: `1,5% × ${anios} años × ${fmt(promedio)} = ${fmt(haberProporcional)}; piso ${fmt(HABER_MINIMO)} → haber estimado ${fmt(haberEstimado)} (sustitución ${tasaSustitucion.toFixed(0)}%).`,
    _insight,
    _chart,
  };
}
