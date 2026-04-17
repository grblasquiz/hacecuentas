/**
 * Calculadora de cuotas IMSS México (obrero-patronales)
 * Incluye enfermedad/maternidad, invalidez/vida, retiro/cesantía e Infonavit
 * Valores proyectados 2026, validar contra fuente oficial
 */

export interface Inputs {
  sueldoMensual: number;
  diasAguinaldo?: number;
  primaVacacional?: number; // %
  primaRiesgo?: number; // %
  diasVacaciones?: number;
  diasPeriodo?: number;
}

export interface Outputs {
  cuotaObrero: number;
  cuotaPatron: number;
  costoTotalPatron: number;
  sbcDiario: number;
  porcObrero: number;
  desglose: Record<string, { obrero: number; patron: number }>;
  mensaje: string;
}

export function cuotasImssMexico(i: Inputs): Outputs {
  const sueldoMensual = Number(i.sueldoMensual);
  const diasAguinaldo = Number(i.diasAguinaldo ?? 15);
  const primaVac = Number(i.primaVacacional ?? 25);
  const primaRiesgo = Number(i.primaRiesgo ?? 0.54);
  const diasVac = Number(i.diasVacaciones ?? 12);
  const dias = Number(i.diasPeriodo ?? 30);

  if (!sueldoMensual || sueldoMensual <= 0) throw new Error('Ingresá el sueldo mensual');

  const salarioDiario = sueldoMensual / 30;
  // Factor de integración = 1 + (aguinaldo/365) + (primaVac% × diasVac/365)
  const factorIntegracion = 1 + (diasAguinaldo / 365) + ((primaVac / 100) * diasVac / 365);
  const sbcDiario = salarioDiario * factorIntegracion;
  const base = sbcDiario * dias;

  const pct = {
    enfMatPatron: 20.40,
    enfMatObrero: 0.40,
    invVidaPatron: 1.75,
    invVidaObrero: 0.625,
    retPatron: 2.00,
    cesPatron: 3.15,
    cesObrero: 1.125,
    guarderiaPatron: 1.00,
    riesgoPatron: primaRiesgo,
    infonavitPatron: 5.00,
  };

  const enfMat = { obrero: base * pct.enfMatObrero / 100, patron: base * pct.enfMatPatron / 100 };
  const invVida = { obrero: base * pct.invVidaObrero / 100, patron: base * pct.invVidaPatron / 100 };
  const retiro = { obrero: 0, patron: base * pct.retPatron / 100 };
  const cesantia = { obrero: base * pct.cesObrero / 100, patron: base * pct.cesPatron / 100 };
  const guarderia = { obrero: 0, patron: base * pct.guarderiaPatron / 100 };
  const riesgo = { obrero: 0, patron: base * pct.riesgoPatron / 100 };
  const infonavit = { obrero: 0, patron: base * pct.infonavitPatron / 100 };

  const desglose = {
    'Enfermedad y maternidad': enfMat,
    'Invalidez y vida': invVida,
    'Retiro': retiro,
    'Cesantía y vejez': cesantia,
    'Guarderías': guarderia,
    'Riesgo de trabajo': riesgo,
    'Infonavit': infonavit,
  };

  const cuotaObrero = Object.values(desglose).reduce((s, v) => s + v.obrero, 0);
  const cuotaPatron = Object.values(desglose).reduce((s, v) => s + v.patron, 0);
  const costoTotalPatron = sueldoMensual + cuotaPatron;
  const porcObrero = (cuotaObrero / base) * 100;

  const desgloseRedondeado: Record<string, { obrero: number; patron: number }> = {};
  for (const [k, v] of Object.entries(desglose)) {
    desgloseRedondeado[k] = {
      obrero: Number(v.obrero.toFixed(2)),
      patron: Number(v.patron.toFixed(2)),
    };
  }

  return {
    cuotaObrero: Number(cuotaObrero.toFixed(2)),
    cuotaPatron: Number(cuotaPatron.toFixed(2)),
    costoTotalPatron: Number(costoTotalPatron.toFixed(2)),
    sbcDiario: Number(sbcDiario.toFixed(2)),
    porcObrero: Number(porcObrero.toFixed(2)),
    desglose: desgloseRedondeado,
    mensaje: `SBC diario $${sbcDiario.toFixed(2)}. Cuota obrera: $${cuotaObrero.toFixed(2)} | Cuota patronal: $${cuotaPatron.toFixed(2)} | Costo total patrón: $${costoTotalPatron.toFixed(2)}.`,
  };
}
