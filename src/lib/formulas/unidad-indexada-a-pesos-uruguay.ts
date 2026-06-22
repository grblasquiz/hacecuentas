import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface UnidadIndexadaAPesosUruguayInputs {
  /** Monto a convertir. */
  monto: number;
  /** Dirección de la conversión. */
  direccion: 'ui-pesos' | 'pesos-ui';
}

export interface UnidadIndexadaAPesosUruguayOutputs {
  resultado: string;
  valorUi: string;
  detalle: string;
  fecha: string;
}

/** Formatea una cantidad de UI: "1.234,56 UI". */
function fmtUI(n: number): string {
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Math.round(n * 100) / 100,
  ) + ' UI';
}

/**
 * Conversor Unidad Indexada (UI) ⇄ pesos uruguayos.
 * La UI se ajusta a diario por el IPC; su valor lo publica el INE y lo difunde la DGI/BCU.
 * Se usa para alquileres, créditos hipotecarios, ahorro indexado y algunos tributos.
 */
export function unidadIndexadaAPesosUruguay(
  inputs: UnidadIndexadaAPesosUruguayInputs,
): UnidadIndexadaAPesosUruguayOutputs {
  const monto = Math.max(0, Number(inputs.monto) || 0);
  const direccion = inputs.direccion || 'ui-pesos';
  const valor = URUGUAY_2026.unidadIndexada.valor; // $U por 1 UI

  let resultado: string;
  let detalle: string;
  if (direccion === 'ui-pesos') {
    const pesos = monto * valor;
    resultado = `${fmtUI(monto)} = ${fmtUYU(pesos)}`;
    detalle = `${fmtUI(monto)} × ${fmtUYU(valor)} por UI = ${fmtUYU(pesos)}`;
  } else {
    const ui = valor > 0 ? monto / valor : 0;
    resultado = `${fmtUYU(monto)} = ${fmtUI(ui)}`;
    detalle = `${fmtUYU(monto)} ÷ ${fmtUYU(valor)} por UI = ${fmtUI(ui)}`;
  }

  return {
    resultado,
    valorUi: `1 UI = ${fmtUYU(valor)}`,
    detalle,
    fecha: `Valor UI al ${URUGUAY_2026.unidadIndexada.fecha} (${URUGUAY_2026.unidadIndexada.fuente})`,
  };
}
