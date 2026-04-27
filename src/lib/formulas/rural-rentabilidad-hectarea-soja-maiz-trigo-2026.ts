export interface Inputs {
  cultivo: string;
  zona: string;
  rendimiento: number;
  precioPizarra: number;
  costoSemilla: number;
  costoFertilizante: number;
  costoFitosanitarios: number;
  costoLabores: number;
  costoFlete: number;
  arrendamiento: number;
  gastoComercializacion: number;
}

export interface Outputs {
  ingresoBruto: number;
  retencion: number;
  tasaRetencion: number;
  ingresoNeto: number;
  costoTotal: number;
  margenBruto: number;
  margenNeto: number;
  rendimientoIndiferencia: number;
  resumen: string;
}

// Alícuotas derechos de exportación vigentes 2026 — Decreto 37/2024 y modificatorias
const ALICUOTAS: Record<string, number> = {
  soja: 0.33,   // 33 % soja (poroto)
  maiz: 0.12,   // 12 % maíz
  trigo: 0.12,  // 12 % trigo
};

// Rendimientos típicos orientativos por zona y cultivo (qq/ha)
// Fuente: INTA / Bolsas de Cereales 2025/26
const RENDIMIENTOS_REF: Record<string, Record<string, number>> = {
  soja:  { nucleo: 35, noa: 30, nea: 23, cuyo: 26, patagonia: 22 },
  maiz:  { nucleo: 95, noa: 75, nea: 57, cuyo: 67, patagonia: 60 },
  trigo: { nucleo: 40, noa: 30, nea: 23, cuyo: 33, patagonia: 36 },
};

export function compute(i: Inputs): Outputs {
  const cultivo = (i.cultivo || "soja").toLowerCase();
  const zona = (i.zona || "nucleo").toLowerCase();
  const rendimiento = Math.max(0, Number(i.rendimiento) || 0);
  const precioPizarra = Math.max(0, Number(i.precioPizarra) || 0);
  const costoSemilla = Math.max(0, Number(i.costoSemilla) || 0);
  const costoFertilizante = Math.max(0, Number(i.costoFertilizante) || 0);
  const costoFitosanitarios = Math.max(0, Number(i.costoFitosanitarios) || 0);
  const costoLabores = Math.max(0, Number(i.costoLabores) || 0);
  const costoFlete = Math.max(0, Number(i.costoFlete) || 0);
  const arrendamiento = Math.max(0, Number(i.arrendamiento) || 0);
  const pctComercializacion = Math.min(100, Math.max(0, Number(i.gastoComercializacion) || 0)) / 100;

  // Validaciones básicas
  if (rendimiento <= 0 || precioPizarra <= 0) {
    return {
      ingresoBruto: 0,
      retencion: 0,
      tasaRetencion: 0,
      ingresoNeto: 0,
      costoTotal: 0,
      margenBruto: 0,
      margenNeto: 0,
      rendimientoIndiferencia: 0,
      resumen: "Ingresá rendimiento y precio pizarra mayores a cero para calcular.",
    };
  }

  const alicuota = ALICUOTAS[cultivo] ?? 0.12;

  // 1. Ingreso bruto
  const ingresoBruto = rendimiento * precioPizarra;

  // 2. Retenciones (derechos de exportación)
  const retencion = ingresoBruto * alicuota;

  // 3. Ingreso neto tras retenciones
  const ingresoNetoRetencion = ingresoBruto - retencion;

  // 4. Gasto de comercialización sobre ingreso neto
  const gastoComercial = ingresoNetoRetencion * pctComercializacion;

  // 5. Costo directo total
  const costoDirecto = costoSemilla + costoFertilizante + costoFitosanitarios + costoLabores + costoFlete + gastoComercial;

  // 6. Margen bruto (sin arrendamiento)
  const margenBruto = ingresoNetoRetencion - costoDirecto;

  // 7. Margen neto (tras arrendamiento)
  const margenNeto = margenBruto - arrendamiento;

  // 8. Rendimiento de indiferencia:
  //    Precio efectivo productor por qq = precioPizarra * (1 - alicuota)
  //    Costo a cubrir = costoDirecto (sin comercialización, que es % del ingreso)
  //    => rendimiento_ind = costoDirecto_fijo / (precioPizarra * (1 - alicuota) * (1 - pctComercializacion))
  const precioEfectivo = precioPizarra * (1 - alicuota) * (1 - pctComercializacion);
  const costoFijoSinArrendamiento = costoSemilla + costoFertilizante + costoFitosanitarios + costoLabores + costoFlete;
  const costoFijoConArrendamiento = costoFijoSinArrendamiento + arrendamiento;

  const rendimientoIndSinArr = precioEfectivo > 0 ? costoFijoSinArrendamiento / precioEfectivo : 0;
  const rendimientoIndConArr = precioEfectivo > 0 ? costoFijoConArrendamiento / precioEfectivo : 0;

  // Referencia de rendimiento típico de la zona
  const rendRef = RENDIMIENTOS_REF[cultivo]?.[zona] ?? rendimiento;

  // Construir resumen
  const cultivoLabel = cultivo.charAt(0).toUpperCase() + cultivo.slice(1);
  const zonaLabel: Record<string, string> = {
    nucleo: "Zona Núcleo",
    noa: "NOA",
    nea: "NEA",
    cuyo: "Cuyo",
    patagonia: "Patagonia",
  };
  const zonaStr = zonaLabel[zona] ?? zona;

  let estadoMargen: string;
  if (margenBruto < 0) {
    estadoMargen = "⚠️ Margen bruto NEGATIVO: los costos directos superan el ingreso neto de retenciones.";
  } else if (margenNeto < 0) {
    estadoMargen = "⚠️ Margen bruto positivo pero margen neto NEGATIVO: el arrendamiento hace inviable la campaña.";
  } else {
    estadoMargen = `✅ Campaña viable. Margen neto: USD ${margenNeto.toFixed(2)}/ha.`;
  }

  const resumen =
    `${cultivoLabel} | ${zonaStr} | Rinde típico zona: ${rendRef} qq/ha.\n` +
    `Retención ${(alicuota * 100).toFixed(0)}%: USD ${retencion.toFixed(2)}/ha.\n` +
    `Costo directo total: USD ${costoDirecto.toFixed(2)}/ha.\n` +
    `Punto de equilibrio (sin arr.): ${rendimientoIndSinArr.toFixed(1)} qq/ha | (con arr.): ${rendimientoIndConArr.toFixed(1)} qq/ha.\n` +
    estadoMargen;

  return {
    ingresoBruto: Math.round(ingresoBruto * 100) / 100,
    retencion: Math.round(retencion * 100) / 100,
    tasaRetencion: alicuota,
    ingresoNeto: Math.round(ingresoNetoRetencion * 100) / 100,
    costoTotal: Math.round(costoDirecto * 100) / 100,
    margenBruto: Math.round(margenBruto * 100) / 100,
    margenNeto: Math.round(margenNeto * 100) / 100,
    rendimientoIndiferencia: Math.round(rendimientoIndConArr * 100) / 100,
    resumen,
  };
}
