/** Sección de cable (mm²) según amperaje y distancia (caída de tensión <3%) */
export interface Inputs {
  amperaje: number;
  distancia: number; // metros one-way
  tension?: number; // 220 monofasico, 380 trifasico
  tipoInstalacion?: string; // interior | exterior | enterrado
  caidaMaxPct?: number;
}
export interface Outputs {
  seccionRecomendada: number; // mm²
  seccionCalculada: number;
  caidaReal: number; // %
  caidaVolts: number;
  amperajeMaxCable: number;
  termicaRecomendada: number; // amperes
  resumen: string;
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
  const A = Number(i.amperaje);
  const L = Number(i.distancia);
  const V = Number(i.tension) || 220;
  const caidaMax = Number(i.caidaMaxPct) || 3;
  if (!A || A <= 0) throw new Error('Ingresá el amperaje');
  if (!L || L <= 0) throw new Error('Ingresá la distancia en metros');

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
  if (seccionFinal === 0) throw new Error('Amperaje demasiado alto, consultá con electricista');

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

  return {
    seccionRecomendada: seccionFinal,
    seccionCalculada: Number(seccionCalc.toFixed(3)),
    caidaReal: Number(caidaRealPct.toFixed(2)),
    caidaVolts: Number(caidaRealV.toFixed(2)),
    amperajeMaxCable: capCable,
    termicaRecomendada: termica,
    resumen: `Para ${A} A a ${L} m en ${V} V usá cable de ${seccionFinal} mm² (caída real ${caidaRealPct.toFixed(2)}%) con térmica de ${termica} A.`,
  };
}
