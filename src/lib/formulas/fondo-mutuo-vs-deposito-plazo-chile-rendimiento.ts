export interface Inputs {
  monto_inversion: number;
  plazo_dias: number;
  rentabilidad_fm_anual: number;
  comision_fm: number;
  tasa_deposito_anual: number;
  impuesto_retencion: number;
  impuesto_fm: number;
}

export interface Outputs {
  ganancia_bruta_fm: number;
  comision_total_fm: number;
  impuesto_total_fm: number;
  ganancia_neta_fm: number;
  rentabilidad_neta_fm: number;
  ganancia_bruta_dp: number;
  retencion_dp: number;
  ganancia_neta_dp: number;
  rentabilidad_neta_dp: number;
  diferencia_neta: number;
  mejor_opcion: string;
  total_final_fm: number;
  total_final_dp: number;
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  const monto = Math.max(100000, Math.min(10000000, i.monto_inversion || 1000000));
  const dias = Math.max(30, Math.min(1825, i.plazo_dias || 365));
  const rentFM = Math.max(0.1, Math.min(15, i.rentabilidad_fm_anual || 4.5));
  const comFM = Math.max(0.1, Math.min(2, i.comision_fm || 0.45));
  const tasaDP = Math.max(0.1, Math.min(15, i.tasa_deposito_anual || 4.8));
  const impRetencion = Math.max(0, Math.min(50, i.impuesto_retencion || 19));
  const impFM = Math.max(0, Math.min(50, i.impuesto_fm || 19));

  // FONDO MUTUO
  // Ganancia bruta anual
  const gananciaBrutaAnualFM = monto * (rentFM / 100);
  // Ganancia bruta del período (días)
  const gananciaBrutaFM = gananciaBrutaAnualFM * (dias / 365);
  // Comisión total
  const comisionTotalFM = monto * (comFM / 100) * (dias / 365);
  // Ganancia neta antes impuesto
  const gananciaNetaAntesImpFM = gananciaBrutaFM - comisionTotalFM;
  // Impuesto FM (se aplica sobre ganancia neta)
  const impuestoTotalFM = Math.max(0, gananciaNetaAntesImpFM * (impFM / 100));
  // Ganancia neta final
  const gananciaNETAFM = gananciaNetaAntesImpFM - impuestoTotalFM;
  // Rentabilidad neta anualizada (%)
  const rentabilidadNetaFM = (gananciaNETAFM / monto) * (365 / dias) * 100;
  // Total final
  const totalFinalFM = monto + gananciaNETAFM;

  // DEPÓSITO A PLAZO
  // Ganancia bruta
  const gananciaBrutaDP = monto * (tasaDP / 100) * (dias / 365);
  // Retención de impuesto
  const retencionDP = gananciaBrutaDP * (impRetencion / 100);
  // Ganancia neta
  const gananciaNETADP = gananciaBrutaDP - retencionDP;
  // Rentabilidad neta anualizada (%)
  const rentabilidadNetaDP = (gananciaNETADP / monto) * (365 / dias) * 100;
  // Total final
  const totalFinalDP = monto + gananciaNETADP;

  // COMPARATIVA
  const diferenciaNeta = gananciaNETAFM - gananciaNETADP;
  // Determinar mejor opción
  let mejorOpcion = "Depósito plazo";
  if (diferenciaNeta > 100) {
    mejorOpcion = "Fondo mutuo (mayor rentabilidad neta)";
  } else if (Math.abs(diferenciaNeta) <= 100) {
    mejorOpcion = "Depósito plazo (seguridad de tasa vs FM)";
  } else {
    mejorOpcion = `Depósito plazo (${Math.abs(Math.round(diferenciaNeta)).toLocaleString()} pesos más neto)`;
  }

  return {
    ganancia_bruta_fm: Math.round(gananciaBrutaFM),
    comision_total_fm: Math.round(comisionTotalFM),
    impuesto_total_fm: Math.round(impuestoTotalFM),
    ganancia_neta_fm: Math.round(gananciaNETAFM),
    rentabilidad_neta_fm: Math.round(rentabilidadNetaFM * 100) / 100,
    ganancia_bruta_dp: Math.round(gananciaBrutaDP),
    retencion_dp: Math.round(retencionDP),
    ganancia_neta_dp: Math.round(gananciaNETADP),
    rentabilidad_neta_dp: Math.round(rentabilidadNetaDP * 100) / 100,
    diferencia_neta: Math.round(diferenciaNeta),
    mejor_opcion: mejorOpcion,
    total_final_fm: Math.round(totalFinalFM),
    total_final_dp: Math.round(totalFinalDP)
  };
}
