export interface Inputs {
  sueldo_base_mensual: number;
  bono_esperado: number;
  objetivos_cumplidos_pct: number;
  tipo_salud: 'fonasa' | 'isapre';
  afiliado_afp: 'si' | 'no';
  comision_afp_pct?: number;
}

export interface Outputs {
  bono_bruto_calculado: number;
  remuneracion_bruta_total: number;
  imponible_total: number;
  descuento_afp: number;
  comision_afp: number;
  descuento_salud: number;
  iusc_retenido: number;
  total_retenciones: number;
  sueldo_liquido: number;
  aporte_empleador_afp: number;
  aporte_empleador_salud: number;
  costo_nomina_total: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile (SII, Banco Central, Superintendencias)
  const UTA_2026 = 62868; // Unidad Tributaria Anual 2026 en pesos
  const TASA_AFP = 0.10; // 10% fondo de pensiones
  const TASA_SALUD = 0.07; // 7% Fonasa/Isapre
  const APORTE_EMP_AFP = 0.10; // 10% aporte empleador
  const APORTE_EMP_SALUD = 0.0617; // 6.17% aporte empleador salud
  const COMISION_AFP_DEFAULT = 1.45 / 100; // Comisión promedio 1.45% si no especifica

  // Validaciones y defaults
  const sueldoBase = Math.max(0, i.sueldo_base_mensual);
  const bonoEsperado = Math.max(0, i.bono_esperado);
  const objCumplidos = Math.max(0, Math.min(150, i.objetivos_cumplidos_pct)); // 0-150%
  const comisionAfp = (i.comision_afp_pct !== undefined && i.comision_afp_pct > 0)
    ? i.comision_afp_pct / 100
    : COMISION_AFP_DEFAULT;
  const esAfiliado = i.afiliado_afp === 'si';

  // 1. Cálculo bono bruto ajustado
  const bonoBruto = bonoEsperado * (objCumplidos / 100);

  // 2. Remuneración bruta total
  const remBrutaTotal = sueldoBase + bonoBruto;

  // 3. Imponible (base para cálculo IUSC, AFP, salud)
  const imponible = remBrutaTotal;

  // 4. Descuentos obligatorios
  let descAfp = 0;
  let descComisionAfp = 0;
  if (esAfiliado) {
    descAfp = imponible * TASA_AFP;
    descComisionAfp = imponible * comisionAfp;
  }

  const descSalud = imponible * TASA_SALUD;

  // 5. Cálculo IUSC (tabla progresiva 2026, simplificada por tramos)
  // Tramos UTA 2026 (aproximado)
  const iuscCalculado = calcularIUSC(imponible, UTA_2026);

  // 6. Total retenciones
  const totalRetenciones = descAfp + descComisionAfp + descSalud + iuscCalculado;

  // 7. Sueldo líquido
  const sueldoLiquido = Math.max(0, remBrutaTotal - totalRetenciones);

  // 8. Aportes empleador
  const aporteEmpAfp = imponible * APORTE_EMP_AFP;
  const aporteEmpSalud = imponible * APORTE_EMP_SALUD;

  // 9. Costo total nómina (empresa)
  const costoNominaTotal = remBrutaTotal + aporteEmpAfp + aporteEmpSalud;

  return {
    bono_bruto_calculado: Math.round(bonoBruto),
    remuneracion_bruta_total: Math.round(remBrutaTotal),
    imponible_total: Math.round(imponible),
    descuento_afp: Math.round(descAfp),
    comision_afp: Math.round(descComisionAfp),
    descuento_salud: Math.round(descSalud),
    iusc_retenido: Math.round(iuscCalculado),
    total_retenciones: Math.round(totalRetenciones),
    sueldo_liquido: Math.round(sueldoLiquido),
    aporte_empleador_afp: Math.round(aporteEmpAfp),
    aporte_empleador_salud: Math.round(aporteEmpSalud),
    costo_nomina_total: Math.round(costoNominaTotal)
  };
}

/**
 * Calcula IUSC según tabla progresiva 2026
 * UTA 2026 = $62.868 pesos
 * Tramos: 0, 13.5, 21, 30, 40, 50, 60, 70 UTA
 * Tasas: 0%, 5%, 10%, 14%, 17%, 20%, 23%, 27%
 */
function calcularIUSC(imponible: number, uta: number): number {
  if (imponible <= 0) return 0;

  const utas = imponible / uta;
  let iusc = 0;
  let rebaja = 0;

  // Tramo 1: 0 - 13.5 UTA (0%)
  if (utas <= 13.5) {
    return 0;
  }

  // Tramo 2: 13.5 - 21 UTA (5%)
  if (utas <= 21) {
    iusc = (utas - 13.5) * uta * 0.05;
    rebaja = 13.5 * uta * 0.05;
    return Math.max(0, iusc - rebaja);
  }

  // Tramo 3: 21 - 30 UTA (10%)
  if (utas <= 30) {
    iusc = (utas - 21) * uta * 0.10;
    rebaja = 21 * uta * 0.10;
    return Math.max(0, iusc - rebaja);
  }

  // Tramo 4: 30 - 40 UTA (14%)
  if (utas <= 40) {
    iusc = (utas - 30) * uta * 0.14;
    rebaja = 30 * uta * 0.14;
    return Math.max(0, iusc - rebaja);
  }

  // Tramo 5: 40 - 50 UTA (17%)
  if (utas <= 50) {
    iusc = (utas - 40) * uta * 0.17;
    rebaja = 40 * uta * 0.17;
    return Math.max(0, iusc - rebaja);
  }

  // Tramo 6: 50 - 60 UTA (20%)
  if (utas <= 60) {
    iusc = (utas - 50) * uta * 0.20;
    rebaja = 50 * uta * 0.20;
    return Math.max(0, iusc - rebaja);
  }

  // Tramo 7: 60 - 70 UTA (23%)
  if (utas <= 70) {
    iusc = (utas - 60) * uta * 0.23;
    rebaja = 60 * uta * 0.23;
    return Math.max(0, iusc - rebaja);
  }

  // Tramo 8: 70+ UTA (27%)
  iusc = (utas - 70) * uta * 0.27;
  rebaja = 70 * uta * 0.27;
  return Math.max(0, iusc - rebaja);
}
