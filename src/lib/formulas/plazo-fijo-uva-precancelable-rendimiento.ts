/** Plazo fijo UVA precancelable: comparativa rendimiento vs tradicional */
export interface Inputs { capital: number; inflacionMensualEstPct: number; spreadUvaAnualPct: number; tasaTradicionalTnaPct: number; plazoDias: number; precancelaAlDia: number; }
export interface Outputs { montoFinalUvaPrecancela: number; montoFinalUvaCompleto: number; montoFinalTradicional: number; rendimientoUvaPct: number; rendimientoTradicionalPct: number; mejorOpcion: string; explicacion: string; _insight?: any; }
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
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const diferencia = Math.abs(uvaFull - tradicional);
  const uvaGana = uvaFull > tradicional;
  const precancelaActiva = precancela > 0 && precancela < plazo;
  const sacrificas = precancelaActiva ? uvaFull - uvaPrecan : 0;
  let _insight;
  if (precancelaActiva && uvaGana) {
    _insight = {
      title: 'Precancelar te come el rendimiento UVA',
      text: `Si llegás al final, el **UVA** rinde **${rendUva.toFixed(2)}%** (**${fmt(uvaFull)}**) y le gana al tradicional por **${fmt(diferencia)}**. Pero precancelando al día **${precancela}** te quedás con **${fmt(uvaPrecan)}**: resignás cerca de **${fmt(sacrificas)}**. El UVA premia aguantar todo el plazo.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    _insight = {
      title: uvaGana ? 'El UVA le gana al tradicional' : 'El tradicional rinde más acá',
      text: uvaGana
        ? `Con tu inflación estimada, el **plazo fijo UVA** rinde **${rendUva.toFixed(2)}%** (**${fmt(uvaFull)}**) contra **${rendTrad.toFixed(2)}%** del tradicional: una diferencia de **${fmt(diferencia)}** a favor del UVA, siempre que lo dejes hasta el vencimiento.`
        : `Con tu inflación estimada, el **plazo fijo tradicional** rinde **${rendTrad.toFixed(2)}%** (**${fmt(tradicional)}**) y supera al UVA (**${rendUva.toFixed(2)}%**) por **${fmt(diferencia)}**. Si la inflación se acelera, esa ventaja se puede dar vuelta.`,
      tone: uvaGana ? 'good' : 'neutral',
      icon: uvaGana ? '📈' : '🏦',
    };
  }
  return {
    montoFinalUvaPrecancela: Number(uvaPrecan.toFixed(2)),
    montoFinalUvaCompleto: Number(uvaFull.toFixed(2)),
    montoFinalTradicional: Number(tradicional.toFixed(2)),
    rendimientoUvaPct: Number(rendUva.toFixed(2)),
    rendimientoTradicionalPct: Number(rendTrad.toFixed(2)),
    mejorOpcion: mejor,
    explicacion: `UVA completo: $${uvaFull.toFixed(2)} (${rendUva.toFixed(2)}%). Tradicional: $${tradicional.toFixed(2)} (${rendTrad.toFixed(2)}%). Mejor: ${mejor}.`,
    _insight,
  };
}
