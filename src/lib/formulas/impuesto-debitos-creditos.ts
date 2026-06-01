/** Impuesto a los débitos y créditos (al cheque) — Ley 25.413 */
export interface Inputs { monto: number; tipo: 'debito' | 'credito' | 'ambos' | string; }
export interface Outputs {
  impuesto: number;
  alicuotaAplicada: number;
  total: number;
  computableContraGanancias: number;
  _chart?: any;
}

export function impuestoDebitosCreditos(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const tipo = String(i.tipo || 'ambos');
  if (!monto || monto <= 0) throw new Error('Ingresá el monto de la operación');

  // Alícuota general: 0.6 % por débito y 0.6 % por crédito (1.2 % total si ambos)
  // Pymes y agro tienen reducciones, pero acá asumimos régimen general.
  const alicuotaUnilateral = 0.006;
  let alicuota = 0;
  if (tipo === 'debito' || tipo === 'credito') alicuota = alicuotaUnilateral;
  else alicuota = alicuotaUnilateral * 2; // ambos = 1.2 %

  const impuesto = monto * alicuota;
  // 33 % del impuesto crédito se puede tomar como pago a cuenta de Ganancias (para inscriptos)
  const computable = impuesto * 0.33;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Monto operación', value: Math.round(monto) },
      { label: 'Impuesto', value: Math.round(impuesto) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(monto + impuesto).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición del total: monto de la operación más el impuesto a los débitos y créditos',
  };

  return {
    impuesto: Math.round(impuesto),
    alicuotaAplicada: Number((alicuota * 100).toFixed(2)),
    total: Math.round(monto + impuesto),
    computableContraGanancias: Math.round(computable),
    _chart: chart,
  };
}
