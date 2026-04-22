/** Seguro de caución alquiler España — prima anual y mensual vs aval bancario */
export interface Inputs { alquilerMensual: number; plazoMeses: number; cobertura: string; }
export interface Outputs { primaAnual: number; primaMensual: number; costoTotal: number; equivalenteMesesRenta: number; avalBancarioEstimado: number; ahorroVsAval: number; }

export function seguroCaucionAlquilerEspana(i: Inputs): Outputs {
  const renta = Number(i.alquilerMensual);
  const plazo = Number(i.plazoMeses) || 12;
  const cob = String(i.cobertura || '12');
  if (!renta || renta <= 0) throw new Error('Ingresá alquiler mensual válido');
  // Prima anual típica: 3,5%-5% de la renta anual asegurada en España (Arag, Mapfre, Caser)
  // Depende de cobertura (meses asegurados) y perfil del inquilino
  const mesesCobertura = Number(cob);
  const rentaAnualAsegurada = renta * mesesCobertura;
  // Tasa base 4% + ajuste por cobertura
  const tasa = mesesCobertura <= 6 ? 0.035 : mesesCobertura <= 12 ? 0.042 : 0.05;
  const primaAnual = rentaAnualAsegurada * tasa;
  const primaMensual = primaAnual / 12;
  const costoTotal = primaAnual * (plazo / 12);
  const equivalenteMesesRenta = costoTotal / renta;
  // Aval bancario: suele pedirse 6 meses de renta inmovilizados + comisión 1%/año
  const avalBancarioEstimado = (renta * 6 * 0.01) * (plazo / 12) + (renta * 6 * 0.002);
  // Costo de oportunidad del dinero inmovilizado (~3% anual tipo depósito)
  const costoOportunidad = renta * 6 * 0.03 * (plazo / 12);
  const avalTotal = avalBancarioEstimado + costoOportunidad;
  const ahorroVsAval = avalTotal - costoTotal;
  return {
    primaAnual: Math.round(primaAnual),
    primaMensual: Math.round(primaMensual),
    costoTotal: Math.round(costoTotal),
    equivalenteMesesRenta: Number(equivalenteMesesRenta.toFixed(2)),
    avalBancarioEstimado: Math.round(avalTotal),
    ahorroVsAval: Math.round(ahorroVsAval),
  };
}
