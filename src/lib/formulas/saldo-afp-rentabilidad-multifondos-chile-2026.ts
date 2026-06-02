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
  _insight?: any;
  _chart?: any;
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

  const clpFmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const superaMeta = rentHist.diez > ipcPlus2;
  const _insight = anosHastajubilacion > 0
    ? {
        title: `Proyección con Fondo ${fondoRecomendado}`,
        text: `Con una rentabilidad histórica de **${rentHist.diez.toFixed(1)}% anual** a 10 años, tu saldo podría llegar a **${clpFmt(saldoProyectado)}** al jubilarte (en ${anosHastajubilacion} años). ${superaMeta ? 'Supera la meta SII (IPC+2%).' : 'Está por debajo de la meta IPC+2%; un fondo más agresivo podría rendir más a largo plazo.'}`,
        tone: superaMeta ? 'good' : 'warn',
        icon: '🏦',
      }
    : {
        title: `Fondo ${fondoRecomendado}`,
        text: `Ya estás en edad de jubilación: tu saldo actual de **${clpFmt(saldoProyectado)}** no se proyecta más. La rentabilidad histórica del fondo fue **${rentHist.diez.toFixed(1)}% anual**.`,
        tone: 'neutral',
        icon: '🏦',
      };

  // Gauge: rentabilidad histórica 10 años contra la meta SII (IPC+2%)
  const _chart = {
    type: 'scale',
    marker: rentHist.diez,
    markerLabel: `${rentHist.diez.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Baja', max: 3, color: '#f87171', colorDark: '#b91c1c' },
      { nombre: `Bajo meta (IPC+2%)`, max: ipcPlus2, color: '#fbbf24', colorDark: '#b45309' },
      { nombre: 'Supera meta', max: Math.max(8, Math.ceil(rentHist.diez) + 1), color: '#34d399', colorDark: '#047857' },
    ],
    ariaLabel: `Rentabilidad histórica a 10 años del Fondo ${fondoRecomendado}: ${rentHist.diez.toFixed(1)}% anual, contra la meta SII de IPC+2% (${ipcPlus2}%).`,
  };

  return {
    fondo_recomendado: `Fondo ${fondoRecomendado}`,
    rentabilidad_historica_5_anos: rentHist.cinco,
    rentabilidad_historica_10_anos: rentHist.diez,
    saldo_proyectado_jubilacion: Math.round(saldoProyectado),
    traslados_permitidos: trasladosPermitidos,
    observacion: observacion,
    _insight,
    _chart,
  };
}
