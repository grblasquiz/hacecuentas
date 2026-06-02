/**
 * Calculadora de transporte público en viaje.
 * Comparativa viaje suelto vs pase semanal por ciudad (USD, 2026).
 */

export interface TransportePublicoViajePresupuestoInputs {
  ciudad: string;
  dias: number;
  viajesPorDia: number;
  personas: number;
}

export interface TransportePublicoViajePresupuestoOutputs {
  costoSuelto: number;
  costoPase: number;
  recomendacion: string;
  ahorro: string;
  _insight?: any;
}

type CiudadData = {
  nombre: string;
  suelto: number;
  paseSemanal: number | null;
  paseDiario: number | null;
};

const CIUDADES: Record<string, CiudadData> = {
  paris: { nombre: 'París', suelto: 2.35, paseSemanal: 33, paseDiario: 9.0 },
  londres: { nombre: 'Londres', suelto: 3.3, paseSemanal: 50, paseDiario: 10.5 },
  nyc: { nombre: 'Nueva York', suelto: 2.9, paseSemanal: 34, paseDiario: 7.5 },
  madrid: { nombre: 'Madrid', suelto: 1.7, paseSemanal: 14, paseDiario: 3.5 },
  barcelona: { nombre: 'Barcelona', suelto: 2.65, paseSemanal: 13, paseDiario: 12.5 },
  roma: { nombre: 'Roma', suelto: 1.6, paseSemanal: 26, paseDiario: 7.5 },
  lisboa: { nombre: 'Lisboa', suelto: 1.7, paseSemanal: 11, paseDiario: 6.8 },
  amsterdam: { nombre: 'Ámsterdam', suelto: 3.8, paseSemanal: 42, paseDiario: 9.5 },
  berlin: { nombre: 'Berlín', suelto: 3.4, paseSemanal: 44, paseDiario: 10.5 },
  tokio: { nombre: 'Tokio', suelto: 1.4, paseSemanal: null, paseDiario: 7.0 },
  cdmx: { nombre: 'CDMX', suelto: 0.3, paseSemanal: null, paseDiario: null },
  buenosaires: { nombre: 'Buenos Aires', suelto: 0.5, paseSemanal: null, paseDiario: null },
};

export function transportePublicoViajePresupuesto(
  inputs: TransportePublicoViajePresupuestoInputs,
): TransportePublicoViajePresupuestoOutputs {
  const c = CIUDADES[inputs.ciudad] ?? CIUDADES.paris;
  const dias = Math.max(1, Number(inputs.dias) || 1);
  const vpd = Math.max(1, Number(inputs.viajesPorDia) || 1);
  const personas = Math.max(1, Number(inputs.personas) || 1);

  const costoSueltoRaw = c.suelto * vpd * dias * personas;
  const costoSuelto = Math.round(costoSueltoRaw * 100) / 100;

  // Calcular mejor opción de pase
  let costoPaseRaw = costoSueltoRaw;
  let tipoPase = 'suelto';

  if (c.paseSemanal) {
    const semanas = Math.ceil(dias / 7);
    const opcionSemanal = c.paseSemanal * semanas * personas;
    if (opcionSemanal < costoPaseRaw) {
      costoPaseRaw = opcionSemanal;
      tipoPase = 'semanal';
    }
  }
  if (c.paseDiario) {
    const opcionDiario = c.paseDiario * dias * personas;
    if (opcionDiario < costoPaseRaw) {
      costoPaseRaw = opcionDiario;
      tipoPase = 'diario';
    }
  }

  const costoPase = Math.round(costoPaseRaw * 100) / 100;
  const ahorroNum = costoSuelto - costoPase;

  let recomendacion = '';
  let ahorro = '';

  if (!c.paseSemanal && !c.paseDiario) {
    recomendacion = `En ${c.nombre} no hay pase ilimitado útil para turistas. Usá tarjeta recargable o viajes sueltos.`;
    ahorro = 'Sin pase disponible.';
    return {
      costoSuelto,
      costoPase: costoSuelto,
      recomendacion,
      ahorro,
      _insight: {
        title: `Sin pase turístico en ${c.nombre}`,
        text: `${vpd} viaje(s)/día durante ${dias} día(s) para ${personas} persona(s) suman **USD ${costoSuelto.toFixed(2)}**. En ${c.nombre} no hay abono ilimitado conveniente: cargá una tarjeta recargable y pagá por viaje.`,
        tone: 'neutral',
        icon: '🚇',
      },
    };
  }

  if (ahorroNum > 1) {
    recomendacion = `Comprá el pase ${tipoPase} — ahorrás USD ${ahorroNum.toFixed(2)}.`;
    ahorro = `Ahorro: USD ${ahorroNum.toFixed(2)} (${((ahorroNum / costoSuelto) * 100).toFixed(0)}%)`;
  } else if (ahorroNum < -1) {
    recomendacion = `Con tu cantidad de viajes, conviene pagar sueltos (el pase te saldría USD ${Math.abs(ahorroNum).toFixed(2)} más caro).`;
    ahorro = 'Sin ahorro con pase.';
  } else {
    recomendacion = `Da casi lo mismo. Si querés flexibilidad, usá viajes sueltos. Si preferís no pensar, sacá el pase ${tipoPase}.`;
    ahorro = 'Diferencia mínima.';
  }

  let insight;
  if (ahorroNum > 1) {
    const pct = Math.round((ahorroNum / costoSuelto) * 100);
    insight = {
      title: `Conviene el pase ${tipoPase}`,
      text: `En ${c.nombre}, pagar sueltos costaría **USD ${costoSuelto.toFixed(2)}**, pero con el pase ${tipoPase} bajás a **USD ${costoPase.toFixed(2)}**: ahorrás **USD ${ahorroNum.toFixed(2)}** (~${pct}%).`,
      tone: 'good',
      icon: '🎟️',
    };
  } else if (ahorroNum < -1) {
    insight = {
      title: 'Mejor pagar por viaje',
      text: `Con ${vpd} viaje(s)/día en ${c.nombre}, los sueltos suman **USD ${costoSuelto.toFixed(2)}** — el pase ${tipoPase} te saldría **USD ${Math.abs(ahorroNum).toFixed(2)}** más caro. No amortizás el abono con tan pocos viajes.`,
      tone: 'warn',
      icon: '🚇',
    };
  } else {
    insight = {
      title: 'Casi indistinto',
      text: `En ${c.nombre} la diferencia entre sueltos (**USD ${costoSuelto.toFixed(2)}**) y el pase ${tipoPase} (**USD ${costoPase.toFixed(2)}**) es mínima. Elegí por comodidad: el pase evita recargar, los sueltos dan flexibilidad.`,
      tone: 'neutral',
      icon: '🚇',
    };
  }

  return {
    costoSuelto,
    costoPase,
    recomendacion,
    ahorro,
    _insight: insight,
  };
}
