/** Proyección 12 meses: plazo fijo UVA vs pesos vs dólar MEP */
export interface Inputs { capital: number; inflacionAnualEstPct: number; tnaPesosTradicionalPct: number; tnaUvaSpreadPct: number; devaluacionAnualEstPct: number; tcMepInicial: number; }
export interface Outputs { resultadoUva: number; resultadoPesos: number; resultadoDolar: number; resultadoUvaEnUsd: number; resultadoPesosEnUsd: number; mejorOpcion: string; explicacion: string; }
export function ahorroUvaVsPesosVsDolar12Meses(i: Inputs): Outputs {
  const cap = Number(i.capital);
  const inf = Number(i.inflacionAnualEstPct) / 100;
  const tnaPesos = Number(i.tnaPesosTradicionalPct) / 100;
  const spread = Number(i.tnaUvaSpreadPct) / 100;
  const dev = Number(i.devaluacionAnualEstPct) / 100;
  const tc = Number(i.tcMepInicial);
  if (!cap || cap <= 0) throw new Error('Ingresá el capital');
  if (!tc || tc <= 0) throw new Error('Ingresá el tipo de cambio MEP');
  // UVA: ajusta por inflación + spread anual
  const uva = cap * (1 + inf) * (1 + spread);
  // Pesos tradicional
  const pesos = cap * (1 + tnaPesos);
  // Dólar MEP: convierto a USD hoy y mantengo (rinde 0% en USD)
  const usdHoy = cap / tc;
  const tcFinal = tc * (1 + dev);
  const dolarFinalArs = usdHoy * tcFinal;
  const uvaUsd = uva / tcFinal;
  const pesosUsd = pesos / tcFinal;
  const opciones = [
    { nombre: 'UVA', val: uva },
    { nombre: 'Pesos tradicional', val: pesos },
    { nombre: 'Dólar MEP', val: dolarFinalArs },
  ].sort((a, b) => b.val - a.val);
  return {
    resultadoUva: Number(uva.toFixed(2)),
    resultadoPesos: Number(pesos.toFixed(2)),
    resultadoDolar: Number(dolarFinalArs.toFixed(2)),
    resultadoUvaEnUsd: Number(uvaUsd.toFixed(2)),
    resultadoPesosEnUsd: Number(pesosUsd.toFixed(2)),
    mejorOpcion: opciones[0].nombre,
    explicacion: `En 12 meses con los supuestos cargados, la mejor opción estimada es **${opciones[0].nombre}** con $${opciones[0].val.toFixed(0)} ARS. UVA: $${uva.toFixed(0)} | Pesos: $${pesos.toFixed(0)} | Dólar: $${dolarFinalArs.toFixed(0)}.`,
  };
}
