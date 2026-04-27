export interface Inputs {
  tipo_beneficio: string;
  haber_mensual: number;
  meses_cobro: number;
}

export interface Outputs {
  bono_mensual: number;
  total_con_bono: number;
  acumulado_anual: number;
  porcentaje_refuerzo: number;
  detalle: string;
}

// Parámetros vigentes 2026 — actualizar mensualmente según resoluciones ANSES/decretos PEN
const PARAMETROS_2026: Record<
  string,
  { nombre: string; haberMinimo: number; tope: number; bono: number }
> = {
  jubilacion: {
    nombre: "Jubilación / Pensión contributiva",
    haberMinimo: 326000,
    tope: 326000, // hasta 1 haber mínimo
    bono: 70000,
  },
  puam: {
    nombre: "PUAM (Pensión Universal Adulto Mayor)",
    haberMinimo: 228000,
    tope: 228000,
    bono: 50000,
  },
  auh: {
    nombre: "AUH (Asignación Universal por Hijo)",
    haberMinimo: 75000,
    tope: Infinity, // sin tope de ingresos para AUH
    bono: 25000,
  },
  aue: {
    nombre: "AUE (Asignación Universal por Embarazo)",
    haberMinimo: 75000,
    tope: Infinity,
    bono: 25000,
  },
};

export function compute(i: Inputs): Outputs {
  const tipo = i.tipo_beneficio && PARAMETROS_2026[i.tipo_beneficio]
    ? i.tipo_beneficio
    : "jubilacion";

  const haber = Math.max(0, Number(i.haber_mensual) || 0);
  const meses = Math.min(12, Math.max(1, Math.round(Number(i.meses_cobro) || 12)));

  if (haber <= 0) {
    return {
      bono_mensual: 0,
      total_con_bono: 0,
      acumulado_anual: 0,
      porcentaje_refuerzo: 0,
      detalle: "Ingresá un haber mensual válido mayor a $0.",
    };
  }

  const params = PARAMETROS_2026[tipo];
  const corresponde = haber <= params.tope;
  const bono_mensual = corresponde ? params.bono : 0;
  const total_con_bono = haber + bono_mensual;
  const acumulado_anual = bono_mensual * meses;
  const porcentaje_refuerzo = haber > 0 ? (bono_mensual / haber) * 100 : 0;

  let detalle: string;
  if (!corresponde) {
    detalle = `Tu haber de $${haber.toLocaleString("es-AR")} supera el tope de $${params.tope.toLocaleString("es-AR")} para ${params.nombre}. No te correspondería el bono bajo los criterios vigentes 2026. Verificá el decreto del mes en curso en anses.gob.ar.`;
  } else {
    detalle = `Beneficio: ${params.nombre}. Haber mínimo de referencia: $${params.haberMinimo.toLocaleString("es-AR")} ARS. Tu haber ($${haber.toLocaleString("es-AR")}) no supera el tope, por lo que te correspondería un bono de $${bono_mensual.toLocaleString("es-AR")} ARS mensuales. Acumulado en ${meses} mes${meses !== 1 ? "es" : ""}: $${acumulado_anual.toLocaleString("es-AR")} ARS. Nota: el bono es no remunerativo, no computable para SAC ni movilidad.`;
  }

  return {
    bono_mensual,
    total_con_bono,
    acumulado_anual,
    porcentaje_refuerzo,
    detalle,
  };
}
