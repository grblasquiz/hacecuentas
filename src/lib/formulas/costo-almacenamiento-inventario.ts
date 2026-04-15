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

  return {
    costoAnual: Math.round(costoAnual),
    costoMensual: Math.round(costoMensual),
    holdingCostPct: Number(holdingCostPct.toFixed(1)),
    detalle,
  };
}
