/** Alquilar vs comprar — ¿qué conviene? */
export interface Inputs {
  valorPropiedad: number;
  alquilerMensual: number;
  ajusteAlquilerAnual: number;
  plazoAnios: number;
  tasaCreditoAnual: number;
  piePorcentaje?: number;
}
export interface Outputs {
  costoTotalAlquiler: number;
  costoTotalCompra: number;
  cuotaMensualCredito: number;
  recomendacion: string;
}

export function alquilerVsComprar(i: Inputs): Outputs {
  const valor = Number(i.valorPropiedad);
  const alquiler = Number(i.alquilerMensual);
  const ajusteAnual = Number(i.ajusteAlquilerAnual);
  const plazo = Number(i.plazoAnios);
  const tasaAnual = Number(i.tasaCreditoAnual);
  const piePct = Number(i.piePorcentaje) || 25;

  if (!valor || valor <= 0) throw new Error('Ingresá el valor de la propiedad');
  if (!alquiler || alquiler <= 0) throw new Error('Ingresá el alquiler mensual');
  if (!plazo || plazo <= 0) throw new Error('Ingresá el plazo');

  // Costo total alquiler con ajuste anual
  let costoTotalAlquiler = 0;
  let alquilerActual = alquiler;
  for (let anio = 0; anio < plazo; anio++) {
    costoTotalAlquiler += alquilerActual * 12;
    alquilerActual *= (1 + ajusteAnual / 100);
  }

  // Costo total compra: pie + cuotas de crédito hipotecario
  // Asumimos dólar ~1200 para convertir valor propiedad a pesos
  const cotizDolar = 1200;
  const valorPesos = valor * cotizDolar;
  const pie = valorPesos * (piePct / 100);
  const montoCredito = valorPesos - pie;
  const plazoCredito = 20; // años estándar hipotecario
  const tasaMensual = tasaAnual / 100 / 12;

  let cuotaMensual = 0;
  if (tasaMensual > 0 && montoCredito > 0) {
    cuotaMensual = montoCredito * (tasaMensual * Math.pow(1 + tasaMensual, plazoCredito * 12)) /
      (Math.pow(1 + tasaMensual, plazoCredito * 12) - 1);
  } else if (montoCredito > 0) {
    cuotaMensual = montoCredito / (plazoCredito * 12);
  }

  const mesesComparacion = Math.min(plazo, plazoCredito) * 12;
  const costoTotalCompra = pie + cuotaMensual * mesesComparacion;

  const conviene = costoTotalAlquiler > costoTotalCompra ? 'comprar' : 'alquilar';

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    costoTotalAlquiler: Math.round(costoTotalAlquiler),
    costoTotalCompra: Math.round(costoTotalCompra),
    cuotaMensualCredito: Math.round(cuotaMensual),
    recomendacion: conviene === 'comprar'
      ? `Comprar conviene. En ${plazo} años, alquilar cuesta $${fmt.format(costoTotalAlquiler)} vs comprar $${fmt.format(costoTotalCompra)}. Además, al comprar tenés la propiedad.`
      : `Alquilar conviene financieramente. En ${plazo} años, alquilar cuesta $${fmt.format(costoTotalAlquiler)} vs comprar $${fmt.format(costoTotalCompra)}. Pero comprando construís patrimonio.`,
  };
}
