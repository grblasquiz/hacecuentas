/** Sección de cable (mm²) según amperaje y distancia (caída de tensión <3%) */
export interface Inputs {
  amperaje: number;
  distancia: number; // metros one-way
  tension?: number; // 220 monofasico, 380 trifasico
  tipoInstalacion?: string; // interior | exterior | enterrado
  caidaMaxPct?: number;
  __lang?: string;
}
export interface Outputs {
  seccionRecomendada: number; // mm²
  seccionCalculada: number;
  caidaReal: number; // %
  caidaVolts: number;
  amperajeMaxCable: number;
  termicaRecomendada: number; // amperes
  resumen: string;
  _insight?: any;
  _chart?: any;
}

// Secciones comerciales (mm²) y capacidad de corriente (A) en instalación interior 220V
const CAPACIDADES: Array<{ seccion: number; amperes: number }> = [
  { seccion: 1.0, amperes: 10 },
  { seccion: 1.5, amperes: 14 },
  { seccion: 2.5, amperes: 21 },
  { seccion: 4.0, amperes: 28 },
  { seccion: 6.0, amperes: 36 },
  { seccion: 10.0, amperes: 50 },
  { seccion: 16.0, amperes: 68 },
  { seccion: 25.0, amperes: 89 },
  { seccion: 35.0, amperes: 110 },
  { seccion: 50.0, amperes: 134 },
  { seccion: 70.0, amperes: 171 },
  { seccion: 95.0, amperes: 207 },
];

const TERMICAS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160];

export function electricidadCableAmperaje(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorAmperaje: 'Ingresá el amperaje',
      errorDistancia: 'Ingresá la distancia en metros',
      errorAlto: 'Amperaje demasiado alto, consultá con electricista',
    },
    en: {
      errorAmperaje: 'Enter the amperage',
      errorDistancia: 'Enter the distance in meters',
      errorAlto: 'Amperage too high, consult an electrician',
    },
  } as const)[__lang];

  const A = Number(i.amperaje);
  const L = Number(i.distancia);
  const V = Number(i.tension) || 220;
  const caidaMax = Number(i.caidaMaxPct) || 3;
  if (!A || A <= 0) throw new Error(T.errorAmperaje);
  if (!L || L <= 0) throw new Error(T.errorDistancia);

  // Fórmula para caída de tensión (monofásico 220V):
  // S (mm²) = (2 × L × A × ρ) / (ΔV)
  // ρ (cobre) = 0.0178 Ω·mm²/m
  // ΔV = V × caidaMax%
  const rho = 0.0178;
  const deltaV = V * (caidaMax / 100);
  const factor = V >= 380 ? Math.sqrt(3) : 2; // trifásico usa √3
  const seccionCalc = (factor * L * A * rho) / deltaV;

  // Buscar sección comercial por caída de tensión Y por capacidad de corriente
  let seccionFinal = 0;
  for (const c of CAPACIDADES) {
    if (c.seccion >= seccionCalc && c.amperes >= A * 1.25) {
      seccionFinal = c.seccion;
      break;
    }
  }
  if (seccionFinal === 0) throw new Error(T.errorAlto);

  // Caída real
  const caidaRealV = (factor * L * A * rho) / seccionFinal;
  const caidaRealPct = (caidaRealV / V) * 100;

  // Capacidad del cable final
  const capCable = CAPACIDADES.find((c) => c.seccion === seccionFinal)?.amperes || 0;

  // Térmica recomendada: justo por encima del amperaje del equipo, por debajo de la capacidad del cable
  let termica = 0;
  for (const t of TERMICAS) {
    if (t >= A && t <= capCable) {
      termica = t;
      break;
    }
  }
  if (!termica) termica = TERMICAS[0];

  const caidaPct = Number(caidaRealPct.toFixed(2));
  // Tono dinámico: la caída real siempre queda bajo el máximo (el cálculo lo garantiza); cerca del tope = neutral.
  const tone = caidaPct <= caidaMax * 0.66 ? 'good' : 'neutral';
  const insight = {
    title: __lang === 'en' ? 'Your cable sizing' : 'El cable que necesitás',
    text: __lang === 'en'
      ? `For **${A} A** running **${L} m** on **${V} V**, a **${seccionFinal} mm²** cable keeps the voltage drop at **${caidaPct}%** (under the ${caidaMax}% limit) and pairs with a **${termica} A** breaker.`
      : `Para **${A} A** a **${L} m** en **${V} V**, un cable de **${seccionFinal} mm²** mantiene la caída de tensión en **${caidaPct}%** (debajo del límite de ${caidaMax}%) y se combina con una térmica de **${termica} A**.`,
    tone,
    icon: '⚡',
  };
  // Gauge: caída de tensión real contra el límite admisible.
  const chart = {
    type: 'scale',
    marker: caidaPct,
    markerLabel: caidaPct + '%',
    min: 0,
    segments: [
      { nombre: __lang === 'en' ? 'Ideal' : 'Ideal', max: Number((caidaMax * 0.66).toFixed(2)), color: '#86efac', colorDark: '#4ade80' },
      { nombre: __lang === 'en' ? 'OK' : 'Aceptable', max: caidaMax, color: '#fde68a', colorDark: '#fbbf24' },
      { nombre: __lang === 'en' ? 'Over limit' : 'Sobre el límite', max: Math.max(caidaMax + 1, Math.ceil(caidaPct) + 1), color: '#fca5a5', colorDark: '#f87171' },
    ],
    ariaLabel: __lang === 'en'
      ? `Voltage drop of ${caidaPct}% against a ${caidaMax}% limit`
      : `Caída de tensión de ${caidaPct}% frente a un límite de ${caidaMax}%`,
  };
  return {
    seccionRecomendada: seccionFinal,
    seccionCalculada: Number(seccionCalc.toFixed(3)),
    caidaReal: caidaPct,
    caidaVolts: Number(caidaRealV.toFixed(2)),
    amperajeMaxCable: capCable,
    termicaRecomendada: termica,
    resumen: __lang === 'en'
      ? `For ${A} A at ${L} m on ${V} V use ${seccionFinal} mm² cable (actual drop ${caidaPct}%) with a ${termica} A circuit breaker.`
      : `Para ${A} A a ${L} m en ${V} V usá cable de ${seccionFinal} mm² (caída real ${caidaPct}%) con térmica de ${termica} A.`,
    _insight: insight,
    _chart: chart,
  };
}
