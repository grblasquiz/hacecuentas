export interface Inputs {
  monto_inversion: number;
  plazo_dias: number;
  rentabilidad_fm_anual: number;
  comision_fm: number;
  tasa_deposito_anual: number;
  /** Tasa marginal del Impuesto Global Complementario del contribuyente (%). 0 = tramo exento. */
  tasa_marginal_igc: number;
}

export interface Outputs {
  ganancia_bruta_fm: number;
  comision_total_fm: number;
  impuesto_total_fm: number;
  ganancia_neta_fm: number;
  rentabilidad_neta_fm: number;
  ganancia_bruta_dp: number;
  impuesto_dp: number;
  ganancia_neta_dp: number;
  rentabilidad_neta_dp: number;
  diferencia_neta: number;
  mejor_opcion: string;
  total_final_fm: number;
  total_final_dp: number;
  _insight?: any;
  _chart?: any;
}

// Valor UTM junio 2026 según SII (https://www.sii.cl/valores_y_fechas/utm/utm2026.htm).
// ACTUALIZAR mensualmente: las exenciones se expresan en UTM, así que driftan con la UTM.
const UTM_VIGENTE = 71506;
// Art. 57 LIR (DL 824): para trabajadores (Art. 42 N°1), pensionados y pequeños contribuyentes,
//  - los intereses de un depósito a plazo (renta de capitales mobiliarios, Art. 20 N°2) están
//    exentos del Impuesto Global Complementario hasta 20 UTM al año (~$1.430.120 con UTM jun-2026);
//  - el mayor valor obtenido en el rescate de cuotas de fondos mutuos está exento hasta 30 UTM al
//    año (~$2.145.180). Para fondos mutuos la exención opera "todo o nada": si el mayor valor anual
//    supera las 30 UTM, tributa la ganancia completa (no solo el excedente).
// No existe ninguna retención fija del 19% sobre ninguno de los dos instrumentos. Lo que el banco/
// administradora puede informar al SII no es un impuesto: el tributo final es el IGC progresivo.
const EXENCION_INTERESES = 20 * UTM_VIGENTE; // depósito a plazo (intereses)
const EXENCION_FM = 30 * UTM_VIGENTE; // fondos mutuos (mayor valor del rescate)

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  const monto = Math.max(100000, Math.min(10000000, i.monto_inversion || 1000000));
  const dias = Math.max(30, Math.min(1825, i.plazo_dias || 365));
  const rentFM = Math.max(0.1, Math.min(15, i.rentabilidad_fm_anual || 4.5));
  const comFM = Math.max(0.1, Math.min(2, i.comision_fm || 0.45));
  const tasaDP = Math.max(0.1, Math.min(15, i.tasa_deposito_anual || 4.8));
  const tasaIgc = Math.max(0, Math.min(40, Number(i.tasa_marginal_igc) || 0)) / 100;

  // FONDO MUTUO
  // Ganancia bruta anual y del período (días)
  const gananciaBrutaAnualFM = monto * (rentFM / 100);
  const gananciaBrutaFM = gananciaBrutaAnualFM * (dias / 365);
  // Comisión total del fondo
  const comisionTotalFM = monto * (comFM / 100) * (dias / 365);
  // Mayor valor del rescate ≈ ganancia neta de comisión (la remuneración del fondo ya rebaja el valor cuota)
  const mayorValorFM = gananciaBrutaFM - comisionTotalFM;
  // Impuesto Global Complementario: solo el excedente sobre la exención de 30 UTM tributa a la tasa marginal
  const baseImponibleFM = Math.max(0, mayorValorFM - EXENCION_FM);
  const impuestoTotalFM = Math.max(0, baseImponibleFM * tasaIgc);
  // Ganancia neta final
  const gananciaNETAFM = mayorValorFM - impuestoTotalFM;
  // Rentabilidad neta anualizada (%)
  const rentabilidadNetaFM = (gananciaNETAFM / monto) * (365 / dias) * 100;
  // Total final
  const totalFinalFM = monto + gananciaNETAFM;

  // DEPÓSITO A PLAZO
  // Ganancia bruta (intereses)
  const gananciaBrutaDP = monto * (tasaDP / 100) * (dias / 365);
  // Impuesto Global Complementario: solo el interés que excede la exención de 20 UTM tributa
  const baseImponibleDP = Math.max(0, gananciaBrutaDP - EXENCION_INTERESES);
  const impuestoDP = Math.max(0, baseImponibleDP * tasaIgc);
  // Ganancia neta
  const gananciaNETADP = gananciaBrutaDP - impuestoDP;
  // Rentabilidad neta anualizada (%)
  const rentabilidadNetaDP = (gananciaNETADP / monto) * (365 / dias) * 100;
  // Total final
  const totalFinalDP = monto + gananciaNETADP;

  // COMPARATIVA
  const diferenciaNeta = gananciaNETAFM - gananciaNETADP;
  const ganaFM = diferenciaNeta > 100;
  const empate = Math.abs(diferenciaNeta) <= 100;
  let mejorOpcion: string;
  if (ganaFM) {
    mejorOpcion = "Fondo mutuo (mayor rentabilidad neta)";
  } else if (empate) {
    mejorOpcion = "Empate técnico (elegí por liquidez vs seguridad de tasa)";
  } else {
    mejorOpcion = `Depósito plazo (${Math.abs(Math.round(diferenciaNeta)).toLocaleString('es-CL')} pesos más neto)`;
  }

  // --- Insight ---
  const clp = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const ambosExentos = impuestoTotalFM === 0 && impuestoDP === 0;
  const impuestoFrase = ambosExentos
    ? `Con tu tramo seleccionado y montos bajo la exención (20 UTM para intereses, 30 UTM para fondos mutuos), ninguna de las dos opciones paga Impuesto Global Complementario.`
    : `El impuesto mostrado es el Global Complementario estimado sobre la parte que supera la exención (FM ${clp(impuestoTotalFM)} · DP ${clp(impuestoDP)}).`;
  const _insight = {
    title: ganaFM ? 'Gana el fondo mutuo' : empate ? 'Empate técnico' : 'Gana el depósito a plazo',
    text: ganaFM
      ? `El **fondo mutuo** te deja **${clp(Math.abs(diferenciaNeta))}** netos más que el depósito (${rentabilidadNetaFM.toFixed(2)}% vs ${rentabilidadNetaDP.toFixed(2)}% anual), pero su rentabilidad no está garantizada. ${impuestoFrase}`
      : `El **depósito a plazo** rinde igual o mejor en neto (${rentabilidadNetaDP.toFixed(2)}% vs ${rentabilidadNetaFM.toFixed(2)}% anual del FM), con tasa fija y sin volatilidad. Diferencia: **${clp(Math.abs(diferenciaNeta))}**. ${impuestoFrase}`,
    tone: ganaFM ? 'warn' : 'good',
    icon: '⚖️'
  };

  // Donut: a dónde va la ganancia bruta del fondo mutuo (neto + comisión + impuesto = bruto)
  const gbFM = Math.round(gananciaBrutaFM);
  const cFM = Math.round(comisionTotalFM);
  const iFM = Math.round(impuestoTotalFM);
  const nFM = gbFM - cFM - iFM;
  let _chart: any = undefined;
  if (gbFM > 0 && nFM >= 0) {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Ganancia neta', value: nFM },
        { label: 'Comisión', value: cFM },
        { label: 'Global Complementario', value: iFM }
      ],
      prefix: '$',
      centerValue: '$' + gbFM.toLocaleString('es-CL'),
      centerLabel: 'Ganancia bruta FM',
      ariaLabel: 'Reparto de la ganancia bruta del fondo mutuo entre neto, comisión e impuesto Global Complementario'
    };
  }

  return {
    ganancia_bruta_fm: Math.round(gananciaBrutaFM),
    comision_total_fm: Math.round(comisionTotalFM),
    impuesto_total_fm: Math.round(impuestoTotalFM),
    ganancia_neta_fm: Math.round(gananciaNETAFM),
    rentabilidad_neta_fm: Math.round(rentabilidadNetaFM * 100) / 100,
    ganancia_bruta_dp: Math.round(gananciaBrutaDP),
    impuesto_dp: Math.round(impuestoDP),
    ganancia_neta_dp: Math.round(gananciaNETADP),
    rentabilidad_neta_dp: Math.round(rentabilidadNetaDP * 100) / 100,
    diferencia_neta: Math.round(diferenciaNeta),
    mejor_opcion: mejorOpcion,
    total_final_fm: Math.round(totalFinalFM),
    total_final_dp: Math.round(totalFinalDP),
    _insight,
    ...(_chart ? { _chart } : {})
  };
}
