/** Cuántas cuotas necesitás para pagar un electrodoméstico según ingreso disponible */
export interface Inputs {
  precioContado: number;
  ingresoMensual: number;
  porcentajeDisponible?: number;
  tasaAnual?: number;
}
export interface Outputs {
  cuotaMaximaSoportable: number;
  cuotasMinimas: number;
  cuotaSugerida: number;
  interesTotal: number;
  totalPagado: number;
  cuotasRecomendadas: { cuotas: number; cuota: number; total: number; interes: number }[];
  resumen: string;
}

export function cuotasCreditoMercado(i: Inputs): Outputs {
  const p = Number(i.precioContado);
  const ing = Number(i.ingresoMensual);
  const pct = Number(i.porcentajeDisponible) || 25;
  const tasa = Number(i.tasaAnual) || 80; // TNA típica Argentina 2026

  if (!p || p <= 0) throw new Error('Ingresá el precio de contado');
  if (!ing || ing <= 0) throw new Error('Ingresá tu ingreso mensual');
  if (pct <= 0 || pct > 100) throw new Error('El porcentaje disponible debe estar entre 1% y 100%');

  const cuotaMaximaSoportable = (ing * pct) / 100;

  // Cálculo de cuota fija francés
  const tasaMensual = tasa / 100 / 12;

  const cuotasPosibles = [3, 6, 9, 12, 18, 24, 36];
  const cuotasRecomendadas = cuotasPosibles.map(n => {
    let cuota;
    if (tasaMensual === 0) cuota = p / n;
    else cuota = p * (tasaMensual * Math.pow(1 + tasaMensual, n)) / (Math.pow(1 + tasaMensual, n) - 1);
    return {
      cuotas: n,
      cuota: Math.round(cuota),
      total: Math.round(cuota * n),
      interes: Math.round(cuota * n - p),
    };
  });

  // Cantidad mínima de cuotas para que la cuota quepa en el ingreso disponible
  let cuotasMinimas = 3;
  for (const opt of cuotasRecomendadas) {
    if (opt.cuota <= cuotaMaximaSoportable) {
      cuotasMinimas = opt.cuotas;
      break;
    }
  }
  if (!cuotasRecomendadas.some(o => o.cuota <= cuotaMaximaSoportable)) {
    cuotasMinimas = 36;
  }

  // Cuota sugerida: la de 12 cuotas
  const c12 = cuotasRecomendadas.find(c => c.cuotas === 12)!;

  return {
    cuotaMaximaSoportable: Math.round(cuotaMaximaSoportable),
    cuotasMinimas,
    cuotaSugerida: c12.cuota,
    interesTotal: c12.interes,
    totalPagado: c12.total,
    cuotasRecomendadas,
    resumen: `Con $${Math.round(cuotaMaximaSoportable).toLocaleString('es-AR')} disponibles por mes, necesitás al menos ${cuotasMinimas} cuotas. A 12 cuotas pagás $${c12.cuota.toLocaleString('es-AR')} cada una.`,
  };
}
