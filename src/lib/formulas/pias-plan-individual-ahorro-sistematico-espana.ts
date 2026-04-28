// Calculadora PIAS España 2026
// Fuentes: Ley 35/2006 IRPF art. 7.v, RD 439/2007 art. 53, AEAT

export interface Inputs {
  aportacion_mensual: number;      // € / mes
  anos_aportacion: number;         // años (mín 5)
  rentabilidad_anual: number;      // % anual bruto
  edad_rescate: number;            // años al inicio de la renta vitalicia
  tipo_marginal_irpf: number;      // % tipo marginal del contribuyente
}

export interface Outputs {
  capital_final: number;                    // € acumulado bruto
  total_aportado: number;                   // € aportado total
  rendimiento_generado: number;             // € de rendimientos
  renta_vitalicia_mensual_bruta: number;    // € brutos/mes
  porcentaje_sujeto_irpf: number;          // % integración base ahorro
  renta_vitalicia_neta_mensual: number;    // € netos/mes estimados
  impuesto_fondo_equivalente: number;      // € IRPF si fuera fondo
  ahorro_fiscal_pias: number;              // € ahorro fiscal vs fondo
  advertencia: string;                     // avisos legales
}

// --- Constantes 2026 ---
// Límites PIAS (art. 7.v Ley 35/2006)
const LIMITE_ANUAL_PIAS = 8000;           // € / año
const LIMITE_TOTAL_PIAS = 240000;         // € acumulado
const PLAZO_MINIMO_ANIOS = 5;            // años para exención

// Porcentajes de integración renta vitalicia según edad (art. 25.3 LIRPF y RD 439/2007)
function getPorcentajeIntegracionRentaVitalicia(edad: number): number {
  // Fuente: art. 25.3.b Ley 35/2006 IRPF
  if (edad < 40) return 40;
  if (edad < 50) return 35;
  if (edad < 60) return 28;
  if (edad < 66) return 24;
  if (edad < 70) return 20;
  return 8;
}

// Tramos IRPF base imponible del ahorro 2026
// Fuente: art. 66 Ley 35/2006 + Ley de Presupuestos 2026
function calcularIrpfAhorro(base: number): number {
  // Tipos combinados estado + autonomía (referencia media nacional)
  let impuesto = 0;
  if (base <= 0) return 0;

  const tramos = [
    { hasta: 6000,   tipo: 0.19 },
    { hasta: 50000,  tipo: 0.21 },
    { hasta: 200000, tipo: 0.23 },
    { hasta: Infinity, tipo: 0.28 }
  ];

  let baseRestante = base;
  let limiteAnterior = 0;

  for (const tramo of tramos) {
    if (baseRestante <= 0) break;
    const tamanioTramo = tramo.hasta - limiteAnterior;
    const baseEnTramo = Math.min(baseRestante, tamanioTramo);
    impuesto += baseEnTramo * tramo.tipo;
    baseRestante -= baseEnTramo;
    limiteAnterior = tramo.hasta;
  }

  return impuesto;
}

// Factor actuarial simplificado para renta vitalicia inmediata
// Aproximación basada en tablas GRM/F-2002 con tipo técnico 2%
// Fuente: DGSFP / práctica actuarial española
function getFactorActuarialMensual(edad: number): number {
  // Factor = valor presente renta vitalicia mensual de 1€
  // Estimación lineal por tramos de edad (años de esperanza de vida × factor descuento)
  // A mayor edad, menor esperanza de vida restante → menor factor
  const esperanzaVidaRestante: { [key: number]: number } = {
    40: 42, 45: 37, 50: 32, 55: 27, 60: 23, 65: 19,
    66: 18.2, 67: 17.5, 68: 16.8, 69: 16.1,
    70: 15.5, 75: 12, 80: 9, 85: 6.5
  };

  // Interpolación lineal entre tramos de referencia
  const edadesRef = Object.keys(esperanzaVidaRestante).map(Number).sort((a, b) => a - b);

  let evRestante: number;
  if (edad <= edadesRef[0]) {
    evRestante = esperanzaVidaRestante[edadesRef[0]];
  } else if (edad >= edadesRef[edadesRef.length - 1]) {
    evRestante = esperanzaVidaRestante[edadesRef[edadesRef.length - 1]];
  } else {
    let edadInf = edadesRef[0];
    let edadSup = edadesRef[edadesRef.length - 1];
    for (let idx = 0; idx < edadesRef.length - 1; idx++) {
      if (edad >= edadesRef[idx] && edad <= edadesRef[idx + 1]) {
        edadInf = edadesRef[idx];
        edadSup = edadesRef[idx + 1];
        break;
      }
    }
    const fraccion = (edad - edadInf) / (edadSup - edadInf);
    const evInf = esperanzaVidaRestante[edadInf];
    const evSup = esperanzaVidaRestante[edadSup];
    evRestante = evInf + fraccion * (evSup - evInf);
  }

  // Factor anualidad vitalicia con tipo técnico 2%: a = (1 - v^n) / i, v = 1/(1+i)
  // Aproximación continua simplificada: a ≈ (1 - e^(-i*n)) / i
  const tipoTecnico = 0.02;
  const n = evRestante;
  const factorAnual = (1 - Math.exp(-tipoTecnico * n)) / tipoTecnico;

  // Convertir a mensual: multiplicar por 12 para obtener factor mensual total
  // Renta_mensual = Capital / (factorAnual * 12)
  return factorAnual; // se multiplica por 12 en el cálculo
}

export function compute(i: Inputs): Outputs {
  // --- Validaciones y sanitización ---
  const aportacionMensual = Math.max(0, i.aportacion_mensual || 0);
  const anosAportacion = Math.max(1, Math.round(i.anos_aportacion || 1));
  const rentabilidadAnual = Math.max(0, Math.min(50, i.rentabilidad_anual || 0));
  const edadRescate = Math.max(18, Math.min(99, Math.round(i.edad_rescate || 65)));
  const tipoMarginalIrpf = Math.max(0, Math.min(100, i.tipo_marginal_irpf || 30));

  const advertencias: string[] = [];

  // --- Comprobación límite anual ---
  const aportacionAnual = aportacionMensual * 12;
  if (aportacionAnual > LIMITE_ANUAL_PIAS) {
    advertencias.push(
      `La aportación anual (${aportacionAnual.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}) supera el límite legal de ${LIMITE_ANUAL_PIAS.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}/año. El exceso no goza de ventaja fiscal PIAS.`
    );
  }

  // --- Comprobación plazo mínimo ---
  if (anosAportacion < PLAZO_MINIMO_ANIOS) {
    advertencias.push(
      `Con menos de ${PLAZO_MINIMO_ANIOS} años de antigüedad no se aplica la exención fiscal al convertir en renta vitalicia. Los rendimientos tributarán como capital mobiliario.`
    );
  }

  // --- Capital acumulado (valor futuro renta mensual constante) ---
  // VF = PMT × [(1 + r)^n − 1] / r
  const rMensual = rentabilidadAnual / 100 / 12;
  const nMeses = anosAportacion * 12;

  let capitalFinal: number;
  if (rMensual === 0) {
    capitalFinal = aportacionMensual * nMeses;
  } else {
    capitalFinal = aportacionMensual * ((Math.pow(1 + rMensual, nMeses) - 1) / rMensual);
  }

  // --- Límite total acumulado ---
  if (capitalFinal > LIMITE_TOTAL_PIAS * 1.5) {
    advertencias.push(
      `El capital estimado supera con holgura el límite de ${LIMITE_TOTAL_PIAS.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} acumulado. Las aportaciones excedentes no se benefician de la exención PIAS.`
    );
  }

  const totalAportado = aportacionMensual * nMeses;
  const rendimientoGenerado = Math.max(0, capitalFinal - totalAportado);

  // --- Renta vitalicia mensual ---
  const factorActuarial = getFactorActuarialMensual(edadRescate);
  // Renta_mensual = Capital / (factorAnual × 12)
  const rentaVitaliiciaMensualBruta = factorActuarial > 0
    ? capitalFinal / (factorActuarial * 12)
    : 0;

  // --- Fiscalidad renta vitalicia PIAS ---
  // Si cumple requisitos (≥5 años): rendimientos acumulados EXENTOS
  // Solo tributan los rendimientos implícitos de la renta vitalicia = porcentaje × renta
  const porcentajeIntegracion = getPorcentajeIntegracionRentaVitalicia(edadRescate);
  const porcentajeSujetoIrpf = porcentajeIntegracion; // %

  // Base imponible mensual de la renta vitalicia
  const baseImponibleMensual = rentaVitaliiciaMensualBruta * (porcentajeIntegracion / 100);
  // IRPF mensual estimado usando tipo marginal del contribuyente
  const irpfMensual = baseImponibleMensual * (tipoMarginalIrpf / 100);
  const rentaVitaliciaNeta = Math.max(0, rentaVitaliiciaMensualBruta - irpfMensual);

  // --- Comparación con fondo de inversión ---
  // En fondo: los rendimientos tributan íntegramente como base del ahorro al rescatar
  const impuestoFondoEquivalente = calcularIrpfAhorro(rendimientoGenerado);

  // IRPF efectivo total del PIAS como renta vitalicia (sólo sobre los rendimientos de la renta)
  // Aproximación: suma de IRPF anual durante la esperanza de vida
  const esperanzaVidaAnios = Math.max(1, getFactorActuarialMensual(edadRescate)); // reuso del factor como proxy
  const irpfAnualRentaVitalicia = irpfMensual * 12;
  const irpfTotalVidaPias = irpfAnualRentaVitalicia * esperanzaVidaAnios;

  const ahorroFiscalPias = Math.max(0, impuestoFondoEquivalente - irpfTotalVidaPias);

  // --- Advertencia si no cumple requisitos exención ---
  let advertenciaFinal: string;
  if (anosAportacion < PLAZO_MINIMO_ANIOS) {
    advertenciaFinal = `⚠️ Sin exención fiscal: plazo (${anosAportacion} años) inferior al mínimo de 5 años. ` +
      (advertencias.length > 1 ? advertencias.filter((_, idx) => idx !== 0).join(' ') : '');
  } else if (advertencias.length > 0) {
    advertenciaFinal = `⚠️ ${advertencias.join(' ')}`;
  } else {
    advertenciaFinal = `✅ Cumples las condiciones para la exención fiscal PIAS: plazo ≥ 5 años y aportación dentro del límite legal. Recuerda que la ventaja fiscal se aplica al constituir la renta vitalicia con la aseguradora.`;
  }

  return {
    capital_final: Math.round(capitalFinal * 100) / 100,
    total_aportado: Math.round(totalAportado * 100) / 100,
    rendimiento_generado: Math.round(rendimientoGenerado * 100) / 100,
    renta_vitalicia_mensual_bruta: Math.round(rentaVitaliiciaMensualBruta * 100) / 100,
    porcentaje_sujeto_irpf: porcentajeSujetoIrpf,
    renta_vitalicia_neta_mensual: Math.round(rentaVitaliciaNeta * 100) / 100,
    impuesto_fondo_equivalente: Math.round(impuestoFondoEquivalente * 100) / 100,
    ahorro_fiscal_pias: Math.round(ahorroFiscalPias * 100) / 100,
    advertencia: advertenciaFinal
  };
}
