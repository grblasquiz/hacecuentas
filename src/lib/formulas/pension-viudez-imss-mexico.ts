/**
 * Calculadora de Pensión de Viudez IMSS — México
 *
 * Regulación: Ley del Seguro Social (LSS) Arts. 129, 130, 131 (Régimen 1997 / AFORE)
 * y LSS Arts. 152-156 (Régimen 73 anterior).
 *
 * Pensión de viudez = 90% de la pensión que habría correspondido al asegurado fallecido
 * por invalidez o, si ya estaba pensionado, 90% de su pensión.
 *
 * Requisitos del asegurado fallecido:
 *   - Al menos 150 semanas cotizadas al IMSS antes del fallecimiento (régimen 1997)
 *     o 250 semanas (régimen 73 modificado).
 *   - Estar vigente al momento del fallecimiento o tener conservación de derechos (12 meses).
 *
 * Fórmula simplificada para estimar la pensión base (antes del 90%):
 *   - Régimen 73 (afiliados antes 01/07/1997): fórmula por salario promedio últimas 250 semanas
 *   - Régimen 97 (afiliados después): se calcula por Renta Vitalicia sobre saldo AFORE,
 *     con garantía de Pensión Mínima Garantizada (PMG).
 *
 * PMG 2026 estimada ≈ $7.500 MXN/mes (indexada a SM + ajustes).
 */

export interface PensionViudezMxInputs {
  salarioPromedioAsegurado: number; // salario diario base cotización promedio (últimas 250 semanas)
  semanasCotizadas: number;
  edadFallecimientoAsegurado: number;
  regimen: '1997' | '1973'; // régimen pensionario del asegurado
}

export interface PensionViudezMxOutputs {
  pensionMensualViuda: string;
  pensionBaseAsegurado: string;
  porcentajeAplicado: string;
  requisitoSemanasCumplido: string;
  estimacion13PagasAnuales: string;
}

const fmt = (n: number) =>
  '$' +
  n.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function pensionViudezImssMexico(i: PensionViudezMxInputs): PensionViudezMxOutputs {
  const sdi = Number(i.salarioPromedioAsegurado);
  const semanas = Math.max(0, Number(i.semanasCotizadas) || 0);
  const edad = Math.max(0, Number(i.edadFallecimientoAsegurado) || 0);
  const regimen = i.regimen || '1997';

  if (!sdi || sdi <= 0) {
    throw new Error('Ingresá el salario diario base de cotización promedio del asegurado');
  }
  if (semanas <= 0) {
    throw new Error('Ingresá las semanas cotizadas del asegurado fallecido');
  }

  // Requisito mínimo de semanas según régimen
  const minSemanas = regimen === '1973' ? 250 : 150;
  const cumpleSemanas = semanas >= minSemanas;

  if (!cumpleSemanas) {
    throw new Error(
      `No se cumple el requisito mínimo de ${minSemanas} semanas cotizadas. Se requieren al menos ${minSemanas} semanas para que los beneficiarios tengan derecho a pensión de viudez (Art. 128 LSS).`
    );
  }

  // Salario mensual promedio cotizado (SBC × 30.4 días)
  const salarioMensual = sdi * 30.4;

  let pensionBase = 0;

  if (regimen === '1973') {
    // Régimen 73: fórmula por tabla Art. 167 LSS derogado (pero aplica a asegurados antes 1997)
    // Cuantía básica = 35% del salario mensual promedio
    // Asignaciones familiares (esposa 15%, hijos 10% c/u) se desprecian en esta aproximación
    // Incremento anual 1.25% por cada año excedente de 500 semanas
    const cuantiaBasica = salarioMensual * 0.35;
    const semanasExceso = Math.max(0, semanas - 500);
    const anosExceso = Math.floor(semanasExceso / 52);
    const incremento = cuantiaBasica * 0.0125 * anosExceso;
    pensionBase = cuantiaBasica + incremento;
  } else {
    // Régimen 97: estimación conservadora sobre salario mensual
    // En la práctica es renta vitalicia del saldo AFORE + PMG si aplica
    // Estimación simplificada: 35% salario mensual × (semanas / 1000) capado al SBC
    const factor = Math.min(1, semanas / 1000);
    pensionBase = salarioMensual * 0.35 + salarioMensual * 0.35 * factor;
  }

  // Aplicar 90% al beneficiario viudo (LSS Art. 131)
  const pensionViuda = pensionBase * 0.9;

  // Aguinaldo: 1 mes adicional anual (13 pagas total aprox)
  const total13Pagas = pensionViuda * 13;

  return {
    pensionMensualViuda: fmt(pensionViuda) + ' MXN/mes',
    pensionBaseAsegurado: fmt(pensionBase) + ' MXN/mes (estimada)',
    porcentajeAplicado: '90% de la pensión del asegurado fallecido (LSS Art. 131)',
    requisitoSemanasCumplido: `Sí — ${semanas} semanas cotizadas (mínimo ${minSemanas} para régimen ${regimen})`,
    estimacion13PagasAnuales: fmt(total13Pagas) + ' MXN/año (12 mensualidades + aguinaldo)',
  };
}
