export interface SubeInputs {
  diasViajeMes: number;
  recorridosPorDia: number;
  tramo1: string;
  tramo2: string;
  tramo3: string;
  perfilTarifario: 'registrada' | 'sin_registrar' | 'tarifa_social' | 'cud';
  usarRedSube: 'si' | 'no';
  saldoActual: number;
  margenExtra: number;
}

export interface SubeOutputs {
  costoPorRecorrido: number;
  gastoDiario: number;
  gastoMensual: number;
  cargaRecomendada: number;
  ahorroMensual: number;
  viajesMensuales: number;
  diasCubiertos: number;
  detalle: string;
  _insight?: {
    title: string;
    text: string;
    tone: 'good' | 'warn' | 'neutral';
    icon: string;
  };
}

type Fare = {
  label: string;
  registered: number;
  unregistered: number;
  redEligible: boolean;
  socialEligible: boolean;
  cudEligible: boolean;
  isPbaBus?: boolean;
};

const JULY_2026_FARES: Record<string, Fare> = {
  ninguno: { label: 'Sin tercer tramo', registered: 0, unregistered: 0, redEligible: false, socialEligible: false, cudEligible: false },

  nacional_0_3: { label: 'Colectivo nacional · 0 a 3 km', registered: 742.81, unregistered: 1485.62, redEligible: true, socialEligible: true, cudEligible: true },
  nacional_3_6: { label: 'Colectivo nacional · 3 a 6 km', registered: 861.66, unregistered: 1723.32, redEligible: true, socialEligible: true, cudEligible: true },
  nacional_6_12: { label: 'Colectivo nacional · 6 a 12 km', registered: 1002.8, unregistered: 2005.6, redEligible: true, socialEligible: true, cudEligible: true },
  nacional_12_27: { label: 'Colectivo nacional · 12 a 27 km', registered: 1151.36, unregistered: 2302.72, redEligible: true, socialEligible: true, cudEligible: true },
  nacional_27_mas: { label: 'Colectivo nacional · más de 27 km', registered: 1337.06, unregistered: 2674.12, redEligible: true, socialEligible: true, cudEligible: true },

  caba_0_3: { label: 'Colectivo CABA · 0 a 3 km', registered: 820.99, unregistered: 1305.37, redEligible: true, socialEligible: true, cudEligible: false },
  caba_3_6: { label: 'Colectivo CABA · 3 a 6 km', registered: 912.25, unregistered: 1450.48, redEligible: true, socialEligible: true, cudEligible: false },
  caba_6_12: { label: 'Colectivo CABA · 6 a 12 km', registered: 982.52, unregistered: 1562.21, redEligible: true, socialEligible: true, cudEligible: false },
  caba_12_27: { label: 'Colectivo CABA · 12 a 27 km', registered: 1052.85, unregistered: 1674.03, redEligible: true, socialEligible: true, cudEligible: false },

  pba_0_3: { label: 'Colectivo PBA · 0 a 3 km', registered: 1063.98, unregistered: 2127.96, redEligible: false, socialEligible: true, cudEligible: false, isPbaBus: true },
  pba_3_6: { label: 'Colectivo PBA · 3 a 6 km', registered: 1196.97, unregistered: 2393.94, redEligible: false, socialEligible: true, cudEligible: false, isPbaBus: true },
  pba_6_12: { label: 'Colectivo PBA · 6 a 12 km', registered: 1329.97, unregistered: 2659.94, redEligible: false, socialEligible: true, cudEligible: false, isPbaBus: true },
  pba_12_27: { label: 'Colectivo PBA · 12 a 27 km', registered: 1595.97, unregistered: 3191.94, redEligible: false, socialEligible: true, cudEligible: false, isPbaBus: true },
  pba_27_mas: { label: 'Colectivo PBA · más de 27 km', registered: 1876.33, unregistered: 3752.66, redEligible: false, socialEligible: true, cudEligible: false, isPbaBus: true },

  tren_1: { label: 'Tren AMBA · sección 1', registered: 380, unregistered: 760, redEligible: true, socialEligible: true, cudEligible: true },
  tren_2: { label: 'Tren AMBA · sección 2', registered: 530, unregistered: 1060, redEligible: true, socialEligible: true, cudEligible: true },
  tren_3: { label: 'Tren AMBA · sección 3', registered: 660, unregistered: 1320, redEligible: true, socialEligible: true, cudEligible: true },

  subte: { label: 'Subte', registered: 1621, unregistered: 2528.76, redEligible: true, socialEligible: false, cudEligible: false },
  premetro: { label: 'Premetro', registered: 567.35, unregistered: 885.07, redEligible: true, socialEligible: false, cudEligible: false },
};

const RED_SUBE_DISCOUNT_CAP = 714;

function subteRegisteredFare(monthlySubteTrips: number): number {
  if (monthlySubteTrips >= 41) return 972.6;
  if (monthlySubteTrips >= 31) return 1134.7;
  if (monthlySubteTrips >= 21) return 1296.8;
  return 1621;
}

function getFare(code: string, monthlySubteTrips: number): Fare {
  const fare = JULY_2026_FARES[code];
  if (!fare) throw new Error('Elegí un medio de transporte válido');
  if (code !== 'subte') return fare;
  const registered = subteRegisteredFare(monthlySubteTrips);
  return {
    ...fare,
    registered,
    unregistered: registered * (2528.76 / 1621),
  };
}

function calculateRoute(
  codes: string[],
  profile: SubeInputs['perfilTarifario'],
  useRedSube: boolean,
  monthlySubteTrips: number,
): number {
  let redStage = 0;
  let total = 0;

  for (const code of codes) {
    const fare = getFare(code, monthlySubteTrips);
    if (code === 'ninguno') continue;

    if (profile === 'sin_registrar') {
      total += fare.unregistered;
      continue;
    }

    let price = fare.registered;

    if (useRedSube) {
      if (fare.redEligible) {
        const factor = redStage === 0 ? 1 : redStage === 1 ? 0.5 : 0.25;
        const rawDiscount = price * (1 - factor);
        price -= Math.min(rawDiscount, RED_SUBE_DISCOUNT_CAP);
        redStage += 1;
      } else if (fare.isPbaBus && redStage === 0) {
        // Un colectivo provincial puede iniciar la ventana de dos horas,
        // aunque ese boleto no recibe descuento.
        redStage = 1;
      }
    }

    if (profile === 'tarifa_social' && fare.socialEligible) {
      price *= 0.45;
    }
    if (profile === 'cud' && fare.cudEligible) {
      price = 0;
    }

    total += price;
  }

  return total;
}

export function gastoTarjetaSubeMensual(inputs: SubeInputs): SubeOutputs {
  const days = Number(inputs.diasViajeMes);
  const routesPerDay = Number(inputs.recorridosPorDia);
  const balance = Math.max(0, Number(inputs.saldoActual) || 0);
  const marginPct = Math.max(0, Number(inputs.margenExtra) || 0);
  const profile = inputs.perfilTarifario;
  const codes = [inputs.tramo1, inputs.tramo2, inputs.tramo3].filter(Boolean);

  if (!Number.isFinite(days) || days < 1 || days > 31) throw new Error('Ingresá entre 1 y 31 días de viaje');
  if (!Number.isFinite(routesPerDay) || routesPerDay < 1 || routesPerDay > 10) throw new Error('Ingresá entre 1 y 10 recorridos por día');
  if (!['registrada', 'sin_registrar', 'tarifa_social', 'cud'].includes(profile)) throw new Error('Elegí un perfil tarifario válido');
  if (!codes.length || codes[0] === 'ninguno') throw new Error('Elegí al menos un tramo de viaje');

  const legsPerRoute = codes.filter((code) => code !== 'ninguno').length;
  const monthlyRoutes = days * routesPerDay;
  const monthlyTrips = monthlyRoutes * legsPerRoute;
  const monthlySubteTrips = monthlyRoutes * codes.filter((code) => code === 'subte').length;
  const useRed = inputs.usarRedSube === 'si' && profile !== 'sin_registrar';

  const routeCost = calculateRoute(codes, profile, useRed, monthlySubteTrips);
  const dailyCost = routeCost * routesPerDay;
  const monthlyCost = dailyCost * days;

  const regularRouteCost = calculateRoute(codes, 'registrada', false, monthlySubteTrips);
  const regularMonthlyCost = regularRouteCost * monthlyRoutes;
  const savings = Math.max(0, regularMonthlyCost - monthlyCost);
  const suggestedLoad = Math.max(0, monthlyCost * (1 + marginPct / 100) - balance);
  const coveredDays = dailyCost > 0 ? Math.min(days, balance / dailyCost) : days;

  const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  const profileLabel = {
    registrada: 'SUBE registrada',
    sin_registrar: 'SUBE sin registrar',
    tarifa_social: 'Tarifa Social Federal',
    cud: 'beneficio CUD',
  }[profile];
  const routeLabels = codes
    .filter((code) => code !== 'ninguno')
    .map((code) => getFare(code, monthlySubteTrips).label)
    .join(' + ');

  const detail = `${profileLabel}. Recorrido: ${routeLabels}. ${monthlyRoutes} recorridos y ${monthlyTrips} boletos por mes. Costo por recorrido: ${money.format(routeCost)}. Gasto mensual: ${money.format(monthlyCost)}. Saldo informado: ${money.format(balance)}.`;
  const _insight = monthlyCost === 0
    ? {
        title: 'Tus tramos elegibles quedan cubiertos',
        text: `Con el beneficio CUD, los tramos nacionales y ferroviarios elegibles de este recorrido dan **${money.format(0)}**. Revisá los tramos locales porque pueden tener reglas propias.`,
        tone: 'good' as const,
        icon: '♿',
      }
    : suggestedLoad > 0
      ? {
          title: `Cargá ${money.format(suggestedLoad)}`,
          text: `Para cubrir **${days} días**, ${routesPerDay} recorridos diarios y un margen de **${marginPct}%**, descontando tu saldo actual, necesitás cargar aproximadamente **${money.format(suggestedLoad)}**.`,
          tone: 'neutral' as const,
          icon: '💳',
        }
      : {
          title: 'Tu saldo alcanza para el mes',
          text: `Tu saldo actual cubre el gasto estimado de **${money.format(monthlyCost)}**, incluido el margen elegido.`,
          tone: 'good' as const,
          icon: '✅',
        };

  return {
    costoPorRecorrido: Number(routeCost.toFixed(2)),
    gastoDiario: Number(dailyCost.toFixed(2)),
    gastoMensual: Number(monthlyCost.toFixed(2)),
    cargaRecomendada: Number(suggestedLoad.toFixed(2)),
    ahorroMensual: Number(savings.toFixed(2)),
    viajesMensuales: monthlyTrips,
    diasCubiertos: Number(coveredDays.toFixed(1)),
    detalle: detail,
    _insight,
  };
}
