/** Mundial 2026: cálculo de horas totales de TV según qué partidos vas a ver. */
export interface Inputs {
  selectFases: string;
  partidosSeleccion: number;
  incluirPrevia: string;
}

export interface Outputs {
  horasFutbol: number;
  horasTotalesConPrevia: number;
  diasEquivalentes: number;
  partidosVistos: number;
  prorrogasEstimadas: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

// Constantes Mundial 2026 (formato 48 equipos = 104 partidos).
const PARTIDOS_TOTALES = 104;
const PARTIDOS_GRUPOS = 72;
const PARTIDOS_DIECISEISAVOS = 16;
const PARTIDOS_OCTAVOS = 8;
const PARTIDOS_CUARTOS = 4;
const PARTIDOS_SEMIS = 2;
const PARTIDOS_3ER_FINAL = 2;

// Minutos por partido (90 reglamentarios + ~12 tiempo agregado = ~102 min).
const MIN_PARTIDO = 102;
const MIN_PRORROGA = 35; // 30 reglamentarios + 5 agregado promedio.
const MIN_PENALES = 18;
const MIN_PREVIA_POST = 60; // ~1 hora total previa + post si los ves.

// Tasa de prórroga estimada por fase (basado en histórico Mundiales 2014-2022).
const PRORROGA_RATE: Record<string, number> = {
  dieciseisavos: 0.25,
  octavos: 0.30,
  cuartos: 0.40,
  semis: 0.50,
  final: 0.50,
};

// ~50% de los partidos con prórroga van a penales.
const PENALES_RATE = 0.50;

function partidosEliminatoriaAcumulados(partidosSeleccion: number): { partidos: number; prorrogas: number } {
  // Partidos de mi selección hasta donde llegue.
  // grupos = 3, +dieciseisavos = 4, +octavos = 5, +cuartos = 6, +semis = 7, +final/3er = 8.
  const limit = Math.max(3, Math.min(8, partidosSeleccion));
  let prorrogas = 0;
  // Prórrogas estimadas en los partidos eliminatorios que juega.
  if (limit >= 4) prorrogas += PRORROGA_RATE.dieciseisavos;
  if (limit >= 5) prorrogas += PRORROGA_RATE.octavos;
  if (limit >= 6) prorrogas += PRORROGA_RATE.cuartos;
  if (limit >= 7) prorrogas += PRORROGA_RATE.semis;
  if (limit >= 8) prorrogas += PRORROGA_RATE.final;
  return { partidos: limit, prorrogas };
}

export function mundial2026HorasTvCronogramaFan(i: Inputs): Outputs {
  const modo = String(i.selectFases || 'todos').toLowerCase();
  const partidosSel = Math.max(3, Math.min(8, Math.floor(Number(i.partidosSeleccion || 3))));
  const incluirPrev = String(i.incluirPrevia || 'no').toLowerCase() === 'si';

  let partidos = 0;
  let prorrogas = 0;

  if (modo === 'todos') {
    partidos = PARTIDOS_TOTALES;
    prorrogas =
      PARTIDOS_DIECISEISAVOS * PRORROGA_RATE.dieciseisavos +
      PARTIDOS_OCTAVOS * PRORROGA_RATE.octavos +
      PARTIDOS_CUARTOS * PRORROGA_RATE.cuartos +
      PARTIDOS_SEMIS * PRORROGA_RATE.semis +
      1 * PRORROGA_RATE.final; // solo la final, el 3er puesto rara vez va a prórroga.
  } else if (modo === 'grupos_seleccion') {
    // Veo todos los grupos + toda mi selección (que ya está en grupos: contado 1 vez).
    const sel = partidosEliminatoriaAcumulados(partidosSel);
    partidos = PARTIDOS_GRUPOS + Math.max(0, sel.partidos - 3); // suma solo los eliminatorios extra de mi selección.
    prorrogas = sel.prorrogas;
  } else if (modo === 'eliminatoria') {
    partidos = PARTIDOS_DIECISEISAVOS + PARTIDOS_OCTAVOS + PARTIDOS_CUARTOS + PARTIDOS_SEMIS + PARTIDOS_3ER_FINAL;
    prorrogas =
      PARTIDOS_DIECISEISAVOS * PRORROGA_RATE.dieciseisavos +
      PARTIDOS_OCTAVOS * PRORROGA_RATE.octavos +
      PARTIDOS_CUARTOS * PRORROGA_RATE.cuartos +
      PARTIDOS_SEMIS * PRORROGA_RATE.semis +
      1 * PRORROGA_RATE.final;
  } else if (modo === 'fases_finales') {
    // Solo cuartos en adelante.
    partidos = PARTIDOS_CUARTOS + PARTIDOS_SEMIS + PARTIDOS_3ER_FINAL;
    prorrogas =
      PARTIDOS_CUARTOS * PRORROGA_RATE.cuartos +
      PARTIDOS_SEMIS * PRORROGA_RATE.semis +
      1 * PRORROGA_RATE.final;
  } else if (modo === 'personalizado') {
    // Mix: ~50% partidos grupos + toda mi selección eliminatoria.
    const sel = partidosEliminatoriaAcumulados(partidosSel);
    partidos = Math.round(PARTIDOS_GRUPOS * 0.5) + Math.max(0, sel.partidos - 3);
    prorrogas = sel.prorrogas;
  } else {
    throw new Error('Modo de selección inválido.');
  }

  const prorrogasInt = Math.round(prorrogas);
  const penalesEst = Math.round(prorrogas * PENALES_RATE);

  // Minutos totales.
  const minFutbol = partidos * MIN_PARTIDO + prorrogas * MIN_PRORROGA + penalesEst * MIN_PENALES;
  const minPrevias = incluirPrev ? partidos * MIN_PREVIA_POST : 0;
  // Descanso entretiempo de cada partido (15 min).
  const minDescansos = partidos * 15;

  const horasFutbol = Math.round((minFutbol / 60) * 10) / 10;
  const horasTotales = Math.round(((minFutbol + minPrevias + minDescansos) / 60) * 10) / 10;
  const dias = Math.round((horasTotales / 24) * 10) / 10;

  let modoLabel = '';
  switch (modo) {
    case 'todos': modoLabel = 'todos los 104 partidos'; break;
    case 'grupos_seleccion': modoLabel = `los 72 partidos de grupos + mi selección (~${partidosSel} partidos totales)`; break;
    case 'eliminatoria': modoLabel = 'solo eliminatoria (32 partidos desde dieciseisavos)'; break;
    case 'fases_finales': modoLabel = 'solo cuartos, semis, 3er puesto y final (7 partidos)'; break;
    case 'personalizado': modoLabel = `mix: 50% de grupos + mi selección hasta donde llegue (${partidosSel} partidos)`; break;
  }

  const resumen = `Si ves **${modoLabel}**: total **${partidos} partidos**, ~**${horasFutbol} hs** de fútbol activo${incluirPrev ? ' + previas/post' : ''}, **${horasTotales} hs totales** = **${dias} días pantalla** (24h equivalentes). Prórrogas esperadas: ~${prorrogasInt} partidos. Definiciones por penales esperadas: ~${penalesEst}. ${incluirPrev ? 'Estás sumando ~1 hora de previa/post por partido.' : 'Si sumás previas/post, agregale ~' + Math.round((partidos * MIN_PREVIA_POST) / 60) + ' hs más.'}`;

  // Componentes en horas (1 decimal). Suman el total mostrado en el donut.
  const hFutbol = Math.round((minFutbol / 60) * 10) / 10;
  const hDescansos = Math.round((minDescansos / 60) * 10) / 10;
  const hPrevias = Math.round((minPrevias / 60) * 10) / 10;
  const totalDonut = Math.round((hFutbol + hDescansos + hPrevias) * 10) / 10;
  const slices = [
    { label: 'Fútbol activo', value: hFutbol },
    { label: 'Entretiempos (15 min/partido)', value: hDescansos },
  ];
  if (incluirPrev) slices.push({ label: 'Previa + post', value: hPrevias });

  const insight = {
    title: dias >= 5 ? 'Esto es una maratón de Mundial' : 'Tu plan de Mundial frente a la tele',
    text: `Ver **${modoLabel}** te lleva **${horasTotales} hs** de pantalla — unos **${dias} días** seguidos de 24 h. De eso, **${horasFutbol} hs** son fútbol puro${incluirPrev ? ' y el resto entretiempos más previa/post' : ' (el resto son entretiempos)'}. Prepará ~${prorrogasInt} prórroga(s) y ~${penalesEst} tanda(s) de penales para sufrir.`,
    tone: dias >= 5 ? 'warn' : 'neutral',
    icon: '📺',
  };

  return {
    horasFutbol,
    horasTotalesConPrevia: horasTotales,
    diasEquivalentes: dias,
    partidosVistos: partidos,
    prorrogasEstimadas: prorrogasInt,
    resumen,
    _insight: insight,
    _chart: {
      type: 'doughnut',
      slices,
      suffix: ' hs',
      centerValue: `${totalDonut} hs`,
      centerLabel: 'frente a la tele',
      ariaLabel: `Desglose de las ${totalDonut} horas de pantalla: ${hFutbol} hs de fútbol y ${hDescansos} hs de entretiempos${incluirPrev ? ` más ${hPrevias} hs de previa y post` : ''}`,
    },
  };
}
