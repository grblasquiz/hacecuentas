import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  modo: string; // "pesos-a-smmlv" | "smmlv-a-pesos"
  valor: number;
}

export interface Outputs {
  resultado: number;
  equivalencia: string;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const SMMLV = COLOMBIA_2026.smlmv; // $1.750.905 (Decreto 1469/2025)
  const valor = Math.max(0, i.valor || 0);
  const modo = String(i.modo || 'pesos-a-smmlv');

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const fmtNum = (n: number) =>
    (Math.round(n * 100) / 100).toLocaleString('es-CO', { maximumFractionDigits: 2 });

  let resultado: number;
  let equivalencia: string;

  if (modo === 'smmlv-a-pesos') {
    resultado = valor * SMMLV;
    equivalencia = `${fmtNum(valor)} SMMLV equivalen a ${fmtCOP(resultado)} mensuales (SMMLV 2026 = ${fmtCOP(SMMLV)}).`;
  } else {
    resultado = SMMLV > 0 ? valor / SMMLV : 0;
    equivalencia = `${fmtCOP(valor)} equivalen a ${fmtNum(resultado)} SMMLV (SMMLV 2026 = ${fmtCOP(SMMLV)}).`;
  }

  const _insight = {
    title: 'Equivalencia en salarios mínimos',
    text:
      modo === 'smmlv-a-pesos'
        ? `**${fmtNum(valor)} SMMLV** son **${fmtCOP(resultado)}** al mes en 2026. El salario mínimo de este año es ${fmtCOP(SMMLV)} (Decreto 1469 de 2025).`
        : `**${fmtCOP(valor)}** representan **${fmtNum(resultado)} salarios mínimos** en 2026, tomando el SMMLV de ${fmtCOP(SMMLV)}.`,
    tone: 'info' as const,
    icon: '⚖️',
  };

  // Tabla de referencia: múltiplos comunes de SMMLV y su equivalente en pesos 2026.
  const multiplos = [1, 2, 4, 10, 13, 25];
  const rows = multiplos.map((m) => {
    let nota = '';
    if (m === 2) nota = 'Tope auxilio de transporte';
    else if (m === 4) nota = 'Desde acá aplica FSP';
    else if (m === 13) nota = 'Mínimo salario integral';
    else if (m === 25) nota = 'Tope IBC seguridad social';
    return [`${m} SMMLV`, fmtCOP(m * SMMLV), nota];
  });
  const _table = {
    title: `Equivalencia SMMLV → pesos 2026 (SMMLV = ${fmtCOP(SMMLV)})`,
    headers: ['Salarios mínimos', 'Equivale a (mensual)', 'Referencia'],
    align: ['left', 'right', 'left'] as ('left' | 'right' | 'center')[],
    rows,
    note: 'SMMLV 2026 = $1.750.905 (Decreto 1469 de 2025). Varios umbrales fiscales y laborales se expresan en múltiplos de SMMLV.',
  };

  return {
    resultado: modo === 'smmlv-a-pesos' ? Math.round(resultado) : Math.round(resultado * 100) / 100,
    equivalencia,
    _insight,
    _table,
  };
}
