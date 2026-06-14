/** Ganancia e impuesto por venta de criptomonedas en Argentina (personas humanas).
 *  Régimen (ARCA / Ley de Ganancias): la venta de criptoactivos por personas humanas es
 *  una RENTA DE SEGUNDA CATEGORÍA que tributa por el IMPUESTO CEDULAR:
 *    - 5%  si la enajenación es en PESOS y sin cláusula de ajuste (art. 95 inc. a)
 *    - 15% si es en MONEDA EXTRANJERA / con cláusula de ajuste o de fuente extranjera (inc. b)
 *  Se deducen el costo de adquisición y los gastos relacionados, y la DEDUCCIÓN ESPECIAL
 *  del art. 100 (equivalente a la Ganancia No Imponible anual, art. 30 inc a) — que se
 *  proporciona entre todas las rentas cedulares del período (acá se asume que es la única).
 *  Fuente: https://www.afip.gob.ar/economia-digital/criptoactivos/impuesto-a-las-ganancias.asp
 */
import { GNI_ANUAL } from './_ganancias-escala';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }

export function criptomonedasGananciaImpuestoAfip(i: Inputs): Outputs {
  const precioCompra = Number(i.precioCompra) || 0;
  const precioVenta = Number(i.precioVenta) || 0;
  const cantidad = Number(i.cantidad) || 0;
  const gastos = Number(i.gastos) || 0; // comisiones y gastos deducibles (opcional)
  // Tipo de operación → alícuota cedular. Default: moneda extranjera (15%), lo más común en cripto.
  const enPesos = String(i.tipoOperacion) === 'pesos';
  const alicuotaPct = enPesos ? 5 : 15;

  const costoTotal = precioCompra * cantidad;
  const ingresoTotal = precioVenta * cantidad;
  const ganancia = ingresoTotal - costoTotal - gastos; // resultado neto de costo y gastos (puede ser pérdida)
  const gananciaPositiva = Math.max(0, ganancia);

  // Deducción especial art. 100 (no puede superar la ganancia del período)
  const deduccionEspecial = Math.min(GNI_ANUAL, gananciaPositiva);
  const baseImponible = Math.max(0, gananciaPositiva - GNI_ANUAL);
  const impuesto = baseImponible * (alicuotaPct / 100);
  const gananciaNeta = ganancia - impuesto;

  const ars = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const variacionPct = costoTotal > 0 ? (ganancia / costoTotal) * 100 : 0;
  const tasaTxt = `${alicuotaPct}% ${enPesos ? '(en pesos)' : '(moneda extranjera)'}`;

  const hayImpuesto = impuesto > 0;
  const hayGanancia = ganancia > 0;

  let _insight: any;
  if (hayImpuesto) {
    _insight = {
      title: 'Lo que te queda después del impuesto',
      text: `Ganaste **${ars(ganancia)}** (+${variacionPct.toFixed(1)}%). Tras la deducción especial del art. 100 (**${ars(deduccionEspecial)}**), la base gravable es **${ars(baseImponible)}** y el impuesto cedular del **${tasaTxt}** da **${ars(impuesto)}**. Te quedan **${ars(gananciaNeta)}** netos.`,
      tone: 'warn',
      icon: '₿',
    };
  } else if (hayGanancia) {
    _insight = {
      title: 'Ganancia exenta por la deducción especial',
      text: `Tu ganancia de **${ars(ganancia)}** queda **por debajo de la deducción especial anual del art. 100 (${ars(GNI_ANUAL)})**, así que el impuesto cedular estimado es **$0** — siempre que sea tu única renta cedular del año. Te quedan los **${ars(gananciaNeta)}** completos.`,
      tone: 'good',
      icon: '✅',
    };
  } else {
    _insight = {
      title: ganancia === 0 ? 'Ni ganancia ni pérdida' : 'Operación en pérdida',
      text: ganancia === 0
        ? `Vendiste por lo mismo que costó (${ars(ingresoTotal)}): no hay ganancia gravable ni impuesto.`
        : `Pérdida de **${ars(Math.abs(ganancia))}** (${variacionPct.toFixed(1)}%). Sin ganancia no hay impuesto; el quebranto se puede guardar para compensar futuras ganancias del mismo tipo (cedular).`,
      tone: ganancia === 0 ? 'neutral' : 'good',
      icon: ganancia === 0 ? '➖' : '📉',
    };
  }

  const _chart = hayImpuesto
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Te queda (neto)', value: Math.round(gananciaNeta) },
          { label: `Impuesto ${alicuotaPct}%`, value: Math.round(impuesto) },
        ],
        prefix: '$',
        centerValue: ars(ganancia),
        centerLabel: 'Ganancia bruta',
        ariaLabel: `De ${ars(ganancia)} de ganancia, ${ars(impuesto)} es impuesto cedular y ${ars(gananciaNeta)} te queda neto.`,
      }
    : undefined;

  const resumen = hayImpuesto
    ? `Ganancia ${ars(ganancia)} · base ${ars(baseImponible)} · impuesto cedular ${tasaTxt} ${ars(impuesto)} · neto ${ars(gananciaNeta)}.`
    : hayGanancia
      ? `Ganancia ${ars(ganancia)}: sin impuesto (no supera la deducción especial del art. 100 de ${ars(GNI_ANUAL)}).`
      : ganancia === 0
        ? `Sin ganancia: ni impuesto ni resultado neto.`
        : `Pérdida de ${ars(Math.abs(ganancia))}: no hay impuesto a las ganancias.`;

  return {
    ganancia: ars(ganancia),
    deduccionEspecial: ars(deduccionEspecial),
    baseImponible: ars(baseImponible),
    impuesto: ars(impuesto),
    gananciaNeta: ars(gananciaNeta),
    resumen,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
