export interface Inputs {
  edadActual: number;
  costoUniversidad: number;
  tasaAnual: number;
  ahorroActual: number;
  tipoCosto: string;
}

export interface Outputs {
  ahorroPorMes: number;
  metaFinal: number;
  mesesRestantes: number;
  totalAportado: number;
  interesesGenerados: number;
  detalle: string;
}

// Costos de referencia 2026 en USD
const COSTOS_REFERENCIA: Record<string, number> = {
  uba: 0,
  privada_local: 300 * 60,   // USD 300/mes x 60 meses (5 años)
  latam: 800 * 60,            // USD 800/mes x 60 meses
  usa_publica: 15000 * 4,     // USD 15.000/año x 4 años
  usa_privada: 30000 * 4,     // USD 30.000/año x 4 años
  personalizado: -1,          // usa el valor ingresado por el usuario
};

export function compute(i: Inputs): Outputs {
  const edadActual = Math.floor(Number(i.edadActual) || 0);
  const tasaAnual = Number(i.tasaAnual) || 6;
  const ahorroActual = Math.max(Number(i.ahorroActual) || 0, 0);
  const tipoCosto = i.tipoCosto || "personalizado";

  // Determinar la meta final según el tipo de costo seleccionado
  let metaFinal: number;
  if (tipoCosto !== "personalizado" && COSTOS_REFERENCIA[tipoCosto] !== undefined) {
    metaFinal = COSTOS_REFERENCIA[tipoCosto];
  } else {
    metaFinal = Math.max(Number(i.costoUniversidad) || 0, 0);
  }

  // Validaciones
  if (edadActual < 0 || edadActual >= 18) {
    return {
      ahorroPorMes: 0,
      metaFinal,
      mesesRestantes: 0,
      totalAportado: 0,
      interesesGenerados: 0,
      detalle: "La edad del hijo debe estar entre 0 y 17 años.",
    };
  }

  if (tasaAnual < 0 || tasaAnual > 30) {
    return {
      ahorroPorMes: 0,
      metaFinal,
      mesesRestantes: 0,
      totalAportado: 0,
      interesesGenerados: 0,
      detalle: "Ingresá una tasa real anual válida (entre 0% y 30%).",
    };
  }

  if (metaFinal === 0) {
    return {
      ahorroPorMes: 0,
      metaFinal: 0,
      mesesRestantes: (18 - edadActual) * 12,
      totalAportado: 0,
      interesesGenerados: 0,
      detalle: "La meta es USD 0 (ej: UBA gratuita). No necesitás ahorro específico para aranceles.",
    };
  }

  // Meses disponibles hasta los 18 años
  const mesesRestantes = (18 - edadActual) * 12;

  // Tasa mensual equivalente: (1 + tasa_anual)^(1/12) - 1
  const r = Math.pow(1 + tasaAnual / 100, 1 / 12) - 1;

  // Valor futuro del ahorro ya acumulado
  const fvAhorroActual = ahorroActual * Math.pow(1 + r, mesesRestantes);

  // Meta restante a cubrir con aportes mensuales
  const metaRestante = metaFinal - fvAhorroActual;

  let ahorroPorMes: number;
  let totalAportado: number;
  let interesesGenerados: number;

  if (metaRestante <= 0) {
    // El ahorro actual ya es suficiente
    ahorroPorMes = 0;
    totalAportado = ahorroActual;
    interesesGenerados = fvAhorroActual - ahorroActual;
  } else if (r === 0) {
    // Tasa 0%: ahorro lineal simple
    ahorroPorMes = metaRestante / mesesRestantes;
    totalAportado = ahorroActual + ahorroPorMes * mesesRestantes;
    interesesGenerados = 0;
  } else {
    // PMT = Meta_restante * r / ((1 + r)^n - 1)
    const factorAcumulacion = Math.pow(1 + r, mesesRestantes) - 1;
    ahorroPorMes = metaRestante * r / factorAcumulacion;
    totalAportado = ahorroActual + ahorroPorMes * mesesRestantes;
    interesesGenerados = metaFinal - totalAportado;
  }

  // Construir detalle textual
  const aniosRestantes = 18 - edadActual;
  const tasaMensualPct = (r * 100).toFixed(4);
  let detalle: string;

  if (ahorroPorMes === 0) {
    detalle = `Con el ahorro actual de USD ${ahorroActual.toLocaleString("es-AR")} y una tasa del ${tasaAnual}% anual (${tasaMensualPct}% mensual), en ${mesesRestantes} meses llegás a USD ${fvAhorroActual.toFixed(0)}, superando la meta de USD ${metaFinal.toLocaleString("es-AR")}. No necesitás aportes adicionales.`;
  } else {
    detalle = `Horizonte: ${aniosRestantes} años (${mesesRestantes} meses). Tasa real: ${tasaAnual}% anual = ${tasaMensualPct}% mensual. Aportás USD ${ahorroPorMes.toFixed(2)}/mes durante ${mesesRestantes} meses. De tu bolsillo: USD ${(ahorroPorMes * mesesRestantes).toFixed(0)} en cuotas + USD ${ahorroActual} ya ahorrado = USD ${totalAportado.toFixed(0)} total. El interés compuesto aporta los USD ${interesesGenerados.toFixed(0)} restantes.`;
  }

  return {
    ahorroPorMes: Math.max(ahorroPorMes, 0),
    metaFinal,
    mesesRestantes,
    totalAportado: Math.min(totalAportado, metaFinal),
    interesesGenerados: Math.max(interesesGenerados, 0),
    detalle,
  };
}
