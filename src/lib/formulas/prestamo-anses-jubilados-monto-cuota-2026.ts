export interface Inputs {
  haber: number;
  plazo: string;
  tna: number;
  montoSolicitado: number;
}

export interface Outputs {
  cuotaMensual: number;
  montoMaximo: number;
  montoUsado: number;
  totalPagar: number;
  totalIntereses: number;
  cfteaStr: string;
  advertencia: string;
}

// Límite normativo de cuota sobre haber neto (ANSES)
const LIMITE_CUOTA_HABER = 0.30;

/**
 * Calcula la cuota mensual (sistema francés) dado capital, tasa mensual y plazo.
 * Fórmula: C = P * [r*(1+r)^n] / [(1+r)^n - 1]
 */
function cuotaFrances(capital: number, tasaMensual: number, plazoMeses: number): number {
  if (tasaMensual === 0) return capital / plazoMeses;
  const factor = Math.pow(1 + tasaMensual, plazoMeses);
  return capital * (tasaMensual * factor) / (factor - 1);
}

/**
 * Despeja el capital máximo dado una cuota máxima, tasa mensual y plazo.
 * Capital = CuotaMax * [(1+r)^n - 1] / [r*(1+r)^n]
 */
function capitalDesdeCuota(cuotaMax: number, tasaMensual: number, plazoMeses: number): number {
  if (tasaMensual === 0) return cuotaMax * plazoMeses;
  const factor = Math.pow(1 + tasaMensual, plazoMeses);
  return cuotaMax * (factor - 1) / (tasaMensual * factor);
}

/**
 * Aproxima el CFTEA a partir de la cuota, capital y plazo usando bisección.
 * CFTEA es la tasa anual efectiva que iguala el flujo de pagos al capital.
 */
function calcularCFTEA(capital: number, cuota: number, plazoMeses: number): number {
  // Buscar tasa mensual efectiva por bisección
  let lo = 0.0001;
  let hi = 2.0; // hasta 200% mensual como límite práctico
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    const c = cuotaFrances(capital, mid, plazoMeses);
    if (c < cuota) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const tasaMensualEfectiva = (lo + hi) / 2;
  // Convertir a tasa anual efectiva: (1 + r_mensual)^12 - 1
  return Math.pow(1 + tasaMensualEfectiva, 12) - 1;
}

export function compute(i: Inputs): Outputs {
  const haber = Number(i.haber) || 0;
  const plazo = parseInt(i.plazo, 10) || 48;
  const tna = Number(i.tna) || 70;
  const montoSolicitadoInput = Number(i.montoSolicitado) || 0;

  if (haber <= 0) {
    return {
      cuotaMensual: 0,
      montoMaximo: 0,
      montoUsado: 0,
      totalPagar: 0,
      totalIntereses: 0,
      cfteaStr: "—",
      advertencia: "Ingresá un haber jubilatorio válido mayor a cero.",
    };
  }

  if (tna <= 0 || tna > 5000) {
    return {
      cuotaMensual: 0,
      montoMaximo: 0,
      montoUsado: 0,
      totalPagar: 0,
      totalIntereses: 0,
      cfteaStr: "—",
      advertencia: "Ingresá una TNA válida (por ejemplo: 70 para 70% anual).",
    };
  }

  const plazosValidos = [24, 36, 48, 60, 72];
  if (!plazosValidos.includes(plazo)) {
    return {
      cuotaMensual: 0,
      montoMaximo: 0,
      montoUsado: 0,
      totalPagar: 0,
      totalIntereses: 0,
      cfteaStr: "—",
      advertencia: "Plazo no válido. Elegí entre 24, 36, 48, 60 o 72 meses.",
    };
  }

  // Tasa mensual nominal
  const tasaMensual = tna / 100 / 12;

  // Cuota máxima permitida por ANSES (30% del haber neto)
  const cuotaMaxima = haber * LIMITE_CUOTA_HABER;

  // Capital máximo prestable dado ese tope de cuota
  const montoMaximo = Math.floor(capitalDesdeCuota(cuotaMaxima, tasaMensual, plazo));

  // Determinar capital efectivo a usar
  let montoUsado: number;
  let advertencia = "";

  if (montoSolicitadoInput > 0) {
    if (montoSolicitadoInput > montoMaximo) {
      montoUsado = montoMaximo;
      advertencia = `El monto solicitado supera el máximo prestable según tu haber. Se usó el máximo de $${montoMaximo.toLocaleString("es-AR")}.`;
    } else {
      montoUsado = montoSolicitadoInput;
      advertencia = "Monto dentro del límite permitido.";
    }
  } else {
    montoUsado = montoMaximo;
    advertencia = "Se calculó el monto máximo posible según el 30% del haber.";
  }

  if (montoUsado <= 0) {
    return {
      cuotaMensual: 0,
      montoMaximo: 0,
      montoUsado: 0,
      totalPagar: 0,
      totalIntereses: 0,
      cfteaStr: "—",
      advertencia: "El haber ingresado no permite acceder a un préstamo con estos parámetros.",
    };
  }

  // Cuota mensual real (sistema francés)
  const cuotaMensual = cuotaFrances(montoUsado, tasaMensual, plazo);

  // Totales
  const totalPagar = cuotaMensual * plazo;
  const totalIntereses = totalPagar - montoUsado;

  // CFTEA estimado (solo capital e intereses, sin seguros ni cargos)
  const cftea = calcularCFTEA(montoUsado, cuotaMensual, plazo);
  const cfteaStr = `${(cftea * 100).toFixed(2)}% anual efectivo (estimado, sin seguros ni cargos)`;

  return {
    cuotaMensual: Math.round(cuotaMensual),
    montoMaximo,
    montoUsado: Math.round(montoUsado),
    totalPagar: Math.round(totalPagar),
    totalIntereses: Math.round(totalIntereses),
    cfteaStr,
    advertencia,
  };
}
