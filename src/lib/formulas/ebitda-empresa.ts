/** EBITDA: Earnings Before Interest, Taxes, Depreciation and Amortization */
export interface Inputs {
  gananciaNeta: number;
  intereses: number;
  impuestos: number;
  depreciacion: number;
  amortizacion: number;
  ingresos?: number;
}
export interface Outputs {
  ebitda: number;
  margenEbitda: number;
  multiplicadorCirca: string;
  interpretacion: string;
  resumen: string;
}

export function ebitdaEmpresa(i: Inputs): Outputs {
  const gn = Number(i.gananciaNeta);
  const int = Number(i.intereses) || 0;
  const imp = Number(i.impuestos) || 0;
  const dep = Number(i.depreciacion) || 0;
  const am = Number(i.amortizacion) || 0;
  const ingresos = Number(i.ingresos) || 0;

  if (isNaN(gn)) throw new Error('Ingresá la ganancia neta');
  if (int < 0 || imp < 0 || dep < 0 || am < 0) throw new Error('Intereses, impuestos, depreciación y amortización deben ser positivos');

  const ebitda = gn + int + imp + dep + am;
  const margenEbitda = ingresos > 0 ? (ebitda / ingresos) * 100 : 0;

  let interpretacion = '';
  if (ingresos === 0) interpretacion = 'Ingresá los ingresos para ver el margen EBITDA.';
  else if (margenEbitda >= 30) interpretacion = 'Margen EBITDA excelente, típico de SaaS maduros o marcas premium.';
  else if (margenEbitda >= 15) interpretacion = 'Margen saludable, estándar de muchas industrias.';
  else if (margenEbitda >= 5) interpretacion = 'Margen bajo, típico de retail y servicios de baja diferenciación.';
  else if (margenEbitda > 0) interpretacion = 'Margen muy ajustado, la operación apenas genera caja.';
  else interpretacion = 'EBITDA negativo: la operación destruye caja.';

  const multiplicadorCirca = ebitda > 0 ? `Valor aproximado (EBITDA × 6-10): ${(ebitda * 6).toLocaleString()} a ${(ebitda * 10).toLocaleString()}` : 'No aplica — EBITDA negativo';

  const resumen = `EBITDA: ${ebitda.toLocaleString()}${ingresos > 0 ? ` (${margenEbitda.toFixed(1)}% margen)` : ''}.`;

  return {
    ebitda: Math.round(ebitda),
    margenEbitda: Number(margenEbitda.toFixed(2)),
    multiplicadorCirca,
    interpretacion,
    resumen,
  };
}
