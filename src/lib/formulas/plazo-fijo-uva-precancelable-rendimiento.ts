/** Plazo fijo UVA precancelable: comparativa rendimiento vs tradicional */
export interface Inputs { capital: number; inflacionMensualEstPct: number; spreadUvaAnualPct: number; tasaTradicionalTnaPct: number; plazoDias: number; precancelaAlDia: number; }
export interface Outputs { montoFinalUvaPrecancela: number; montoFinalUvaCompleto: number; montoFinalTradicional: number; rendimientoUvaPct: number; rendimientoTradicionalPct: number; mejorOpcion: string; explicacion: string; }
export function plazoFijoUvaPrecancelableRendimiento(i: Inputs): Outputs {
  const cap = Number(i.capital);
  const infMens = Number(i.inflacionMensualEstPct) / 100;
  const spreadUva = Number(i.spreadUvaAnualPct) / 100;
  const tnaTrad = Number(i.tasaTradicionalTnaPct) / 100;
  const plazo = Number(i.plazoDias);
  const precancela = Number(i.precancelaAlDia);
  if (!cap || cap <= 0) throw new Error('Ingresá el capital');
  if (!plazo || plazo < 30) throw new Error('Plazo mínimo 30 días');
  // Inflación diaria equivalente
  const infDiaria = Math.pow(1 + infMens, 1 / 30) - 1;
  const spreadDiaria = spreadUva / 365;
  // UVA full plazo: capital * (1+infDiaria)^plazo * (1+spreadDiaria)^plazo
  const uvaFull = cap * Math.pow(1 + infDiaria, plazo) * Math.pow(1 + spreadDiaria, plazo);
  // UVA precancelado al día N (sin spread, solo TNA penalizada similar a tradicional)
  const diasPenal = precancela > 0 && precancela < plazo ? precancela : plazo;
  const tasaPenalDiaria = tnaTrad / 365 * 0.7; // penalty 30% sobre TNA tradicional
  const uvaPrecan = precancela > 0 && precancela < plazo
    ? cap * (1 + tasaPenalDiaria * diasPenal)
    : uvaFull;
  // Tradicional
  const tradicional = cap * (1 + tnaTrad * plazo / 365);
  const rendUva = ((uvaFull - cap) / cap) * 100;
  const rendTrad = ((tradicional - cap) / cap) * 100;
  const mejor = uvaFull > tradicional ? 'UVA completo' : 'Tradicional';
  return {
    montoFinalUvaPrecancela: Number(uvaPrecan.toFixed(2)),
    montoFinalUvaCompleto: Number(uvaFull.toFixed(2)),
    montoFinalTradicional: Number(tradicional.toFixed(2)),
    rendimientoUvaPct: Number(rendUva.toFixed(2)),
    rendimientoTradicionalPct: Number(rendTrad.toFixed(2)),
    mejorOpcion: mejor,
    explicacion: `UVA completo: $${uvaFull.toFixed(2)} (${rendUva.toFixed(2)}%). Tradicional: $${tradicional.toFixed(2)} (${rendTrad.toFixed(2)}%). Mejor: ${mejor}.`,
  };
}
