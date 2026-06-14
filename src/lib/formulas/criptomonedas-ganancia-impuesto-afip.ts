/** Ganancia e impuesto por venta de criptomonedas en Argentina
 *  Personas humanas: la venta de cripto puede tributar Impuesto a las Ganancias.
 *  El tratamiento y la alícuota dependen de la situación particular (régimen,
 *  fuente, otras rentas), por eso la alícuota se deja como input editable
 *  (default razonable 15%) en lugar de hardcodearla.
 *
 *  Ganancia = (precioVenta − precioCompra) × cantidad
 *  Impuesto = max(0, ganancia) × alícuota
 *  Ganancia neta = ganancia − impuesto
 */

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }

export function criptomonedasGananciaImpuestoAfip(i: Inputs): Outputs {
  const precioCompra = Number(i.precioCompra) || 0;
  const precioVenta = Number(i.precioVenta) || 0;
  const cantidad = Number(i.cantidad) || 0;
  // Alícuota editable: '' / null / undefined → default 15%
  const alicuotaRaw = i.alicuota;
  const alicuotaPct = (alicuotaRaw === '' || alicuotaRaw === null || alicuotaRaw === undefined || !Number.isFinite(Number(alicuotaRaw)))
    ? 15
    : Number(alicuotaRaw);

  const costoTotal = precioCompra * cantidad;
  const ingresoTotal = precioVenta * cantidad;
  const ganancia = ingresoTotal - costoTotal; // puede ser negativa (pérdida)
  const baseImponible = Math.max(0, ganancia);
  const impuesto = baseImponible * (alicuotaPct / 100);
  const gananciaNeta = ganancia - impuesto; // tras impuesto (si hay pérdida, no hay impuesto)

  const ars = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const variacionPct = costoTotal > 0 ? (ganancia / costoTotal) * 100 : 0;

  const hayGanancia = ganancia > 0;

  const _insight = hayGanancia
    ? {
        title: 'Lo que te queda después del impuesto',
        text: `Vendiste por **${ars(ingresoTotal)}** lo que te costó **${ars(costoTotal)}**: ganancia de **${ars(ganancia)}** (+${variacionPct.toFixed(1)}%). Con una alícuota del ${alicuotaPct}%, el impuesto estimado es **${ars(impuesto)}** y te quedan **${ars(gananciaNeta)}** netos.`,
        tone: 'warn',
        icon: '₿',
      }
    : {
        title: ganancia === 0 ? 'Ni ganancia ni pérdida' : 'Operación en pérdida',
        text: ganancia === 0
          ? `Vendiste por lo mismo que pagaste (${ars(ingresoTotal)}): no hay ganancia gravable, así que no hay impuesto estimado.`
          : `Vendiste por **${ars(ingresoTotal)}** lo que costó **${ars(costoTotal)}**: pérdida de **${ars(Math.abs(ganancia))}** (${variacionPct.toFixed(1)}%). Sin ganancia no hay impuesto; el quebranto podés guardarlo para compensar futuras ganancias del mismo tipo.`,
        tone: ganancia === 0 ? 'neutral' : 'good',
        icon: ganancia === 0 ? '➖' : '📉',
      };

  const _chart = hayGanancia
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Te queda (neto)', value: Math.round(gananciaNeta) },
          { label: `Impuesto ${alicuotaPct}%`, value: Math.round(impuesto) },
        ],
        prefix: '$',
        centerValue: ars(ganancia),
        centerLabel: 'Ganancia bruta',
        ariaLabel: `De ${ars(ganancia)} de ganancia, ${ars(impuesto)} es impuesto estimado y ${ars(gananciaNeta)} te queda neto.`,
      }
    : undefined;

  const resumen = hayGanancia
    ? `Ganancia ${ars(ganancia)} · impuesto estimado (${alicuotaPct}%) ${ars(impuesto)} · neto ${ars(gananciaNeta)}.`
    : ganancia === 0
      ? `Sin ganancia: ni impuesto ni resultado neto.`
      : `Pérdida de ${ars(Math.abs(ganancia))}: no hay impuesto a las ganancias.`;

  return {
    ganancia: ars(ganancia),
    impuesto: ars(impuesto),
    gananciaNeta: ars(gananciaNeta),
    resumen,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
