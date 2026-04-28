// Calculadora Bruto → Neto España 2026
// Fuentes: Ley 35/2006 IRPF, LPGE 2026, TGSS bases cotización 2026

export interface Inputs {
  bruto_anual: number;
  num_pagas: '12' | '14';
  ccaa: string;
  situacion_familiar: 'soltero' | 'casado_trabaja' | 'casado_no_trabaja' | 'monoparental';
  num_hijos: number;
  edad: number;
  discapacidad: 'ninguna' | '33_65' | '65_mas';
}

export interface Outputs {
  neto_mensual: number;
  neto_anual: number;
  retencion_irpf_pct: number;
  cuota_irpf_anual: number;
  cuota_ss_anual: number;
  total_descuentos_anual: number;
  desglose_ss: string;
  aviso: string;
}

// ─── Constantes SS 2026 (TGSS) ───────────────────────────────────────────────
const SS_COMUNES = 0.0470;       // contingencias comunes
const SS_DESEMPLEO = 0.0155;     // desempleo contrato indefinido
const SS_FORMACION = 0.0010;     // formación profesional
const SS_TOTAL = SS_COMUNES + SS_DESEMPLEO + SS_FORMACION; // 0.0635

const SS_BASE_MIN_ANUAL = 1184.50 * 12;  // ~14.214 €/año (grupo 1 convenio, aprox.)
const SS_BASE_MAX_ANUAL = 4909.50 * 12;  // ~58.914 €/año

// ─── Mínimos personales y familiares IRPF 2026 (art. 57-61 Ley 35/2006) ────
function minimoPersonal(edad: number, discapacidad: string): number {
  let base = 5550; // < 65 años
  if (edad >= 75) base = 8100;
  else if (edad >= 65) base = 6700;

  if (discapacidad === '33_65') base += 3000;
  if (discapacidad === '65_mas') base += 9000;
  return base;
}

function minimoDescendientes(numHijos: number): number {
  // art. 58 Ley 35/2006: 2.400 / 2.700 / 4.000 / 4.500 por hijo sucesivo
  const tabla = [2400, 2700, 4000, 4500];
  let total = 0;
  for (let i = 0; i < numHijos; i++) {
    total += i < tabla.length ? tabla[i] : 4500;
  }
  return total;
}

// ─── Reducción por rendimientos del trabajo (art. 20 Ley 35/2006, 2026) ─────
function reduccionTrabajo(rendimientoNeto: number): number {
  // Hasta 16.825 €: 5.565 €
  // Entre 16.825 € y 19.747,50 €: 5.565 − 1,875 × (rn − 16.825)
  // > 19.747,50 €: 0
  if (rendimientoNeto <= 0) return 0;
  if (rendimientoNeto <= 16825) return 5565;
  if (rendimientoNeto <= 19747.5) {
    return Math.max(0, 5565 - 1.875 * (rendimientoNeto - 16825));
  }
  return 0;
}

// ─── Escala estatal IRPF 2026 (art. 63 Ley 35/2006 / LPGE 2026) ─────────────
function cuotaEscalaEstatal(base: number): number {
  // Tramos: [hasta, tipo_marginal]
  const tramos = [
    { hasta: 12450,   tipo: 0.095 },
    { hasta: 20200,   tipo: 0.12  },
    { hasta: 35200,   tipo: 0.15  },
    { hasta: 60000,   tipo: 0.185 },
    { hasta: 300000,  tipo: 0.225 },
    { hasta: Infinity, tipo: 0.245 },
  ];
  let cuota = 0;
  let baseRest = base;
  let anterior = 0;
  for (const tramo of tramos) {
    if (baseRest <= 0) break;
    const tramo_base = Math.min(baseRest, tramo.hasta - anterior);
    cuota += tramo_base * tramo.tipo;
    baseRest -= tramo_base;
    anterior = tramo.hasta;
  }
  return Math.max(0, cuota);
}

// ─── Escalas autonómicas IRPF 2026 ───────────────────────────────────────────
// Fuente: REAF-CGE Panorama Fiscal Autonómico 2026; tarifas aprobadas/prorrogadas
// Cada entrada: array de [límite_superior, tipo_marginal]
const ESCALAS_AUTONOMICAS: Record<string, Array<[number, number]>> = {
  AND: [[12450,0.095],[20200,0.12],[35200,0.15],[60000,0.185],[120000,0.225],[Infinity,0.245]],
  ARA: [[12450,0.10],[20200,0.125],[35200,0.16],[60000,0.19],[120000,0.225],[Infinity,0.245]],
  AST: [[12450,0.10],[17707,0.12],[33007,0.14],[53407,0.185],[70000,0.21],[90000,0.22],[175000,0.23],[Infinity,0.25]],
  BAL: [[10000,0.09],[18000,0.115],[30000,0.15],[52800,0.185],[70000,0.20],[90000,0.215],[Infinity,0.235]],
  CAN: [[12450,0.09],[20200,0.11],[35200,0.135],[60000,0.165],[90000,0.185],[120000,0.205],[Infinity,0.225]],
  CAB: [[12450,0.095],[20200,0.12],[35200,0.15],[60000,0.185],[120000,0.225],[Infinity,0.245]],
  CLM: [[12450,0.095],[20200,0.12],[35200,0.15],[60000,0.185],[120000,0.225],[Infinity,0.245]],
  CYL: [[12450,0.095],[20200,0.12],[35200,0.145],[60000,0.18],[120000,0.215],[Infinity,0.235]],
  CAT: [[12450,0.105],[20200,0.12],[35200,0.155],[60000,0.19],[90000,0.21],[120000,0.235],[175000,0.245],[Infinity,0.255]],
  EXT: [[12450,0.10],[20200,0.125],[35200,0.16],[60000,0.19],[120000,0.24],[Infinity,0.255]],
  GAL: [[12450,0.095],[20200,0.12],[35200,0.145],[60000,0.185],[70000,0.195],[120000,0.225],[Infinity,0.245]],
  MAD: [[12450,0.09],[20200,0.112],[35200,0.133],[60000,0.176],[Infinity,0.205]],
  MUR: [[12450,0.095],[20200,0.12],[35200,0.15],[60000,0.185],[120000,0.225],[Infinity,0.245]],
  NAV: [[13290,0.10],[20200,0.124],[40000,0.165],[60000,0.195],[120000,0.225],[Infinity,0.255]], // aprox. foral
  RIO: [[12450,0.095],[20200,0.12],[35200,0.14],[60000,0.175],[120000,0.21],[Infinity,0.235]],
  VAL: [[12450,0.10],[20200,0.13],[35200,0.16],[60000,0.205],[120000,0.24],[Infinity,0.26]],
};

function cuotaEscalaAutonomica(base: number, ccaa: string): number {
  const escala = ESCALAS_AUTONOMICAS[ccaa] ?? ESCALAS_AUTONOMICAS['MAD'];
  let cuota = 0;
  let baseRest = base;
  let anterior = 0;
  for (const [hasta, tipo] of escala) {
    if (baseRest <= 0) break;
    const tramoBase = Math.min(baseRest, hasta - anterior);
    cuota += tramoBase * tipo;
    baseRest -= tramoBase;
    anterior = hasta;
  }
  return Math.max(0, cuota);
}

// ─── Función principal ────────────────────────────────────────────────────────
export function compute(i: Inputs): Outputs {
  const bruto = Math.max(0, Number(i.bruto_anual) || 0);
  const numPagas = Number(i.num_pagas) === 12 ? 12 : 14;
  const numHijos = Math.max(0, Math.min(10, Math.round(Number(i.num_hijos) || 0)));
  const edad = Math.max(16, Math.min(99, Math.round(Number(i.edad) || 35)));
  const ccaa = i.ccaa || 'MAD';

  if (bruto === 0) {
    return {
      neto_mensual: 0,
      neto_anual: 0,
      retencion_irpf_pct: 0,
      cuota_irpf_anual: 0,
      cuota_ss_anual: 0,
      total_descuentos_anual: 0,
      desglose_ss: 'Introduce un salario bruto para calcular.',
      aviso: '',
    };
  }

  // ── 1. Cotización SS empleado ─────────────────────────────────────────────
  const baseCotizacion = Math.max(
    SS_BASE_MIN_ANUAL,
    Math.min(SS_BASE_MAX_ANUAL, bruto)
  );
  const cuotaSSComunes   = baseCotizacion * SS_COMUNES;
  const cuotaSSDesempleo = baseCotizacion * SS_DESEMPLEO;
  const cuotaSSFormacion = baseCotizacion * SS_FORMACION;
  const cuotaSS = cuotaSSComunes + cuotaSSDesempleo + cuotaSSFormacion;

  // ── 2. Rendimiento neto del trabajo ──────────────────────────────────────
  const rendimientoNeto = Math.max(0, bruto - cuotaSS);

  // ── 3. Reducción por rendimientos del trabajo ─────────────────────────────
  const redTrabajo = reduccionTrabajo(rendimientoNeto);

  // ── 4. Base imponible general ─────────────────────────────────────────────
  const baseImponible = Math.max(0, rendimientoNeto - redTrabajo);

  // ── 5. Mínimo personal y familiar ─────────────────────────────────────────
  const minPersonal = minimoPersonal(edad, i.discapacidad || 'ninguna');
  const minDescend  = minimoDescendientes(numHijos);
  // Mínimo cónyuge (solo si no trabaja)
  const minConyuge  = i.situacion_familiar === 'casado_no_trabaja' ? 3400 : 0;
  const minimoTotal = minPersonal + minDescend + minConyuge;

  // ── 6. Base liquidable ────────────────────────────────────────────────────
  const baseLiquidable = Math.max(0, baseImponible - minimoTotal);

  // ── 7. Cuota íntegra (estatal + autonómica) ───────────────────────────────
  // La tarifa se divide aprox. 50% estatal / 50% autonómica
  // Aplicamos la escala estatal a la base liquidable estatal
  // y la escala autonómica a la base liquidable autonómica
  // (En práctica son iguales salvo ajustes mínimos forales)
  const cuotaEstatal    = cuotaEscalaEstatal(baseLiquidable);
  const cuotaAutonomica = cuotaEscalaAutonomica(baseLiquidable, ccaa);

  // Reducción por mínimo personal en cuota (se grava el mínimo al tipo más bajo
  // de cada escala para calcular la deducción; simplificación: tipo efectivo 9,5% estatal)
  // Método simplificado aceptado para estimación orientativa:
  const cuotaMinEstatal    = cuotaEscalaEstatal(minimoTotal);
  const cuotaMinAutonomica = cuotaEscalaAutonomica(minimoTotal, ccaa);

  const cuotaIrpfBruta = Math.max(0, cuotaEstatal + cuotaAutonomica - cuotaMinEstatal - cuotaMinAutonomica);

  // Reducción familiar monoparental (deducción adicional orientativa)
  const dedMonoparental = i.situacion_familiar === 'monoparental' ? 1200 : 0;
  const cuotaIrpf = Math.max(0, cuotaIrpfBruta - dedMonoparental);

  // ── 8. Netos ──────────────────────────────────────────────────────────────
  const totalDescuentos = cuotaSS + cuotaIrpf;
  const netoAnual       = Math.max(0, bruto - totalDescuentos);
  const netoMensual     = netoAnual / numPagas;

  // ── 9. Tipo de retención ──────────────────────────────────────────────────
  const retencionPct = bruto > 0 ? (cuotaIrpf / bruto) * 100 : 0;

  // ── 10. Desglose SS ───────────────────────────────────────────────────────
  const desgloseStr =
    `Contingencias comunes (4,70%): ${cuotaSSComunes.toFixed(2)} € | ` +
    `Desempleo (1,55%): ${cuotaSSDesempleo.toFixed(2)} € | ` +
    `Formación (0,10%): ${cuotaSSFormacion.toFixed(2)} €`;

  // ── 11. Aviso para regímenes forales ──────────────────────────────────────
  let aviso = '';
  if (ccaa === 'NAV') {
    aviso = 'Navarra tiene régimen foral propio. El cálculo es una aproximación; consulta la Hacienda Foral de Navarra para datos exactos.';
  }
  if (bruto > SS_BASE_MAX_ANUAL) {
    aviso += (aviso ? ' | ' : '') +
      `La base de cotización SS está limitada a ${SS_BASE_MAX_ANUAL.toFixed(0)} €/año. La parte que excede ese límite no cotiza.`;
  }

  return {
    neto_mensual:          Math.round(netoMensual * 100) / 100,
    neto_anual:            Math.round(netoAnual   * 100) / 100,
    retencion_irpf_pct:    Math.round(retencionPct * 100) / 100,
    cuota_irpf_anual:      Math.round(cuotaIrpf   * 100) / 100,
    cuota_ss_anual:        Math.round(cuotaSS      * 100) / 100,
    total_descuentos_anual: Math.round(totalDescuentos * 100) / 100,
    desglose_ss:           desgloseStr,
    aviso,
  };
}
