/** Proyección 12 meses: plazo fijo UVA vs pesos vs dólar MEP */
export interface Inputs { capital: number; inflacionAnualEstPct: number; tnaPesosTradicionalPct: number; tnaUvaSpreadPct: number; devaluacionAnualEstPct: number; tcMepInicial: number; }
export interface Outputs { resultadoUva: number; resultadoPesos: number; resultadoDolar: number; resultadoUvaEnUsd: number; resultadoPesosEnUsd: number; mejorOpcion: string; explicacion: string; _insight?: any; }
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
  const fmt = (x: number) => '$' + Math.round(x).toLocaleString('es-AR');
  const ganador = opciones[0];
  const segundo = opciones[1];
  const ventajaPct = segundo.val > 0 ? ((ganador.val - segundo.val) / segundo.val) * 100 : 0;
  // En términos reales, ¿la mejor opción le gana a la inflación?
  const ganadorReal = ganador.val / (1 + inf);
  const venceInflacion = ganadorReal >= cap;
  const _insight = {
    title: 'Mejor opción a 12 meses',
    text: `Con tus supuestos, **${ganador.nombre}** rinde más: **${fmt(ganador.val)}** ARS, un **${ventajaPct.toFixed(1)}%** por encima de ${segundo.nombre} (${fmt(segundo.val)}). ` + (venceInflacion ? `En términos reales **le gana a la inflación** del ${(inf * 100).toFixed(0)}%: tu poder de compra crece.` : `Ojo: en términos reales **no le gana a la inflación** del ${(inf * 100).toFixed(0)}% — perdés poder de compra incluso con la mejor opción.`),
    tone: venceInflacion ? ('good' as const) : ('warn' as const),
    icon: venceInflacion ? '📈' : '🔥',
  };
  return {
    resultadoUva: Number(uva.toFixed(2)),
    resultadoPesos: Number(pesos.toFixed(2)),
    resultadoDolar: Number(dolarFinalArs.toFixed(2)),
    resultadoUvaEnUsd: Number(uvaUsd.toFixed(2)),
    resultadoPesosEnUsd: Number(pesosUsd.toFixed(2)),
    mejorOpcion: opciones[0].nombre,
    explicacion: `En 12 meses con los supuestos cargados, la mejor opción estimada es **${opciones[0].nombre}** con $${opciones[0].val.toFixed(0)} ARS. UVA: $${uva.toFixed(0)} | Pesos: $${pesos.toFixed(0)} | Dólar: $${dolarFinalArs.toFixed(0)}.`,
    _insight,
  };
}
