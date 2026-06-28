/** Tax cripto Argentina 2026 */
export interface Inputs { gananciaArs: number; tipoDeclarante: string; incluyeMonotributo: boolean; }
export interface Outputs { impuestoArs: number; aliquotaEfectiva: number; tipoImpuesto: string; netoArs: number; explicacion: string; _insight?: any; _chart?: any; }
export function criptoTaxArgentinaGanancia(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).incluyeMonotributo = (i as any).incluyeMonotributo === true || (i as any).incluyeMonotributo === 'true';
  const ganancia = Number(i.gananciaArs);
  const tipo = String(i.tipoDeclarante || 'fisica');
  const monot = Boolean(i.incluyeMonotributo);
  if (ganancia < 0) throw new Error('Ganancia inválida');
  let impuesto = 0;
  let alicuota = 0;
  let tipoImp = '';
  if (monot) {
    tipoImp = 'Monotributo (actividad cripto encuadrada)';
    impuesto = 0;
    alicuota = 0;
  } else if (tipo === 'juridica') {
    alicuota = 0.35;
    impuesto = ganancia * alicuota;
    tipoImp = 'Impuesto a las Ganancias 35% (persona jurídica)';
  } else {
    alicuota = 0.15;
    impuesto = ganancia * alicuota;
    tipoImp = 'Ganancias de capital 15% (persona física, art. 90 LIG)';
  }
  const neto = ganancia - impuesto;
  const fmtARS = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

  let insightTexto: string;
  let insightTono: 'good' | 'warn' | 'neutral';
  if (monot) {
    insightTono = 'good';
    insightTexto = `Bajo **Monotributo** la actividad cripto queda encuadrada en la cuota fija: no pagás Ganancias por separado, así que conservás los **${fmtARS(ganancia)}** completos de la ganancia.`;
  } else {
    insightTono = 'warn';
    insightTexto = `Tu ganancia de **${fmtARS(ganancia)}** tributa al **${(alicuota * 100).toFixed(0)}%** (${tipo === 'juridica' ? 'persona jurídica' : 'persona física'}): **${fmtARS(impuesto)}** de impuesto y un neto de **${fmtARS(neto)}**.`;
  }

  // Donut sólo si hay impuesto real que separar de la ganancia
  const _chart =
    ganancia > 0 && impuesto > 0
      ? {
          type: 'doughnut',
          slices: [
            { label: 'Neto para vos', value: Number(neto.toFixed(2)) },
            { label: 'Impuesto a las Ganancias', value: Number(impuesto.toFixed(2)) },
          ],
          prefix: '$',
          centerValue: fmtARS(ganancia),
          centerLabel: 'Ganancia',
          ariaLabel: `Ganancia ${fmtARS(ganancia)}: neto ${fmtARS(neto)} e impuesto ${fmtARS(impuesto)}`,
        }
      : undefined;

  return {
    impuestoArs: Number(impuesto.toFixed(2)),
    aliquotaEfectiva: Number((alicuota * 100).toFixed(2)),
    tipoImpuesto: tipoImp,
    netoArs: Number(neto.toFixed(2)),
    explicacion: `${tipoImp}. Ganancia ARS ${ganancia.toLocaleString()} × ${(alicuota*100).toFixed(1)}% = ${impuesto.toLocaleString()} de impuesto. Neto: ${neto.toLocaleString()} ARS.`,
    _insight: {
      title: 'Impuesto cripto en Argentina',
      text: insightTexto,
      tone: insightTono,
      icon: '🇦🇷',
    },
    _chart,
  };
}
