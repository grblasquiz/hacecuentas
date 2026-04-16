/**
 * Calculadora de Sueldo Neto Colombia 2026
 * Deducciones: Salud (4%), Pension (4%), Fondo Solidaridad (1% si >4 SMLMV),
 * Retencion en fuente (progresiva si >$4.9M)
 * Fuente: DIAN Colombia, Ley 100 de 1993
 */

export interface SueldoNetoColombiaInputs {
  salarioMensual: number;
  tieneAuxTransporte: boolean;
  fondoPension: string;
}

export interface SueldoNetoColombiaOutputs {
  sueldoNeto: number;
  aporteSalud: number;
  aportePension: number;
  fondoSolidaridad: number;
  retencionFuente: number;
  totalDescuentos: number;
  formula: string;
  explicacion: string;
}

// SMLMV 2026 Colombia estimado
const SMLMV_2026 = 1_423_500;
const AUX_TRANSPORTE_2026 = 200_000;

// Tabla retencion en fuente 2026 (UVT estimada ~$49,800 para 2026)
const UVT_2026 = 49_800;

interface RetencionBracket {
  desdeUvt: number;
  hastaUvt: number;
  tarifaMarginal: number;
  adicionalUvt: number;
}

// Art. 383 ET - tabla simplificada mensual (rango en UVT)
const RETENCION_BRACKETS: RetencionBracket[] = [
  { desdeUvt: 0, hastaUvt: 95, tarifaMarginal: 0, adicionalUvt: 0 },
  { desdeUvt: 95, hastaUvt: 150, tarifaMarginal: 0.19, adicionalUvt: 0 },
  { desdeUvt: 150, hastaUvt: 360, tarifaMarginal: 0.28, adicionalUvt: 10 },
  { desdeUvt: 360, hastaUvt: 640, tarifaMarginal: 0.33, adicionalUvt: 69 },
  { desdeUvt: 640, hastaUvt: 945, tarifaMarginal: 0.35, adicionalUvt: 162 },
  { desdeUvt: 945, hastaUvt: 2300, tarifaMarginal: 0.37, adicionalUvt: 268 },
  { desdeUvt: 2300, hastaUvt: Infinity, tarifaMarginal: 0.39, adicionalUvt: 770 },
];

function calcularRetencionFuente(baseGravable: number): number {
  const uvts = baseGravable / UVT_2026;

  if (uvts <= 95) return 0;

  let bracket = RETENCION_BRACKETS[0];
  for (const b of RETENCION_BRACKETS) {
    if (uvts > b.desdeUvt && uvts <= b.hastaUvt) {
      bracket = b;
      break;
    }
    if (uvts > b.hastaUvt) {
      bracket = b;
    }
  }

  const retencionUvt = (uvts - bracket.desdeUvt) * bracket.tarifaMarginal + bracket.adicionalUvt;
  return retencionUvt * UVT_2026;
}

export function sueldoNetoColombia(inputs: SueldoNetoColombiaInputs): SueldoNetoColombiaOutputs {
  const salario = Number(inputs.salarioMensual);
  const tieneAuxTransporte = inputs.tieneAuxTransporte === true || inputs.tieneAuxTransporte === 'true' as any;
  const fondoPension = String(inputs.fondoPension || 'Colpensiones');

  if (!salario || salario <= 0) {
    throw new Error('Ingresa tu salario mensual');
  }

  // Auxilio de transporte: aplica si salario <= 2 SMLMV
  const aplicaAuxTransporte = tieneAuxTransporte && salario <= (SMLMV_2026 * 2);
  const auxTransporte = aplicaAuxTransporte ? AUX_TRANSPORTE_2026 : 0;

  // Aportes obligatorios del trabajador
  // Salud: 4% sobre salario (sin aux transporte)
  const aporteSalud = Math.round(salario * 0.04);

  // Pension: 4% sobre salario (sin aux transporte)
  const aportePension = Math.round(salario * 0.04);

  // Fondo de Solidaridad Pensional: 1% si salario > 4 SMLMV
  // Adicional: 0.2% extra por cada SMLMV por encima de 16 SMLMV, tope en 2%
  let fondoSolidaridad = 0;
  if (salario > SMLMV_2026 * 4) {
    fondoSolidaridad = Math.round(salario * 0.01);
    // Aporte adicional para salarios > 16 SMLMV
    if (salario > SMLMV_2026 * 16) {
      const smlmvs = salario / SMLMV_2026;
      let adicional = 0;
      if (smlmvs > 20) adicional = 0.01;
      else if (smlmvs > 19) adicional = 0.008;
      else if (smlmvs > 18) adicional = 0.006;
      else if (smlmvs > 17) adicional = 0.004;
      else adicional = 0.002;
      fondoSolidaridad += Math.round(salario * adicional);
    }
  }

  // Base gravable para retencion en fuente
  // Se restan aportes obligatorios (salud + pension)
  // Renta exenta del 25% (Art. 206 num 10 ET)
  const basePrevia = salario - aporteSalud - aportePension - fondoSolidaridad;
  const rentaExenta25 = Math.round(basePrevia * 0.25);
  const baseGravable = basePrevia - rentaExenta25;

  const retencionFuente = Math.round(calcularRetencionFuente(Math.max(0, baseGravable)));

  const totalDescuentos = aporteSalud + aportePension + fondoSolidaridad + retencionFuente;
  const sueldoNeto = salario + auxTransporte - totalDescuentos;

  const formula = `Sueldo neto = $${salario.toLocaleString('es-CO')}${auxTransporte > 0 ? ` + Aux. transporte $${auxTransporte.toLocaleString('es-CO')}` : ''} − Salud $${aporteSalud.toLocaleString('es-CO')} − Pensión $${aportePension.toLocaleString('es-CO')}${fondoSolidaridad > 0 ? ` − FSP $${fondoSolidaridad.toLocaleString('es-CO')}` : ''}${retencionFuente > 0 ? ` − ReteFuente $${retencionFuente.toLocaleString('es-CO')}` : ''} = $${sueldoNeto.toLocaleString('es-CO')}`;

  const explicacion = `De tu salario de $${salario.toLocaleString('es-CO')} COP${auxTransporte > 0 ? ` (con auxilio de transporte de $${auxTransporte.toLocaleString('es-CO')})` : ''}, se descuentan: Salud 4% ($${aporteSalud.toLocaleString('es-CO')}), Pensión 4% a ${fondoPension} ($${aportePension.toLocaleString('es-CO')})${fondoSolidaridad > 0 ? `, Fondo de Solidaridad Pensional ($${fondoSolidaridad.toLocaleString('es-CO')})` : ''}${retencionFuente > 0 ? `, y Retención en la fuente ($${retencionFuente.toLocaleString('es-CO')})` : ''}. Total descuentos: $${totalDescuentos.toLocaleString('es-CO')}. Tu sueldo neto es $${sueldoNeto.toLocaleString('es-CO')} COP.`;

  return {
    sueldoNeto: Math.round(sueldoNeto),
    aporteSalud,
    aportePension,
    fondoSolidaridad,
    retencionFuente,
    totalDescuentos,
    formula,
    explicacion,
  };
}
