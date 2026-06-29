export interface Inputs {
  rendimientoUrbano: number; // km/litro (ciclo urbano, etiqueta de eficiencia)
  noxGramos: number;         // emisión de óxidos de nitrógeno NOx (g/km)
  precioVenta: number;       // precio de venta del vehículo (CLP)
  valorUTM: number;          // valor UTM del mes (default 71506)
}

export interface Outputs {
  impuestoUTM: number;
  impuestoPesos: number;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const valorUTM = i.valorUTM > 0 ? i.valorUTM : 71506;
  const rendimiento = i.rendimientoUrbano;
  const nox = i.noxGramos >= 0 ? i.noxGramos : 0;
  const precio = i.precioVenta > 0 ? i.precioVenta : 0;

  // Fórmula del impuesto verde — Art. 3° Ley 20.780 (aplicada por el SII):
  //   Impuesto (UTM) = [ (35 / rendimiento_urbano) + (120 × NOx) ] × (precio_venta × 0,00000006)
  // Vehículos eléctricos / sin motor de combustión: rendimiento urbano "infinito"
  // (no consumen combustible) → 35/rendimiento ≈ 0 y, sin emisiones NOx, el impuesto
  // tiende a cero. Por ley están exentos. Manejamos rendimiento muy alto o 0/indefinido.
  const esElectricoOExento =
    !isFinite(rendimiento) || rendimiento <= 0 || rendimiento >= 100000;

  let impuestoUTM: number;
  if (esElectricoOExento) {
    // Sin consumo de combustible: el término 35/rendimiento se anula.
    impuestoUTM = 120 * nox * (precio * 0.00000006);
  } else {
    impuestoUTM = ((35 / rendimiento) + (120 * nox)) * (precio * 0.00000006);
  }
  if (impuestoUTM < 0) impuestoUTM = 0;

  const impuestoUTMRedondeado = Math.round(impuestoUTM * 100) / 100;
  const impuestoPesos = Math.round(impuestoUTM * valorUTM);

  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (impuestoPesos <= 0) {
    insightTone = 'good';
    insightText = `Este vehículo paga **$0** de impuesto verde. Los autos eléctricos y los de muy bajo consumo y emisiones quedan **exentos**, ya que el término de eficiencia (35 ÷ rendimiento) se anula.`;
  } else {
    const pctSobrePrecio = precio > 0 ? (impuestoPesos / precio) * 100 : 0;
    insightTone = impuestoPesos > precio * 0.05 ? 'warn' : 'neutral';
    insightText = `El impuesto verde de este vehículo es **${impuestoUTMRedondeado.toLocaleString('es-CL')} UTM**, equivalente a **${fmtCLP(impuestoPesos)}** (UTM de ${fmtCLP(valorUTM)}). Representa cerca del **${pctSobrePrecio.toFixed(1)}%** del precio de venta y se paga **por única vez** al inscribir el vehículo nuevo.`;
  }

  return {
    impuestoUTM: impuestoUTMRedondeado,
    impuestoPesos,
    _insight: {
      title: 'Cuánto pagás de impuesto verde',
      text: insightText,
      tone: insightTone,
      icon: '🌱',
    },
  };
}
