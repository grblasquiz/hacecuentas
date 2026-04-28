export interface Inputs {
  edad_trabajador: number;
  perfil_riesgo: string;
  saldo_actual_afp: number;
  aporte_mensual: number;
}

export interface Outputs {
  fondo_recomendado: string;
  rentabilidad_historica_5_anos: number;
  rentabilidad_historica_10_anos: number;
  saldo_proyectado_jubilacion: number;
  traslados_permitidos: number;
  observacion: string;
}

export function compute(i: Inputs): Outputs {
  // Datos rentabilidad histórica SII 2026 (% anual real)
  const rentabilidades: Record<string, { cinco: number; diez: number }> = {
    A: { cinco: 6.8, diez: 7.2 },
    B: { cinco: 6.1, diez: 6.5 },
    C: { cinco: 5.8, diez: 5.9 },
    D: { cinco: 4.5, diez: 4.8 },
    E: { cinco: 3.2, diez: 3.5 },
  };

  // Regla de recomendación por edad (SII normativa)
  let fondoRecomendado = i.perfil_riesgo;
  if (i.edad_trabajador < 40) {
    if (!["A", "B"].includes(i.perfil_riesgo)) {
      fondoRecomendado = "A";
    }
  } else if (i.edad_trabajador >= 40 && i.edad_trabajador < 55) {
    if (!["B", "C", "D"].includes(i.perfil_riesgo)) {
      fondoRecomendado = "C";
    }
  } else if (i.edad_trabajador >= 55) {
    if (!["D", "E"].includes(i.perfil_riesgo)) {
      fondoRecomendado = "D";
    }
  }

  const rentHist = rentabilidades[fondoRecomendado] || rentabilidades["C"];
  const rentAnualDecimal = rentHist.cinco / 100;

  // Proyección a jubilación (67 años)
  const edadJubilacion = 67;
  const anosHastajubilacion = Math.max(0, edadJubilacion - i.edad_trabajador);

  let saldoProyectado = i.saldo_actual_afp;
  if (anosHastajubilacion > 0) {
    // Interés compuesto saldo actual
    saldoProyectado = i.saldo_actual_afp * Math.pow(1 + rentAnualDecimal, anosHastajubilacion);
    // Suma aportes mensuales (12 veces/año, compuestos)
    const tasaMensual = Math.pow(1 + rentAnualDecimal, 1 / 12) - 1;
    const meses = anosHastajubilacion * 12;
    const sumaAportes = i.aporte_mensual * (Math.pow(1 + tasaMensual, meses) - 1) / tasaMensual;
    saldoProyectado += sumaAportes;
  }

  // Traslados sin costo (SII 2026: máx 2/año)
  const trasladosPermitidos = 2;

  // Observación según rentabilidad
  let observacion = "";
  const ipcPlus2 = 4.2; // Aproximado IPC 2026 + 2% (meta SII)
  if (rentHist.diez > ipcPlus2) {
    observacion = `Rentabilidad ${rentHist.diez.toFixed(1)}% supera meta SII (IPC+2%). Evaluación recomendada a los ${Math.min(i.edad_trabajador + 5, 55)} años.`;
  } else {
    observacion = `Rentabilidad ${rentHist.diez.toFixed(1)}% moderada. Fondos A/B ofrecen mayor potencial a largo plazo.`;
  }

  return {
    fondo_recomendado: `Fondo ${fondoRecomendado}`,
    rentabilidad_historica_5_anos: rentHist.cinco,
    rentabilidad_historica_10_anos: rentHist.diez,
    saldo_proyectado_jubilacion: Math.round(saldoProyectado),
    traslados_permitidos: trasladosPermitidos,
    observacion: observacion,
  };
}
