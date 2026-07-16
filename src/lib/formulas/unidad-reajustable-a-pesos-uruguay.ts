/**
 * Conversor Unidad Reajustable (UR) ⇄ pesos uruguayos (Uruguay 2026).
 *
 * La UR se ajusta MENSUALMENTE por la variación del Índice Medio de Salarios (IMS)
 * del mes anterior. La publica el INE y la difunde la DGI. Regla oficial: el valor
 * de la UR de cada mes se aplica durante el mes siguiente. A diferencia de la UI
 * (que sigue el IPC/precios), la UR sigue los SALARIOS. Se usa para reajuste de
 * alquileres de vivienda, arrendamientos rurales, créditos del BHU/ANV y algunas
 * multas/sanciones.
 *
 * Data: src/lib/data/uruguay-2026.ts → URUGUAY_2026.unidadReajustable.
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Monto a convertir. */
  monto: number;
  /** Dirección de la conversión. */
  direccion?: 'ur-pesos' | 'pesos-ur';
}

export interface Outputs {
  resultado: string;
  valorUr: string;
  detalle: string;
  fecha: string;
  _insight?: any;
}

/** Formatea una cantidad de UR: "1.234,56 UR". */
function fmtUR(n: number): string {
  return (
    new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      Math.round(n * 100) / 100,
    ) + ' UR'
  );
}

export function compute(i: Inputs): Outputs {
  const monto = Math.max(0, Number(i.monto) || 0);
  const direccion = i.direccion === 'pesos-ur' ? 'pesos-ur' : 'ur-pesos';
  const valor = URUGUAY_2026.unidadReajustable.valor; // $U por 1 UR
  const mes = URUGUAY_2026.unidadReajustable.mesValor;

  let resultado: string;
  let detalle: string;
  let insightText: string;
  if (direccion === 'ur-pesos') {
    const pesos = monto * valor;
    resultado = `${fmtUR(monto)} = ${fmtUYU(pesos)}`;
    detalle = `${fmtUR(monto)} × ${fmtUYU(valor)} por UR = ${fmtUYU(pesos)}`;
    insightText = `Al valor de ${mes}, ${fmtUR(monto)} equivalen a ${fmtUYU(pesos)}.`;
  } else {
    const ur = valor > 0 ? monto / valor : 0;
    resultado = `${fmtUYU(monto)} = ${fmtUR(ur)}`;
    detalle = `${fmtUYU(monto)} ÷ ${fmtUYU(valor)} por UR = ${fmtUR(ur)}`;
    insightText = `${fmtUYU(monto)} equivalen a ${fmtUR(ur)} al valor de ${mes}.`;
  }

  return {
    resultado,
    valorUr: `1 UR = ${fmtUYU(valor)}`,
    detalle,
    fecha: `Valor UR de ${mes} (${URUGUAY_2026.unidadReajustable.fuente})`,
    _insight: { type: 'highlight', icon: '🏠', text: insightText, tone: 'info' as const },
  };
}
