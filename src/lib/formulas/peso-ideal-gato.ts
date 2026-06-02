/** Peso ideal del gato según raza y contextura */
export interface Inputs {
  raza?: string;
  contextura?: string; // pequena | mediana | grande
  sexo?: string; // macho | hembra
}
export interface Outputs {
  pesoIdealMin: number;
  pesoIdealMax: number;
  pesoPromedio: number;
  raza: string;
  contextura: string;
  esperanzaAnios: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

interface RazaInfo { nombre: string; minM: number; maxM: number; minH: number; maxH: number; vida: number }

const RAZAS: Record<string, RazaInfo> = {
  comun_europeo: { nombre: 'Común europeo/mestizo', minM: 4, maxM: 6, minH: 3, maxH: 5, vida: 15 },
  siames: { nombre: 'Siamés', minM: 3.5, maxM: 5.5, minH: 2.5, maxH: 4.5, vida: 16 },
  persa: { nombre: 'Persa', minM: 4, maxM: 7, minH: 3, maxH: 5, vida: 14 },
  maine_coon: { nombre: 'Maine Coon', minM: 6, maxM: 11, minH: 4, maxH: 7, vida: 13 },
  ragdoll: { nombre: 'Ragdoll', minM: 5, maxM: 9, minH: 4, maxH: 6.5, vida: 14 },
  bengali: { nombre: 'Bengalí', minM: 4.5, maxM: 7, minH: 3.5, maxH: 5.5, vida: 15 },
  angora: { nombre: 'Angora turco', minM: 4, maxM: 6, minH: 3, maxH: 5, vida: 15 },
  british: { nombre: 'British Shorthair', minM: 5, maxM: 8, minH: 3.5, maxH: 5.5, vida: 15 },
  ruso_azul: { nombre: 'Ruso Azul', minM: 4, maxM: 7, minH: 3, maxH: 5, vida: 16 },
  sphynx: { nombre: 'Sphynx', minM: 3.5, maxM: 5.5, minH: 3, maxH: 5, vida: 13 },
  abisinio: { nombre: 'Abisinio', minM: 4, maxM: 6, minH: 3, maxH: 4.5, vida: 14 },
  himalayo: { nombre: 'Himalayo', minM: 4, maxM: 6, minH: 3, maxH: 5, vida: 14 },
  scottish_fold: { nombre: 'Scottish Fold', minM: 4, maxM: 6, minH: 3, maxH: 5, vida: 13 },
  siberiano: { nombre: 'Siberiano', minM: 5, maxM: 9, minH: 4, maxH: 6, vida: 14 },
  oriental: { nombre: 'Oriental de pelo corto', minM: 3, maxM: 5, minH: 2.5, maxH: 4, vida: 15 },
};

export function pesoIdealGato(i: Inputs): Outputs {
  const raza = String(i.raza || 'comun_europeo');
  const contextura = String(i.contextura || 'mediana');
  const sexo = String(i.sexo || 'macho');

  if (!RAZAS[raza]) throw new Error('Raza no válida');
  const r = RAZAS[raza];

  let min = sexo === 'hembra' ? r.minH : r.minM;
  let max = sexo === 'hembra' ? r.maxH : r.maxM;

  // Ajuste por contextura
  if (contextura === 'pequena') {
    max = min + (max - min) * 0.4;
  } else if (contextura === 'grande') {
    min = min + (max - min) * 0.6;
  } else {
    // mediana: usamos el rango central
    const rango = max - min;
    min = min + rango * 0.25;
    max = max - rango * 0.25;
  }

  const promedio = (min + max) / 2;

  const minR = Number(min.toFixed(2));
  const maxR = Number(max.toFixed(2));
  const promR = Number(promedio.toFixed(2));
  const contexturaLabel = contextura === 'pequena' ? 'pequeña' : contextura === 'grande' ? 'grande' : 'mediana';

  const _insight = {
    title: `Peso ideal del ${r.nombre}`,
    text: `Un ${r.nombre} ${sexo === 'hembra' ? 'hembra' : 'macho'} de contextura ${contexturaLabel} debería pesar entre **${minR} y ${maxR} kg**, con un promedio de **${promR} kg**. Con una esperanza de vida de **~${r.vida} años**, mantenerlo en este rango es la mejor forma de evitar diabetes y problemas articulares.`,
    tone: 'neutral',
    icon: '🐱',
  };

  const _chart = {
    type: 'scale',
    marker: promR,
    markerLabel: `Promedio ${promR} kg`,
    min: 0,
    segments: [
      { nombre: 'Bajo peso', max: minR, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Peso ideal', max: maxR, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: 'Sobrepeso', max: Number((maxR * 1.4).toFixed(2)), color: '#ef4444', colorDark: '#f87171' },
    ],
    ariaLabel: `Escala de peso: la franja ideal del ${r.nombre} va de ${minR} a ${maxR} kg, con promedio ${promR} kg`,
  };

  return {
    pesoIdealMin: minR,
    pesoIdealMax: maxR,
    pesoPromedio: promR,
    raza: r.nombre,
    contextura: contextura === 'pequena' ? 'Pequeña' : contextura === 'grande' ? 'Grande' : 'Mediana',
    esperanzaAnios: r.vida,
    resumen: `${r.nombre} (${sexo}, contextura ${contextura}): peso ideal ${min.toFixed(1)}-${max.toFixed(1)} kg. Esperanza de vida: ~${r.vida} años.`,
    _insight,
    _chart,
  };
}
