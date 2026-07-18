/**
 * Multa por no sufragar / incumplir funciones electorales — Ecuador (CNE).
 *
 * Todas las multas se calculan como un porcentaje del Salario Básico Unificado (SBU) del año de la
 * elección (SBU 2026 = $482). El elector que no vota paga 10% del SBU; el miembro de JRV designado
 * que no concurre a integrar la mesa paga 15%. Las multas son acumulativas por cada elección no
 * sufragada. Tienen voto FACULTATIVO (no genera multa): 16–17 años, 65+ años, personas con
 * discapacidad, analfabetos y residentes en el exterior; además hay justificativos válidos.
 *
 * Porcentajes y SBU importados de la data país (NO hardcodear).
 */
import { MULTA_SUFRAGIO_EC_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  situacion?: string;   // 'no_sufragar' | 'jrv_capacitacion' | 'jrv_no_integrar'
  elecciones?: number;  // cantidad de elecciones sin sufragar (multas acumulativas)
  votoFacultativo?: string; // 'si' = está exento (facultativo/justificado) | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const M = MULTA_SUFRAGIO_EC_2026;
  const key = (i.situacion && M.variantes[i.situacion as keyof typeof M.variantes]) ? i.situacion as keyof typeof M.variantes : 'no_sufragar';
  const variante = M.variantes[key];

  const exento = (i.votoFacultativo ?? 'no') === 'si';

  const nRaw = Math.floor(Number(i.elecciones) || 1);
  const elecciones = Math.max(1, Math.min(nRaw, 20));

  const multaUnitaria = exento ? 0 : M.sbu * variante.pctSBU;
  const total = multaUnitaria * elecciones;

  const _insight = exento
    ? {
        title: 'No te corresponde multa',
        text: `Marcaste que tenés **voto facultativo o un justificativo válido** (16–17 años, 65+ años, discapacidad, analfabetismo, residencia en el exterior, o enfermedad/calamidad/ausencia justificadas). En ese caso **no se genera multa** por no sufragar, aunque igual conviene tramitar el certificado de presentación o la justificación en el CNE.`,
        tone: 'good',
        icon: '🗳️',
      }
    : {
        title: `Multa: ${fmtUSDec(total)}`,
        text: `"${variante.label}" equivale al **${(variante.pctSBU * 100).toFixed(0)}% del SBU** (SBU 2026 = ${fmtUSDec(M.sbu)}) → **${fmtUSDec(multaUnitaria)}** por elección.${elecciones > 1 ? ` Como las multas son acumulativas, por **${elecciones} elecciones** sin sufragar te tocan **${fmtUSDec(total)}**.` : ''} Sin el certificado de votación (o el pago de la multa) no podés hacer varios trámites en instituciones públicas.`,
        tone: 'warn',
        icon: '🗳️',
      };

  const _chart = exento ? undefined : {
    type: 'scale',
    marker: Math.round(total * 100) / 100,
    markerLabel: `Multa ${fmtUSDec(total)}`,
    min: 0,
    segments: [
      { nombre: 'No sufragar (10%)', max: Math.round(M.sbu * 0.10 * 100) / 100, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'No integrar JRV (15%)', max: Math.round(M.sbu * 0.15 * 100) / 100, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `Multa de ${fmtUSDec(total)} sobre un SBU de ${fmtUSDec(M.sbu)}.`,
  };

  // Tabla de referencia con las tres multas ordinarias (todas sobre el mismo SBU).
  const _table = {
    title: `Multas electorales 2026 (SBU ${fmtUSDec(M.sbu)})`,
    headers: ['Situación', '% del SBU', 'Multa'],
    align: ['left', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: Object.values(M.variantes).map((v) => [
      v.label,
      `${(v.pctSBU * 100).toFixed(0)}%`,
      fmtUSDec(M.sbu * v.pctSBU),
    ]),
    note: 'Base legal: Código de la Democracia, arts. 292–293. El abandono injustificado de funciones de JRV se sanciona aparte con 11 a 20 SBU ($5.302 a $9.640), monto fijado por el organismo electoral.',
  };

  return {
    multa: fmtUSDec(total),
    multaPorEleccion: fmtUSDec(multaUnitaria),
    detalle: exento
      ? 'Voto facultativo o justificado: no se genera multa.'
      : `${(variante.pctSBU * 100).toFixed(0)}% de ${fmtUSDec(M.sbu)} = ${fmtUSDec(multaUnitaria)} × ${elecciones} ${elecciones === 1 ? 'elección' : 'elecciones'} = ${fmtUSDec(total)}.`,
    _insight,
    _chart,
    _table,
  };
}
