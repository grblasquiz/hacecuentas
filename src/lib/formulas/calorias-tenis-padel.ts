/** Calorías quemadas jugando tenis o pádel */
export interface Inputs {
  peso: number;
  deporte: string; // 'tenis-singles' | 'tenis-dobles' | 'padel-recreativo' | 'padel-competitivo'
  minutos: number;
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  deporteMostrado: string;
  equivalenteAlimento: string;
  resumen: string;
  _insight?: any;
}

const MET: Record<string, { met: number; nombre: string }> = {
  // tenis
  'tenis-singles': { met: 8.0, nombre: 'Tenis singles (1 vs 1)' },
  'tenis-dobles': { met: 6.0, nombre: 'Tenis dobles' },
  'tenis-competicion': { met: 10.0, nombre: 'Tenis competición / intenso' },
  'tenis-competitivo': { met: 10.0, nombre: 'Tenis competitivo' },
  'tenis-recreativo': { met: 6.5, nombre: 'Tenis recreativo' },
  // padel
  'padel-recreativo': { met: 6.5, nombre: 'Pádel recreativo' },
  'padel-intermedio': { met: 7.5, nombre: 'Pádel intermedio' },
  'padel-competicion': { met: 8.5, nombre: 'Pádel competición' },
  'padel-competitivo': { met: 8.5, nombre: 'Pádel competición' },
  'padel-dobles': { met: 7.0, nombre: 'Pádel dobles amateur' },
  // otros deportes de raqueta
  'squash': { met: 12.0, nombre: 'Squash' },
  'badminton': { met: 5.5, nombre: 'Bádminton recreativo' },
  'badminton-competicion': { met: 7.0, nombre: 'Bádminton competición' },
};

export function caloriasTenisPadel(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const dep = String(i.deporte || 'tenis-singles');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!min || min <= 0) throw new Error('Ingresá los minutos de juego');

  const info = MET[dep] || MET['tenis-singles'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;
  const totalRounded = Math.round(total);

  // Equivalentes alimentarios aproximados
  // milanesa napolitana ~700kcal, alfajor triple ~280kcal, banana ~90kcal,
  // gaseosa 500ml ~210kcal, hamburguesa con papas ~900kcal, helado bocha ~150kcal
  let equivalenteAlimento = '';
  if (totalRounded < 100) {
    equivalenteAlimento = `${totalRounded} kcal equivalen a una manzana mediana (${totalRounded} kcal).`;
  } else if (totalRounded < 250) {
    const bochas = (totalRounded / 150).toFixed(1);
    equivalenteAlimento = `${totalRounded} kcal equivalen a ${bochas} bochas de helado (~150 kcal c/u) o 1 gaseosa de 500 ml.`;
  } else if (totalRounded < 500) {
    const alfajores = (totalRounded / 280).toFixed(1);
    equivalenteAlimento = `${totalRounded} kcal equivalen a ${alfajores} alfajor triple (~280 kcal c/u) o 2 bananas grandes.`;
  } else if (totalRounded < 800) {
    equivalenteAlimento = `${totalRounded} kcal equivalen a 1 milanesa napolitana (~700 kcal) o 3 alfajores triples.`;
  } else {
    equivalenteAlimento = `${totalRounded} kcal equivalen a 1 hamburguesa completa con papas (~900 kcal) o 1 pizza de muzzarella personal.`;
  }

  const intensidad = info.met >= 8 ? 'vigorosa' : info.met >= 6 ? 'moderada-alta' : 'moderada';
  const _insight = {
    title: 'Lo que dice tu partido',
    text: `Con un MET de **${info.met}** (intensidad ${intensidad}), quemás **${kcalMin.toFixed(1)} kcal por minuto**: ${min} min te dejan en **${totalRounded} kcal**. Una hora de juego sumaría unas **${Math.round(kcalMin * 60)} kcal**.`,
    tone: 'good',
    icon: '🎾',
  };

  return {
    caloriasTotal: totalRounded,
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    deporteMostrado: info.nombre,
    equivalenteAlimento,
    resumen: `Jugando **${info.nombre}** durante ${min} minutos quemás **${totalRounded} kcal** (${kcalMin.toFixed(1)} kcal/min, MET ${info.met}).`,
    _insight,
  };
}
