/** Relación potencia/peso y estimación de velocidad máxima.
 *
 *  QUÉ ESTABA MAL: el modelo equilibraba la potencia SÓLO contra el arrastre
 *  aerodinámico —P = ½·ρ·Cd·A·v³— e ignoraba por completo la RESISTENCIA A LA
 *  RODADURA de los neumáticos, que no es despreciable y además es la que fija
 *  el piso de consumo de potencia. Encima el área frontal estaba clavada en
 *  2,2 m² para cualquier vehículo, desde un utilitario chico hasta una pickup.
 *  Resultado: 200 km/h para un 110 HP / 1.200 kg, por encima de lo real.
 *
 *  MODELO CORREGIDO — balance de potencia en velocidad máxima (régimen
 *  estacionario, terreno llano, sin viento):
 *
 *      P_rueda = F_rodadura · v + ½·ρ·Cd·A·v³
 *      F_rodadura = Crr · m · g
 *
 *  Es una cúbica en v; se resuelve numéricamente por bisección (converge
 *  siempre porque el miembro derecho es estrictamente creciente en v > 0).
 *
 *  Crr = 0,012 por defecto: neumático radial de auto de calle sobre asfalto
 *  seco. Rango típico 0,010–0,015 (SAE J2452 / literatura de resistencia a la
 *  rodadura); un neumático de baja resistencia ronda 0,008 y uno de barro 0,02.
 *  g = 9,80665 m/s² (valor exacto, CGPM). ρ_aire = 1,225 kg/m³ (atmósfera
 *  estándar ISA a nivel del mar, 15 °C).
 *
 *  El área frontal pasa a ser parametrizable (2,2 m² sigue siendo el default,
 *  un auto mediano). Referencias de orden: hatchback chico 1,9–2,1; sedán 2,1–2,3;
 *  SUV 2,6–2,9; pickup 3,0–3,3 m².
 */

const G = 9.80665;        // m/s², exacto
const RHO_AIRE = 1.225;   // kg/m³, ISA nivel del mar
const CRR_DEFAULT = 0.012;
const AREA_DEFAULT = 2.2; // m²
const ETA_TRANSMISION = 0.85;
const W_POR_HP = 745.699872; // 1 HP mecánico = 745,699872 W

export interface Inputs {
  potenciaHp: number;
  pesoKg: number;
  coefAerodinamico?: number;
  /** Área frontal en m². Default 2,2 (auto mediano). */
  areaFrontalM2?: number;
  /** Coeficiente de resistencia a la rodadura. Default 0,012 (radial de calle). */
  coefRodadura?: number;
}
export interface Outputs {
  relacionHpTon: number;
  velocidadMaxEstimada: number;
  kgPorHp: number;
  potenciaAerodinamicaPct: number;
  potenciaRodaduraPct: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

/** Resuelve  a·v³ + b·v = P  para v > 0, por bisección. */
function resolverVelocidad(a: number, b: number, P: number): number {
  let lo = 0;
  let hi = 10;
  while (a * hi * hi * hi + b * hi < P && hi < 1e4) hi *= 2;
  for (let n = 0; n < 200; n++) {
    const mid = (lo + hi) / 2;
    if (a * mid * mid * mid + b * mid < P) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

export function velocidadMaximaRelacionPotenciaPeso(i: Inputs): Outputs {
  const hp = Number(i.potenciaHp);
  const peso = Number(i.pesoKg);
  const cdRaw = Number(i.coefAerodinamico);
  const cd = Number.isFinite(cdRaw) && cdRaw > 0 ? cdRaw : 0.30;
  const areaRaw = Number(i.areaFrontalM2);
  const areaFrontal = Number.isFinite(areaRaw) && areaRaw > 0 ? areaRaw : AREA_DEFAULT;
  const crrRaw = Number(i.coefRodadura);
  const crr = Number.isFinite(crrRaw) && crrRaw >= 0 ? crrRaw : CRR_DEFAULT;

  if (!hp || hp <= 0) throw new Error('Ingresá la potencia del motor en HP');
  if (!peso || peso < 300 || peso > 5000) throw new Error('El peso debe estar entre 300 y 5.000 kg');
  if (cd < 0.15 || cd > 0.60) throw new Error('El coeficiente aerodinámico debe estar entre 0.15 y 0.60');
  if (areaFrontal < 1 || areaFrontal > 6) throw new Error('El área frontal debe estar entre 1 y 6 m²');
  if (crr < 0.005 || crr > 0.05) throw new Error('El coeficiente de rodadura debe estar entre 0.005 y 0.05');

  const relacionHpTon = (hp / peso) * 1000;
  const kgPorHp = peso / hp;

  const potenciaW = hp * W_POR_HP * ETA_TRANSMISION; // potencia disponible en rueda
  const a = 0.5 * RHO_AIRE * cd * areaFrontal;       // coeficiente aerodinámico del balance
  const b = crr * peso * G;                          // fuerza de rodadura (N), constante con v

  const vmps = resolverVelocidad(a, b, potenciaW);
  const velocidadMaxEstimada = vmps * 3.6;

  const pAero = a * vmps * vmps * vmps;
  const pRod = b * vmps;
  const potenciaAerodinamicaPct = Number(((pAero / (pAero + pRod)) * 100).toFixed(1));
  const potenciaRodaduraPct = Number(((pRod / (pAero + pRod)) * 100).toFixed(1));

  let categoria = '';
  if (relacionHpTon < 70) categoria = 'Vehículo pesado/lento';
  else if (relacionHpTon < 100) categoria = 'Adecuado para uso diario';
  else if (relacionHpTon < 130) categoria = 'Ágil y equilibrado';
  else if (relacionHpTon < 170) categoria = 'Rápido';
  else if (relacionHpTon < 250) categoria = 'Deportivo';
  else categoria = 'Superdeportivo';

  const ratioRound = Number(relacionHpTon.toFixed(1));
  const chart = {
    type: 'scale' as const,
    marker: ratioRound,
    markerLabel: categoria + ': ' + ratioRound + ' HP/ton',
    min: 0,
    unit: ' HP/ton',
    segments: [
      { nombre: 'Pesado', max: 70, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Diario', max: 100, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Ágil', max: 130, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Rápido', max: 170, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Deportivo', max: 250, color: '#a7f3d0', colorDark: '#065f46' },
      { nombre: 'Superdeportivo', max: Math.max(400, Math.ceil(ratioRound) + 50), color: '#99f6e4', colorDark: '#115e59' },
    ],
    ariaLabel: 'Escala de relación potencia/peso en HP por tonelada: de vehículo pesado a superdeportivo.',
  };

  const insight = {
    title: 'Tu relación potencia/peso',
    text: `Con **${ratioRound} HP por tonelada** (${kgPorHp.toFixed(1)} kg que mueve cada HP), tu vehículo entra en la categoría **${categoria.toLowerCase()}**. La velocidad máxima teórica estimada ronda los **~${Math.round(velocidadMaxEstimada)} km/h** (Cd=${cd}, área frontal ${areaFrontal} m², Crr=${crr}). A esa velocidad el ${potenciaAerodinamicaPct}% de la potencia se va en vencer el aire y el ${potenciaRodaduraPct}% en la rodadura de los neumáticos.`,
    tone: 'neutral',
    icon: '🏎️',
  };

  return {
    relacionHpTon: ratioRound,
    velocidadMaxEstimada: Math.round(velocidadMaxEstimada),
    kgPorHp: Number(kgPorHp.toFixed(2)),
    potenciaAerodinamicaPct,
    potenciaRodaduraPct,
    detalle: `Relación: ${relacionHpTon.toFixed(1)} HP/ton (${kgPorHp.toFixed(1)} kg/HP). Categoría: ${categoria}. Velocidad máxima teórica estimada: ~${Math.round(velocidadMaxEstimada)} km/h (Cd=${cd}, A=${areaFrontal} m², Crr=${crr}, rendimiento de transmisión ${Math.round(ETA_TRANSMISION * 100)}%). Reparto de potencia: ${potenciaAerodinamicaPct}% aerodinámica, ${potenciaRodaduraPct}% rodadura.`,
    _chart: chart,
    _insight: insight,
  };
}
