/**
 * Cuota de un plan de ahorro de auto (círculo cerrado).
 *
 * Mecánica propia distinta del prendario: la cuota no amortiza un préstamo con
 * interés, sino que paga una fracción del valor del 0 km MÁS los gastos del plan.
 *
 *   Alícuota mensual = 100 / cantidad de cuotas   (ej. plan de 84 → 1,19%/mes)
 *   Cuota pura       = valor móvil del auto × alícuota   = valor móvil / cuotas
 *   Gasto administrativo (arancel de la administradora) = cuota pura × % admin
 *   Seguro de vida del suscriptor                        = cuota pura × % seguro
 *   IVA (21%) se aplica sobre gastos administrativos y seguro (no sobre la cuota pura).
 *   Cuota mensual = cuota pura + gasto admin + seguro de vida + IVA sobre esos cargos
 *
 * El "valor móvil" lo actualiza la terminal (Renault/VW/Chevrolet, etc.) cada
 * vez que sube la lista, así que la cuota se mueve mes a mes. Todos los % son
 * editables porque cambian por administradora y por plan.
 */

export interface Inputs {
  valorMovil: number;      // precio de lista del 0 km (valor móvil vigente)
  cantidadCuotas?: number; // duración del plan (típico 84)
  porcentajeAdmin?: number;  // arancel administrativo mensual (% de la cuota pura)
  porcentajeSeguro?: number; // seguro de vida (% de la cuota pura)
}

export interface Outputs {
  cuotaMensual: string;
  cuotaPura: string;
  gastoAdmin: string;
  seguroVida: string;
  iva: string;
  alicuota: string;
  totalPlanAprox: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const IVA = 0.21; // IVA general Argentina sobre gastos administrativos y seguros
const fmt = (n: number): string => '$' + Math.round(n).toLocaleString('es-AR');

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valorMovil) || 0;
  const cuotas = Math.max(1, Number(i.cantidadCuotas) || 84);
  const pAdmin = ((Number.isFinite(Number(i.porcentajeAdmin)) ? Number(i.porcentajeAdmin) : 2)) / 100;   // default 2%
  const pSeguro = (Number(i.porcentajeSeguro) || 0.15) / 100; // default 0,15%

  if (valor <= 0) throw new Error('Ingresá el valor móvil (precio de lista) del auto.');

  const alicuota = 1 / cuotas;             // fracción del bien por mes
  const cuotaPura = valor * alicuota;      // = valor / cuotas
  const gastoAdmin = cuotaPura * pAdmin;
  const seguroVida = cuotaPura * pSeguro;
  const iva = (gastoAdmin + seguroVida) * IVA;
  const cuotaMensual = cuotaPura + gastoAdmin + seguroVida + iva;

  // Total aproximado del plan si el valor móvil se mantuviera constante (no ocurre:
  // sube con la lista). Sirve para dimensionar el peso de los gastos.
  const totalPlan = cuotaMensual * cuotas;
  const pesoGastos = cuotaMensual > 0 ? ((gastoAdmin + seguroVida + iva) / cuotaMensual) * 100 : 0;

  const _insight = {
    title: `Cuota estimada ${fmt(cuotaMensual)}`,
    text: `Para un 0 km de **${fmt(valor)}** en un plan de **${cuotas} cuotas**, la cuota pura es **${fmt(cuotaPura)}** (1/${cuotas} del auto) y, sumando gastos administrativos, seguro de vida e IVA, pagás **${fmt(cuotaMensual)}/mes** hoy. Los gastos son el **${pesoGastos.toFixed(1)}%** de la cuota. **Ojo:** el valor móvil sube con la lista de la terminal, así que la cuota se actualiza mes a mes.`,
    tone: 'warn',
    icon: '🚗',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cuota pura (auto)', value: Math.round(cuotaPura) },
      { label: 'Gasto administrativo', value: Math.round(gastoAdmin) },
      { label: 'Seguro de vida', value: Math.round(seguroVida) },
      { label: 'IVA', value: Math.round(iva) },
    ],
    prefix: '$',
    centerValue: fmt(cuotaMensual),
    centerLabel: 'Cuota mensual',
    ariaLabel: `La cuota mensual de ${fmt(cuotaMensual)} se compone de la cuota pura ${fmt(cuotaPura)}, gasto administrativo ${fmt(gastoAdmin)}, seguro de vida ${fmt(seguroVida)} e IVA ${fmt(iva)}.`,
  };

  return {
    cuotaMensual: fmt(cuotaMensual),
    cuotaPura: fmt(cuotaPura),
    gastoAdmin: fmt(gastoAdmin),
    seguroVida: fmt(seguroVida),
    iva: fmt(iva),
    alicuota: (alicuota * 100).toFixed(2).replace('.', ',') + '%',
    totalPlanAprox: fmt(totalPlan),
    detalle: `Cuota pura ${fmt(cuotaPura)} + admin ${fmt(gastoAdmin)} + seguro ${fmt(seguroVida)} + IVA ${fmt(iva)} = ${fmt(cuotaMensual)}/mes (alícuota ${(alicuota * 100).toFixed(2)}%).`,
    _insight,
    _chart,
  };
}
