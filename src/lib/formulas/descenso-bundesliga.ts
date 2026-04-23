/**
 * Descenso Bundesliga. 18 equipos.
 *   - 17º y 18º: descenso directo.
 *   - 16º: Relegationsplayoff (ida y vuelta) contra el 3º de la 2. Bundesliga.
 *
 * Temporada regular 34 fechas.
 */

export interface DescensoBundesligaInputs {
  puntosEquipo: number;
  puntosDecimoSexto: number; // 16º (el que va a playoff)
  puntosDecimoQuinto: number; // 15º (último salvado directo)
  fechasRestantes: number;
}

export interface DescensoBundesligaOutputs {
  puntosParaSalvarsePlayoff: number; // superar al 16º, zafar del playoff
  puntosParaEvitarPlayoff: number; // superar al 15º
  puntosMaxPosibles: number;
  puntosEsperadosFinal: number;
  veredicto: string;
}

export function descensoBundesliga(inputs: DescensoBundesligaInputs): DescensoBundesligaOutputs {
  const pts = Number(inputs.puntosEquipo) || 0;
  const pts16 = Number(inputs.puntosDecimoSexto) || 0;
  const pts15 = Number(inputs.puntosDecimoQuinto) || 0;
  const fechas = Math.max(0, Number(inputs.fechasRestantes) || 0);

  const fechasJugadas = Math.max(1, 34 - fechas);
  const proyeccion = pts / fechasJugadas;
  const puntosEsperadosFinal = Math.round(proyeccion * 34);

  const puntosParaSalvarsePlayoff = Math.max(0, pts16 - pts + 1);
  const puntosParaEvitarPlayoff = Math.max(0, pts15 - pts + 1);
  const puntosMaxPosibles = pts + fechas * 3;

  let veredicto = '';
  if (puntosMaxPosibles < pts16) {
    veredicto = '🔴 Descendido directo: ni ganando todo alcanzás al 16º.';
  } else if (pts > pts15) {
    veredicto = '✅ Salvado directo: por encima del 15º, sin playoff.';
  } else if (pts > pts16) {
    veredicto = '🟡 Zona playoff: estás arriba del 16º pero abajo del 15º.';
  } else if (puntosParaSalvarsePlayoff > fechas * 3 * 0.6) {
    veredicto = '⚠️ Abstiegsgefahr alta: necesitás ganar casi todo.';
  } else if (puntosParaSalvarsePlayoff > fechas) {
    veredicto = '🟠 Complicado: varios triunfos para zafar del playoff.';
  } else {
    veredicto = '🟡 En tus manos: 2-3 triunfos te sacan de zona playoff.';
  }

  return {
    puntosParaSalvarsePlayoff,
    puntosParaEvitarPlayoff,
    puntosMaxPosibles,
    puntosEsperadosFinal,
    veredicto,
  };
}
