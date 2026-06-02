/** Comida diaria del conejo: heno, verduras, pellets y agua según peso. */
export interface Inputs {
  pesoKg: number;
  etapa?: string;
  actividad?: string;
  condicion?: string;
}
export interface Outputs {
  henoDiaGr: number;
  verdurasGr: number;
  pelletsGr: number;
  aguaMl: number;
  henoMesKg: number;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function comidaDiariaConejoPeso(i: Inputs): Outputs {
  const peso = Number(i.pesoKg);
  if (!peso || peso <= 0) throw new Error('Ingresá el peso del conejo en kg');

  const etapa = String(i.etapa || 'adulto');
  const act = String(i.actividad || 'media');
  const cond = String(i.condicion || 'normal');

  // Heno mínimo por día: ~40 g/kg
  let heno = peso * 40;

  // Verduras: 100 g/kg adulto; cachorro menos variedad
  let verduras = peso * 100;
  if (etapa === 'cachorro') verduras = peso * 50;

  // Pellets: 25 g/kg adulto base
  let pellets = peso * 25;
  if (etapa === 'cachorro') pellets = peso * 50; // casi libre
  else if (etapa === 'senior') pellets = peso * 20;

  // Ajuste por condición
  if (cond === 'sobrepeso') { pellets *= 0.5; verduras *= 1.1; }
  else if (cond === 'delgado') { pellets *= 1.4; verduras *= 1.0; }

  // Ajuste por actividad
  if (act === 'alta') pellets *= 1.1;
  else if (act === 'baja') pellets *= 0.9;

  // Agua: 100 ml/kg promedio
  const agua = peso * 100;

  const henoMesKg = Math.round((heno * 30 * 1.3) / 1000 * 10) / 10;

  let rec = '';
  if (cond === 'sobrepeso') rec = 'Reducí pellets a la mitad y cortá frutas. Aumentá suelta diaria y heno timothy (no alfalfa).';
  else if (etapa === 'cachorro') rec = 'Alfalfa como heno principal hasta los 6 meses. Pellets casi libres. Introducí verduras de a una.';
  else if (etapa === 'senior') rec = 'Pellets ajustados, heno ilimitado y control veterinario cada 6 meses. Cuidá dentición y peso.';
  else rec = 'Heno ilimitado siempre disponible, rotá al menos 3 verduras por día y limitá pellets a la ración calculada.';

  const henoR = Math.round(heno);
  const verdurasR = Math.round(verduras);
  const pelletsR = Math.round(pellets);
  const totalComida = henoR + verdurasR + pelletsR;
  const pctHeno = Math.round((henoR / totalComida) * 100);

  const tono = cond === 'sobrepeso' ? 'warn' : 'neutral';
  const _insight = {
    title: 'El plato de tu conejo',
    text: `Un conejo de **${peso} kg** necesita por día **${henoR} g de heno**, **${verdurasR} g de verduras** y **${pelletsR} g de pellets**, más **${Math.round(agua)} ml de agua** fresca. El heno es ~**${pctHeno}%** de la comida y tiene que estar siempre disponible: es clave para sus dientes y digestión. ${cond === 'sobrepeso' ? 'Como está con sobrepeso, los pellets van reducidos: priorizá heno y movimiento.' : `Vas a usar cerca de **${henoMesKg} kg de heno al mes**.`}`,
    tone: tono,
    icon: '🐰',
  };

  // Donut: composición del plato diario (heno + verduras + pellets = total, sin agua)
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Heno', value: henoR },
      { label: 'Verduras', value: verdurasR },
      { label: 'Pellets', value: pelletsR },
    ],
    prefix: '',
    centerValue: `${totalComida} g`,
    centerLabel: 'comida/día',
    ariaLabel: `Comida diaria de ${totalComida} gramos: ${henoR} de heno, ${verdurasR} de verduras y ${pelletsR} de pellets`,
  };

  return {
    henoDiaGr: henoR,
    verdurasGr: verdurasR,
    pelletsGr: pelletsR,
    aguaMl: Math.round(agua),
    henoMesKg,
    recomendacion: rec,
    _insight,
    _chart,
  };
}
