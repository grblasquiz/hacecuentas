// ============================================================
// IRPF 2026 España — Calculadora nómina
// Fuente: AEAT, Ley 35/2006 LIRPF (consolidada 2026)
//         Tipos autonómicos: leyes tributarias CCAA 2026
// ============================================================

export interface Inputs {
  salario_bruto: number;           // Euros anuales
  comunidad_autonoma: string;      // Código CCAA (MAD, CAT, AND...)
  edad: number;                    // Años a 31-dic-2026
  num_hijos: number;               // Hijos menores 25 años a cargo
  discapacidad: string;            // '0' | '33' | '65'
  situacion_familiar: string;      // 'individual' | 'conjunta_biparental' | 'conjunta_monoparental'
}

export interface Outputs {
  base_liquidable: number;
  cuota_irpf_total: number;
  tipo_efectivo: number;
  tipo_marginal: number;
  retencion_mensual: number;
  neto_anual: number;
  neto_mensual: number;
  ss_trabajador: number;
}

// ------------------------------------------------------------
// Tipos de cotización SS empleado 2026
// Fuente: Ministerio de Inclusión, Seguridad Social y Migraciones
// ------------------------------------------------------------
const SS_TRABAJADOR_PCT = 0.0635; // 4.70% CC + 1.55% desempleo + 0.10% FP

// ------------------------------------------------------------
// Tramos estatales IRPF 2026
// Fuente: Art. 63 Ley 35/2006 (Ley 7/2024 con efectos 2025-2026)
// ------------------------------------------------------------
const TRAMOS_ESTATALES: Array<{ hasta: number; tipo: number }> = [
  { hasta: 12450,   tipo: 0.095 },
  { hasta: 20200,   tipo: 0.120 },
  { hasta: 35200,   tipo: 0.150 },
  { hasta: 60000,   tipo: 0.185 },
  { hasta: 300000,  tipo: 0.225 },
  { hasta: Infinity, tipo: 0.245 },
];

// ------------------------------------------------------------
// Tramos autonómicos IRPF 2026 por CCAA
// Fuentes: Leyes presupuestarias autonómicas 2026
// (Navarra: aproximación régimen común; País Vasco: no incluido)
// ------------------------------------------------------------
type Tramo = { hasta: number; tipo: number };

const TRAMOS_AUTONOMICOS: Record<string, Tramo[]> = {
  // Andalucía — Ley 5/2021 (sin cambios 2026)
  AND: [
    { hasta: 12450,    tipo: 0.095 },
    { hasta: 20200,    tipo: 0.120 },
    { hasta: 35200,    tipo: 0.150 },
    { hasta: 60000,    tipo: 0.185 },
    { hasta: 120000,   tipo: 0.195 },
    { hasta: Infinity, tipo: 0.225 },
  ],
  // Aragón
  ARA: [
    { hasta: 12450,    tipo: 0.095 },
    { hasta: 20200,    tipo: 0.125 },
    { hasta: 35200,    tipo: 0.155 },
    { hasta: 60000,    tipo: 0.190 },
    { hasta: 120000,   tipo: 0.220 },
    { hasta: Infinity, tipo: 0.250 },
  ],
  // Asturias
  AST: [
    { hasta: 12450,    tipo: 0.100 },
    { hasta: 17707,    tipo: 0.120 },
    { hasta: 33007,    tipo: 0.140 },
    { hasta: 53407,    tipo: 0.185 },
    { hasta: 90000,    tipo: 0.215 },
    { hasta: 175000,   tipo: 0.235 },
    { hasta: Infinity, tipo: 0.250 },
  ],
  // Islas Baleares
  BAL: [
    { hasta: 10000,    tipo: 0.090 },
    { hasta: 18000,    tipo: 0.115 },
    { hasta: 30000,    tipo: 0.145 },
    { hasta: 50000,    tipo: 0.185 },
    { hasta: 80000,    tipo: 0.210 },
    { hasta: Infinity, tipo: 0.240 },
  ],
  // Canarias
  CAN: [
    { hasta: 12450,    tipo: 0.090 },
    { hasta: 20200,    tipo: 0.115 },
    { hasta: 35200,    tipo: 0.145 },
    { hasta: 60000,    tipo: 0.175 },
    { hasta: Infinity, tipo: 0.205 },
  ],
  // Cantabria
  CAB: [
    { hasta: 12450,    tipo: 0.095 },
    { hasta: 20200,    tipo: 0.120 },
    { hasta: 35200,    tipo: 0.150 },
    { hasta: 60000,    tipo: 0.185 },
    { hasta: 90000,    tipo: 0.210 },
    { hasta: Infinity, tipo: 0.235 },
  ],
  // Castilla-La Mancha
  CLM: [
    { hasta: 12450,    tipo: 0.095 },
    { hasta: 20200,    tipo: 0.120 },
    { hasta: 35200,    tipo: 0.150 },
    { hasta: 60000,    tipo: 0.185 },
    { hasta: Infinity, tipo: 0.225 },
  ],
  // Castilla y León
  CYL: [
    { hasta: 12450,    tipo: 0.095 },
    { hasta: 20200,    tipo: 0.120 },
    { hasta: 35200,    tipo: 0.150 },
    { hasta: 60000,    tipo: 0.185 },
    { hasta: Infinity, tipo: 0.215 },
  ],
  // Cataluña
  CAT: [
    { hasta: 12450,    tipo: 0.105 },
    { hasta: 17707,    tipo: 0.120 },
    { hasta: 21000,    tipo: 0.140 },
    { hasta: 33007,    tipo: 0.155 },
    { hasta: 53407,    tipo: 0.175 },
    { hasta: 90000,    tipo: 0.215 },
    { hasta: 120000,   tipo: 0.235 },
    { hasta: 175000,   tipo: 0.245 },
    { hasta: Infinity, tipo: 0.250 },
  ],
  // Extremadura
  EXT: [
    { hasta: 12450,    tipo: 0.080 },
    { hasta: 20200,    tipo: 0.115 },
    { hasta: 35200,    tipo: 0.145 },
    { hasta: 60000,    tipo: 0.175 },
    { hasta: 120000,   tipo: 0.205 },
    { hasta: Infinity, tipo: 0.245 },
  ],
  // Galicia
  GAL: [
    { hasta: 12450,    tipo: 0.095 },
    { hasta: 20200,    tipo: 0.120 },
    { hasta: 35200,    tipo: 0.150 },
    { hasta: 60000,    tipo: 0.185 },
    { hasta: 70000,    tipo: 0.215 },
    { hasta: Infinity, tipo: 0.235 },
  ],
  // Madrid — Ley 6/1999 (bonificación del 25% sobre tramos autonómicos base)
  MAD: [
    { hasta: 12450,    tipo: 0.090 },
    { hasta: 17707,    tipo: 0.110 },
    { hasta: 33007,    tipo: 0.130 },
    { hasta: 53407,    tipo: 0.170 },
    { hasta: Infinity, tipo: 0.210 },
  ],
  // Murcia
  MUR: [
    { hasta: 12450,    tipo: 0.095 },
    { hasta: 20200,    tipo: 0.120 },
    { hasta: 35200,    tipo: 0.150 },
    { hasta: 60000,    tipo: 0.185 },
    { hasta: Infinity, tipo: 0.225 },
  ],
  // Navarra (régimen foral — aproximación régimen común)
  NAV: [
    { hasta: 12450,    tipo: 0.095 },
    { hasta: 20200,    tipo: 0.120 },
    { hasta: 35200,    tipo: 0.150 },
    { hasta: 60000,    tipo: 0.185 },
    { hasta: Infinity, tipo: 0.225 },
  ],
  // La Rioja
  RIO: [
    { hasta: 12450,    tipo: 0.095 },
    { hasta: 20200,    tipo: 0.120 },
    { hasta: 35200,    tipo: 0.150 },
    { hasta: 60000,    tipo: 0.185 },
    { hasta: Infinity, tipo: 0.225 },
  ],
  // Comunitat Valenciana
  VAL: [
    { hasta: 12450,    tipo: 0.100 },
    { hasta: 17707,    tipo: 0.120 },
    { hasta: 33007,    tipo: 0.150 },
    { hasta: 53407,    tipo: 0.193 },
    { hasta: 120000,   tipo: 0.235 },
    { hasta: 175000,   tipo: 0.245 },
    { hasta: Infinity, tipo: 0.250 },
  ],
};

// Fallback: tramos estatales (en caso de CCAA no reconocida)
const TRAMOS_FALLBACK: Tramo[] = [
  { hasta: 12450,    tipo: 0.095 },
  { hasta: 20200,    tipo: 0.120 },
  { hasta: 35200,    tipo: 0.150 },
  { hasta: 60000,    tipo: 0.185 },
  { hasta: Infinity, tipo: 0.225 },
];

// ------------------------------------------------------------
// Mínimo personal — Art. 57 LIRPF
// ------------------------------------------------------------
function minimoPersonal(edad: number): number {
  let minimo = 5550;
  if (edad >= 65 && edad < 75) minimo += 1150;
  if (edad >= 75) minimo += 1150 + 1400; // ambos adicionales
  return minimo;
}

// ------------------------------------------------------------
// Mínimo por descendientes — Art. 58 LIRPF
// ------------------------------------------------------------
function minimoDescendientes(numHijos: number): number {
  const cuantias = [2400, 2700, 4000, 4500];
  let total = 0;
  for (let i = 0; i < numHijos; i++) {
    total += i < 4 ? cuantias[i] : 4500;
  }
  return total;
}

// ------------------------------------------------------------
// Mínimo por discapacidad contribuyente — Art. 60 LIRPF
// ------------------------------------------------------------
function minimoDiscapacidad(grado: string): number {
  if (grado === '65') return 9000;
  if (grado === '33') return 3000;
  return 0;
}

// ------------------------------------------------------------
// Reducción por obtención de rendimientos del trabajo — Art. 20 LIRPF
// Actualizado Ley 7/2024 (efectos 2025-2026)
// ------------------------------------------------------------
function reduccionRendimientosTrabajo(rendimientoNeto: number): number {
  if (rendimientoNeto <= 0) return 0;
  if (rendimientoNeto <= 14852) return 6498;
  if (rendimientoNeto <= 17673.52) {
    return Math.max(0, 6498 - 1.14286 * (rendimientoNeto - 14852));
  }
  if (rendimientoNeto <= 33007) return 2364;
  return 0;
}

// ------------------------------------------------------------
// Función genérica de cálculo progresivo de cuota
// ------------------------------------------------------------
function calcularCuotaProgresiva(base: number, tramos: Tramo[]): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let baseAcumulada = 0;
  for (const tramo of tramos) {
    const limite = tramo.hasta;
    if (base <= baseAcumulada) break;
    const baseEnTramo = Math.min(base, limite) - baseAcumulada;
    cuota += baseEnTramo * tramo.tipo;
    baseAcumulada = limite;
    if (limite === Infinity) break;
  }
  return cuota;
}

// ------------------------------------------------------------
// Tipo marginal combinado (estatal + autonómico)
// ------------------------------------------------------------
function tipoMarginalCombinado(base: number, tramosAutonomicos: Tramo[]): number {
  if (base <= 0) return TRAMOS_ESTATALES[0].tipo + tramosAutonomicos[0].tipo;
  let tipoEstatal = TRAMOS_ESTATALES[TRAMOS_ESTATALES.length - 1].tipo;
  for (const t of TRAMOS_ESTATALES) {
    if (base <= t.hasta) { tipoEstatal = t.tipo; break; }
  }
  let tipoAut = tramosAutonomicos[tramosAutonomicos.length - 1].tipo;
  for (const t of tramosAutonomicos) {
    if (base <= t.hasta) { tipoAut = t.tipo; break; }
  }
  return tipoEstatal + tipoAut;
}

// ------------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ------------------------------------------------------------
export function compute(i: Inputs): Outputs {
  const bruto = Math.max(0, i.salario_bruto ?? 0);
  const edad = Math.max(16, Math.min(99, i.edad ?? 35));
  const numHijos = Math.max(0, Math.min(10, i.num_hijos ?? 0));
  const discapacidad = i.discapacidad ?? '0';
  const situacion = i.situacion_familiar ?? 'individual';
  const ccaa = i.comunidad_autonoma ?? 'MAD';

  const tramosAut: Tramo[] = TRAMOS_AUTONOMICOS[ccaa] ?? TRAMOS_FALLBACK;

  // 1. Cotización SS empleado
  const ss = bruto * SS_TRABAJADOR_PCT;

  // 2. Rendimiento neto previo (antes reducción art. 20)
  const rendimientoNetoPrevio = Math.max(0, bruto - ss);

  // 3. Reducción por rendimientos del trabajo
  const redRendimientos = reduccionRendimientosTrabajo(rendimientoNetoPrevio);

  // 4. Rendimiento neto reducido
  const rendimientoNetReducido = Math.max(0, rendimientoNetoPrevio - redRendimientos);

  // 5. Reducción por tributación conjunta
  let redConjunta = 0;
  if (situacion === 'conjunta_biparental') redConjunta = 3400;
  if (situacion === 'conjunta_monoparental') redConjunta = 2150;

  // 6. Base liquidable general
  const baseLiquidable = Math.max(0, rendimientoNetReducido - redConjunta);

  // 7. Cuota íntegra estatal y autonómica
  const cuotaEstatal = calcularCuotaProgresiva(baseLiquidable, TRAMOS_ESTATALES);
  const cuotaAutonomica = calcularCuotaProgresiva(baseLiquidable, tramosAut);

  // 8. Mínimo personal y familiar
  const minPersonal = minimoPersonal(edad);
  const minDescend = minimoDescendientes(numHijos);
  const minDiscap = minimoDiscapacidad(discapacidad);
  const minimoTotal = minPersonal + minDescend + minDiscap;

  // Cuota generada por el mínimo (a los tipos del primer tramo estatal + autonómico)
  // Según LIRPF se aplica el tipo del primer tramo a la base del mínimo
  const tipoEstatalPrimerTramo = TRAMOS_ESTATALES[0].tipo;
  const tipoAutPrimerTramo = tramosAut[0].tipo;
  const cuotaMinimoEstatal = Math.min(minimoTotal, baseLiquidable) * tipoEstatalPrimerTramo;
  const cuotaMinimoAut = Math.min(minimoTotal, baseLiquidable) * tipoAutPrimerTramo;

  // 9. Cuota diferencial (no puede ser negativa)
  const cuotaEstatalNeta = Math.max(0, cuotaEstatal - cuotaMinimoEstatal);
  const cuotaAutNeta = Math.max(0, cuotaAutonomica - cuotaMinimoAut);
  const cuotaTotal = cuotaEstatalNeta + cuotaAutNeta;

  // 10. Magnitudes finales
  const tipoEfectivo = bruto > 0 ? (cuotaTotal / bruto) * 100 : 0;
  const tipoMarginal = tipoMarginalCombinado(baseLiquidable, tramosAut) * 100;
  const retencionMensual = cuotaTotal / 12;
  const netoAnual = Math.max(0, bruto - ss - cuotaTotal);
  const netoMensual = netoAnual / 12;

  return {
    base_liquidable: Math.round(baseLiquidable * 100) / 100,
    cuota_irpf_total: Math.round(cuotaTotal * 100) / 100,
    tipo_efectivo: Math.round(tipoEfectivo * 100) / 100,
    tipo_marginal: Math.round(tipoMarginal * 100) / 100,
    retencion_mensual: Math.round(retencionMensual * 100) / 100,
    neto_anual: Math.round(netoAnual * 100) / 100,
    neto_mensual: Math.round(netoMensual * 100) / 100,
    ss_trabajador: Math.round(ss * 100) / 100,
  };
}
