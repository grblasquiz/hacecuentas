/**
 * Conversor BPC ⇄ pesos uruguayos — Base de Prestaciones y Contribuciones.
 *
 * La BPC es la unidad de cuenta que fija el Poder Ejecutivo por decreto CADA
 * enero. A diferencia de la UI (que se ajusta a diario por el IPC) y de la UR
 * (mensual, por salarios), la BPC es un VALOR FIJO durante todo el año. Se usa
 * para expresar las franjas del IRPF y el IASS, mínimos no imponibles, multas,
 * topes de prestaciones (asignaciones, subsidios) y becas.
 *
 * BPC 2026 = $6.864 (Decreto N° 11/026), +4,38% vs $6.576 de 2025.
 * Fuente: DGI/BPS.
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

const BPC_2026 = URUGUAY_2026.bpc; // 6864
const BPC_2025 = 6576;

export interface Inputs {
  /** Cantidad a convertir. */
  monto: number;
  /** Dirección de la conversión. */
  direccion: 'bpc-pesos' | 'pesos-bpc';
}

export interface Outputs {
  resultado: string;
  valorBpc: string;
  detalle: string;
  anio: string;
  _insight?: any;
  _table?: any;
}

/** Formatea una cantidad de BPC: "3,5 BPC". */
function fmtBPC(n: number): string {
  const r = Math.round(n * 100) / 100;
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(r) + (r === 1 ? ' BPC' : ' BPC');
}

export function compute(i: Inputs): Outputs {
  const monto = Math.max(0, Number(i.monto) || 0);
  const direccion = i.direccion === 'pesos-bpc' ? 'pesos-bpc' : 'bpc-pesos';
  const valor = BPC_2026;

  let resultado: string;
  let detalle: string;
  if (direccion === 'bpc-pesos') {
    const pesos = monto * valor;
    resultado = `${fmtBPC(monto)} = ${fmtUYU(pesos)}`;
    detalle = `${fmtBPC(monto)} × ${fmtUYU(valor)} por BPC = ${fmtUYU(pesos)} (valor 2026).`;
  } else {
    const bpc = valor > 0 ? monto / valor : 0;
    resultado = `${fmtUYU(monto)} = ${fmtBPC(bpc)}`;
    detalle = `${fmtUYU(monto)} ÷ ${fmtUYU(valor)} por BPC = ${fmtBPC(bpc)} (valor 2026).`;
  }

  const variacion = ((BPC_2026 / BPC_2025 - 1) * 100).toFixed(2);

  return {
    resultado,
    valorBpc: `1 BPC = ${fmtUYU(valor)} (2026)`,
    detalle,
    anio: 'Valor BPC 2026 (Decreto N° 11/026), vigente todo el año.',
    _insight: {
      type: 'highlight',
      icon: '📊',
      tone: 'info' as const,
      text:
        direccion === 'bpc-pesos'
          ? `**${fmtBPC(monto)}** equivalen a **${fmtUYU(monto * valor)}** en 2026 (1 BPC = ${fmtUYU(valor)}). La BPC subió **${variacion}%** respecto de 2025 ($6.576), y queda fija todo el año a diferencia de la UI, que se ajusta a diario.`
          : `**${fmtUYU(monto)}** equivalen a **${fmtBPC(valor > 0 ? monto / valor : 0)}** al valor 2026 (1 BPC = ${fmtUYU(valor)}). La BPC define franjas de IRPF, mínimos no imponibles, multas y topes de prestaciones.`,
    },
    _table: {
      title: 'BPC a pesos — valor 2026 ($6.864)',
      headers: ['Cantidad', 'En pesos (2026)'],
      rows: [
        ['1 BPC', fmtUYU(1 * valor)],
        ['2 BPC', fmtUYU(2 * valor)],
        ['3 BPC', fmtUYU(3 * valor)],
        ['3,5 BPC', fmtUYU(3.5 * valor)],
        ['7 BPC (mínimo no imponible IRPF)', fmtUYU(7 * valor)],
        ['10 BPC', fmtUYU(10 * valor)],
        ['12 BPC', fmtUYU(12 * valor)],
      ],
      note: `BPC 2026 = $6.864 (fija todo el año). BPC 2025 fue $6.576 (variación ${variacion}%). Para convertir pesos a BPC, dividí por 6.864.`,
    },
  };
}
