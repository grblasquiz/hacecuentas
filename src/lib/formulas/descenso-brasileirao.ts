/**
 * Descenso Brasileirão Série A. 20 equipos, 4 descienden (17º-20º).
 * Temporada regular 38 fechas.
 */

export interface DescensoBrasileiraoInputs {
  puntosEquipo: number;
  puntosDecimoSexto: number; // 16º (último salvado)
  fechasRestantes: number;
  safetyThreshold?: number; // default 45
}

export interface DescensoBrasileiraoOutputs {
  puntosParaAlcanzar16: number;
  puntosMaxPosibles: number;
  puntosEsperadosFinal: number;
  diferenciaConSafety: number;
  veredicto: string;
  _insight?: any;
  _chart?: any;
}

export function descensoBrasileirao(inputs: DescensoBrasileiraoInputs): DescensoBrasileiraoOutputs {
  const pts = Number(inputs.puntosEquipo) || 0;
  const pts16 = Number(inputs.puntosDecimoSexto) || 0;
  const fechas = Math.max(0, Number(inputs.fechasRestantes) || 0);
  const safety = Number(inputs.safetyThreshold) || 45;

  const fechasJugadas = Math.max(1, 38 - fechas);
  const proyeccion = pts / fechasJugadas;
  const puntosEsperadosFinal = Math.round(proyeccion * 38);

  const puntosParaAlcanzar16 = Math.max(0, pts16 - pts + 1);
  const puntosMaxPosibles = pts + fechas * 3;
  const diferenciaConSafety = pts - safety;

  let veredicto = '';
  if (puntosMaxPosibles < pts16) {
    veredicto = '🔴 Rebaixado matematicamente: imposible alcanzar al 16º.';
  } else if (pts >= safety && pts > pts16) {
    veredicto = '✅ Salvación: cruzaste los 45 puntos, umbral histórico.';
  } else if (puntosEsperadosFinal >= safety) {
    veredicto = '🟢 Ritmo seguro: al paso actual te salvás.';
  } else if (puntosParaAlcanzar16 > fechas * 3 * 0.6) {
    veredicto = '⚠️ Crítico: necesitás ganar casi todo.';
  } else if (puntosParaAlcanzar16 > fechas) {
    veredicto = '🟠 Complicado: varios triunfos seguidos.';
  } else {
    veredicto = '🟡 Depende de vos: 2-3 triunfos alcanzan.';
  }

  const enZona = pts <= pts16;
  const _insight = {
    title: enZona ? 'Estás en zona de descenso' : 'Tu situación en la tabla',
    text: `Con **${pts} pts** y **${fechas} ${fechas === 1 ? 'fecha' : 'fechas'}** por jugar, tu techo es **${puntosMaxPosibles} pts**. ${enZona ? `Estás **${pts16 - pts} ${pts16 - pts === 1 ? 'punto' : 'puntos'}** por debajo del 16º: necesitás **${puntosParaAlcanzar16}** para salir del Z4.` : `Estás arriba del 16º y ${diferenciaConSafety >= 0 ? `ya cruzaste los ${safety} pts del umbral histórico de salvación.` : `te faltan **${safety - pts}** para los ${safety} pts que históricamente salvan.`}`}`,
    tone: enZona ? 'warn' : (diferenciaConSafety >= 0 ? 'good' : 'neutral'),
    icon: '🇧🇷',
  };
  const topMax = Math.max(safety, pts, pts16) + 6;
  const segDescenso = Math.max(1, pts16);
  const segLucha = Math.max(segDescenso + 1, safety);
  const _chart = {
    type: 'scale',
    marker: pts,
    markerLabel: `${pts} pts`,
    min: 0,
    segments: [
      { nombre: 'Zona de descenso', max: segDescenso, color: '#ef4444', colorDark: '#f87171' },
      { nombre: 'Pelea por zafar', max: segLucha, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Salvación', max: Math.max(segLucha + 1, topMax), color: '#22c55e', colorDark: '#4ade80' },
    ],
    ariaLabel: `Puntos del equipo (${pts}) frente al 16º (${pts16}) y el umbral de salvación (${safety})`,
  };

  return {
    puntosParaAlcanzar16,
    puntosMaxPosibles,
    puntosEsperadosFinal,
    diferenciaConSafety,
    veredicto,
    _insight,
    _chart,
  };
}
