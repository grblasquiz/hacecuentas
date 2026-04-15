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

  return {
    pesoIdealMin: Number(min.toFixed(2)),
    pesoIdealMax: Number(max.toFixed(2)),
    pesoPromedio: Number(promedio.toFixed(2)),
    raza: r.nombre,
    contextura: contextura === 'pequena' ? 'Pequeña' : contextura === 'grande' ? 'Grande' : 'Mediana',
    esperanzaAnios: r.vida,
    resumen: `${r.nombre} (${sexo}, contextura ${contextura}): peso ideal ${min.toFixed(1)}-${max.toFixed(1)} kg. Esperanza de vida: ~${r.vida} años.`,
  };
}
