/** Calculadora de XP y Nivel MMORPG */
export interface Inputs {
  nivelActual: number;
  nivelObjetivo: number;
  xpBase: number;
  exponente: number;
  xpPorHora: number;
}
export interface Outputs {
  xpNecesaria: number;
  horasFarmeo: number;
  diasFarmeo: number;
  mensaje: string;
  _insight?: any;
}

export function experienciaNivelMmorpg(i: Inputs): Outputs {
  const nivelActual = Number(i.nivelActual);
  const nivelObjetivo = Number(i.nivelObjetivo);
  const xpBase = Number(i.xpBase);
  const exp = Number(i.exponente);
  const xpPorHora = Number(i.xpPorHora);

  if (!nivelActual || nivelActual < 1) throw new Error('Ingresá un nivel actual válido');
  if (!nivelObjetivo || nivelObjetivo <= nivelActual) throw new Error('El nivel objetivo debe ser mayor al actual');
  if (!xpBase || xpBase <= 0) throw new Error('Ingresá la XP base');
  if (!exp || exp < 1) throw new Error('Ingresá un exponente válido (1-5)');
  if (!xpPorHora || xpPorHora <= 0) throw new Error('Ingresá tu XP por hora');

  // XP para nivel N = xpBase * N^exponente
  let xpNecesaria = 0;
  for (let lvl = nivelActual; lvl < nivelObjetivo; lvl++) {
    xpNecesaria += xpBase * Math.pow(lvl, exp);
  }

  const horasFarmeo = xpNecesaria / xpPorHora;
  const diasFarmeo = Math.ceil(horasFarmeo / 4);

  const niveles = nivelObjetivo - nivelActual;
  const tone = horasFarmeo > 100 ? 'warn' : horasFarmeo < 20 ? 'good' : 'neutral';

  return {
    xpNecesaria: Math.round(xpNecesaria),
    horasFarmeo: Number(horasFarmeo.toFixed(1)),
    diasFarmeo,
    mensaje: `Del nivel ${nivelActual} al ${nivelObjetivo} necesitás ${Math.round(xpNecesaria).toLocaleString()} XP. A ${xpPorHora.toLocaleString()} XP/hora, son ~${horasFarmeo.toFixed(1)} horas de farmeo.`,
    _insight: {
      title: 'Tu plan de farmeo',
      text: `Subir **${niveles} ${niveles === 1 ? 'nivel' : 'niveles'}** (del ${nivelActual} al ${nivelObjetivo}) son **${Math.round(xpNecesaria).toLocaleString()} XP**: **${horasFarmeo.toFixed(1)} h** netas, o **~${diasFarmeo} ${diasFarmeo === 1 ? 'día' : 'días'}** a 4 h de juego diarias. ${horasFarmeo > 100 ? 'Es un grindeo largo: buscá zonas de mayor XP/hora o un party para acelerar.' : 'Un objetivo alcanzable en pocas sesiones.'}`,
      tone,
      icon: '🎮',
    },
  };
}
