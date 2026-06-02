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
  _insight?: any;
  _chart?: any;
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

  const zonaDirecta = pts > pts15;
  const zonaPlayoff = pts > pts16 && pts <= pts15;
  const _insight = {
    title: zonaDirecta ? 'Salvado directo, por ahora' : zonaPlayoff ? 'Estás en zona de Relegationsplayoff' : 'Estás en descenso directo',
    text: `Con **${pts} pts** y **${fechas} ${fechas === 1 ? 'fecha' : 'fechas'}** restantes (techo **${puntosMaxPosibles} pts**), ${zonaDirecta ? `superás al 15º por **${pts - pts15}** y zafás del playoff.` : zonaPlayoff ? `estás arriba del 16º pero abajo del 15º: te faltan **${puntosParaEvitarPlayoff}** para evitar el playoff de promoción.` : `necesitás **${puntosParaSalvarsePlayoff}** ${puntosParaSalvarsePlayoff === 1 ? 'punto' : 'puntos'} solo para alcanzar al 16º y meterte en el playoff.`}`,
    tone: zonaDirecta ? 'good' : zonaPlayoff ? 'neutral' : 'warn',
    icon: '🇩🇪',
  };
  const segDirecto = Math.max(1, pts16);
  const segPlayoff = Math.max(segDirecto + 1, pts15);
  const topMax = Math.max(segPlayoff + 1, pts, pts15) + 6;
  const _chart = {
    type: 'scale',
    marker: pts,
    markerLabel: `${pts} pts`,
    min: 0,
    segments: [
      { nombre: 'Descenso directo', max: segDirecto, color: '#ef4444', colorDark: '#f87171' },
      { nombre: 'Playoff', max: segPlayoff, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Salvado directo', max: topMax, color: '#22c55e', colorDark: '#4ade80' },
    ],
    ariaLabel: `Puntos del equipo (${pts}) frente al 16º (${pts16}) y el 15º (${pts15})`,
  };

  return {
    puntosParaSalvarsePlayoff,
    puntosParaEvitarPlayoff,
    puntosMaxPosibles,
    puntosEsperadosFinal,
    veredicto,
    _insight,
    _chart,
  };
}
