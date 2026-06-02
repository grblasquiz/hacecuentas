/** Calculadora de costo de materiales de estudio por cuatrimestre */

export interface Inputs {
  gastoFotocopias: number;
  gastoLibros: number;
  gastoSuscripciones: number;
  gastoOtros: number;
}

export interface Outputs {
  costoTotal: number;
  costoMensual: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function costoMaterialEstudioCuatrimestre(i: Inputs): Outputs {
  const fotocopias = Number(i.gastoFotocopias) || 0;
  const libros = Number(i.gastoLibros) || 0;
  const suscripciones = Number(i.gastoSuscripciones) || 0;
  const otros = Number(i.gastoOtros) || 0;

  if (fotocopias < 0 || libros < 0 || suscripciones < 0 || otros < 0) {
    throw new Error('Los montos no pueden ser negativos');
  }

  const total = fotocopias + libros + suscripciones + otros;

  if (total === 0) {
    throw new Error('Ingresá al menos un gasto para calcular');
  }

  const mensual = total / 5; // 5 meses por cuatrimestre

  // Rubro que más pesa
  const rubros = [
    { label: 'Fotocopias', value: fotocopias },
    { label: 'Libros', value: libros },
    { label: 'Suscripciones', value: suscripciones },
    { label: 'Otros', value: otros },
  ];
  const mayor = rubros.reduce((a, b) => (b.value > a.value ? b : a), rubros[0]);
  const pctMayor = Math.round((mayor.value / total) * 100);
  const fmtAR = (n: number) => n.toLocaleString('es-AR');

  return {
    costoTotal: Math.round(total),
    costoMensual: Math.round(mensual),
    detalle: `Total cuatrimestre: $${total.toLocaleString('es-AR')} (Fotocopias: $${fotocopias.toLocaleString('es-AR')} + Libros: $${libros.toLocaleString('es-AR')} + Suscripciones: $${suscripciones.toLocaleString('es-AR')} + Otros: $${otros.toLocaleString('es-AR')}). Promedio mensual: $${mensual.toLocaleString('es-AR')}`,
    _insight: {
      title: 'Tu gasto de estudio por mes',
      text: `Vas a gastar **$${fmtAR(Math.round(total))}** en el cuatrimestre, unos **$${fmtAR(Math.round(mensual))}/mes** repartidos en 5 meses. El rubro que más pesa es **${mayor.label}** con **$${fmtAR(mayor.value)}** (**${pctMayor}%** del total)${mayor.label === 'Libros' ? ': fijate si conseguís usados o PDFs para recortarlo.' : mayor.label === 'Fotocopias' ? ': considerá comprar apuntes digitales para bajarlo.' : '.'}`,
      tone: 'neutral',
      icon: '📚',
    },
    _chart: {
      type: 'doughnut',
      slices: rubros,
      prefix: '$',
      centerValue: '$' + fmtAR(Math.round(total)),
      centerLabel: 'Total cuatrimestre',
      ariaLabel: `Desglose del gasto de materiales: fotocopias ${fmtAR(fotocopias)}, libros ${fmtAR(libros)}, suscripciones ${fmtAR(suscripciones)}, otros ${fmtAR(otros)}.`,
    },
  };
}
