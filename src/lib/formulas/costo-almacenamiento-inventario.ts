/** Costo de almacenamiento de inventario (holding cost / carrying cost) */

export interface Inputs {
  valorInventario: number;
  costoCapitalPct: number;
  almacenajePct: number;
  segurosPct: number;
  mermaPct: number;
}

export interface Outputs {
  costoAnual: number;
  costoMensual: number;
  holdingCostPct: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function costoAlmacenamientoInventario(i: Inputs): Outputs {
  const valor = Number(i.valorInventario);
  const capital = Number(i.costoCapitalPct);
  const almacenaje = Number(i.almacenajePct);
  const seguros = Number(i.segurosPct);
  const merma = Number(i.mermaPct);

  if (isNaN(valor) || valor <= 0) throw new Error('Ingresá el valor del inventario');
  if (isNaN(capital) || capital < 0) throw new Error('El costo de capital no puede ser negativo');
  if (isNaN(almacenaje) || almacenaje < 0) throw new Error('El costo de almacenaje no puede ser negativo');
  if (isNaN(seguros) || seguros < 0) throw new Error('Los seguros no pueden ser negativos');
  if (isNaN(merma) || merma < 0) throw new Error('La merma no puede ser negativa');

  const holdingCostPct = capital + almacenaje + seguros + merma;
  const costoAnual = valor * holdingCostPct / 100;
  const costoMensual = costoAnual / 12;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Inventario: $${fmt.format(valor)}. ` +
    `Capital (${capital}%): $${fmt.format(valor * capital / 100)}. ` +
    `Almacenaje (${almacenaje}%): $${fmt.format(valor * almacenaje / 100)}. ` +
    `Seguros (${seguros}%): $${fmt.format(valor * seguros / 100)}. ` +
    `Merma (${merma}%): $${fmt.format(valor * merma / 100)}. ` +
    `Holding cost total: ${holdingCostPct.toFixed(1)}% = $${fmt.format(costoAnual)}/año ($${fmt.format(costoMensual)}/mes).`;

  const cCapital = valor * capital / 100;
  const cAlmacenaje = valor * almacenaje / 100;
  const cSeguros = valor * seguros / 100;
  const cMerma = valor * merma / 100;

  // Benchmark logístico: el holding cost suele caer entre 20% y 30% anual del valor del stock.
  const hc = holdingCostPct;
  const tone = hc >= 30 ? 'warn' : hc <= 18 ? 'good' : 'neutral';
  const _insight = {
    title: 'Tu inventario inmovilizado cuesta plata',
    text:
      `Mantener este stock te cuesta **${hc.toFixed(1)}% anual** ($${fmt.format(Math.round(costoAnual))}/año, $${fmt.format(Math.round(costoMensual))}/mes). ` +
      (hc >= 30
        ? `Está por encima del rango habitual (20-30%): cada mes que la mercadería no rota, te come margen. Conviene revisar niveles de compra.`
        : hc <= 18
          ? `Está por debajo del rango habitual (20-30%): tu costo de mantener inventario es eficiente.`
          : `Está dentro del rango habitual del 20-30% anual que maneja la logística.`),
    tone,
    icon: '📦',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Costo de capital (${capital}%)`, value: Math.round(cCapital) },
      { label: `Almacenaje (${almacenaje}%)`, value: Math.round(cAlmacenaje) },
      { label: `Seguros (${seguros}%)`, value: Math.round(cSeguros) },
      { label: `Merma (${merma}%)`, value: Math.round(cMerma) },
    ],
    prefix: '$',
    centerValue: `$${fmt.format(Math.round(costoAnual))}`,
    centerLabel: 'Costo anual',
    ariaLabel: `Reparto del costo anual de almacenamiento de $${fmt.format(Math.round(costoAnual))} entre capital, almacenaje, seguros y merma`,
  };

  return {
    costoAnual: Math.round(costoAnual),
    costoMensual: Math.round(costoMensual),
    holdingCostPct: Number(holdingCostPct.toFixed(1)),
    detalle,
    _insight,
    _chart,
  };
}
