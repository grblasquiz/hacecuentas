/** Margen de ganancia: sobre costo vs sobre venta */
export interface Inputs { costo: number; precioVenta: number; __lang?: string; }
export interface Outputs {
  gananciaBruta: number;
  margenSobreCosto: number;
  margenSobreVenta: number;
  markup: number;
}

export function margenGanancia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errCosto: 'Ingresá el costo',
      errVenta: 'Ingresá el precio de venta',
    },
    en: {
      errCosto: 'Enter the cost',
      errVenta: 'Enter the selling price',
    },
  } as const)[__lang];
  const costo = Number(i.costo);
  const venta = Number(i.precioVenta);
  if (!costo || costo <= 0) throw new Error(T.errCosto);
  if (!venta || venta <= 0) throw new Error(T.errVenta);
  const ganancia = venta - costo;
  const sobreCosto = (ganancia / costo) * 100;
  const sobreVenta = (ganancia / venta) * 100;
  return {
    gananciaBruta: Math.round(ganancia),
    margenSobreCosto: Number(sobreCosto.toFixed(2)),
    margenSobreVenta: Number(sobreVenta.toFixed(2)),
    markup: Number(sobreCosto.toFixed(2)),
  };
}
