/** Tax cripto Argentina 2026 */
export interface Inputs { gananciaArs: number; tipoDeclarante: string; incluyeMonotributo: boolean; }
export interface Outputs { impuestoArs: number; aliquotaEfectiva: number; tipoImpuesto: string; netoArs: number; explicacion: string; }
export function criptoTaxArgentinaGanancia(i: Inputs): Outputs {
  const ganancia = Number(i.gananciaArs);
  const tipo = String(i.tipoDeclarante || 'fisica');
  const monot = Boolean(i.incluyeMonotributo);
  if (ganancia < 0) throw new Error('Ganancia inválida');
  let impuesto = 0;
  let alicuota = 0;
  let tipoImp = '';
  if (monot) {
    tipoImp = 'Monotributo (actividad cripto encuadrada)';
    impuesto = 0;
    alicuota = 0;
  } else if (tipo === 'juridica') {
    alicuota = 0.35;
    impuesto = ganancia * alicuota;
    tipoImp = 'Impuesto a las Ganancias 35% (persona jurídica)';
  } else {
    alicuota = 0.15;
    impuesto = ganancia * alicuota;
    tipoImp = 'Ganancias de capital 15% (persona física, art. 90 LIG)';
  }
  const neto = ganancia - impuesto;
  return {
    impuestoArs: Number(impuesto.toFixed(2)),
    aliquotaEfectiva: Number((alicuota * 100).toFixed(2)),
    tipoImpuesto: tipoImp,
    netoArs: Number(neto.toFixed(2)),
    explicacion: `${tipoImp}. Ganancia ARS ${ganancia.toLocaleString()} × ${(alicuota*100).toFixed(1)}% = ${impuesto.toLocaleString()} de impuesto. Neto: ${neto.toLocaleString()} ARS.`,
  };
}
