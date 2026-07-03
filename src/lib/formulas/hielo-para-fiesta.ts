/** Hielo para una fiesta o evento según personas, uso, duración y clima. */
export interface Inputs {
  personas?: number | string;
  uso?: string;
  duracion?: string;
  clima?: string;
  __country?: string;
}

export interface Outputs {
  hielo_kg: number;
  bolsas: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function hieloParaFiesta(i: Inputs): Outputs {
  const p = Math.max(0, Math.floor(Number(i.personas) || 0));
  const uso = String(i.uso || 'enfriar_bebidas');
  const duracion = String(i.duracion || 'media');
  const clima = String(i.clima || 'templado');

  const baseMap: Record<string, number> = { enfriar_bebidas: 0.5, tragos_barra: 0.7, ambos: 1.0 };
  const durMap: Record<string, number> = { corta: 0.8, media: 1, larga: 1.3 };
  const climaMap: Record<string, number> = { templado: 1, caluroso: 1.3 };

  const base = baseMap[uso] ?? 0.5;
  const durF = durMap[duracion] ?? 1;
  const climaF = climaMap[clima] ?? 1;

  const hielo_kg = p > 0 ? Math.ceil(p * base * durF * climaF * 2) / 2 : 0;
  const bolsas = hielo_kg > 0 ? Math.ceil(hielo_kg / 3) : 0;

  const resumen = p > 0
    ? `Para ${p} personas: ${hielo_kg} kg de hielo, es decir ${bolsas} ${bolsas === 1 ? 'bolsa' : 'bolsas'} de 3 kg. Compralo el mismo día y guardalo en conservadora.`
    : 'Cargá la cantidad de personas para calcular el hielo.';

  const out: Outputs = { hielo_kg, bolsas, resumen };

  if (p > 0) {
    out._insight = {
      title: 'Cuánto hielo comprar',
      text: `Para **${p}** personas necesitás unos **${hielo_kg} kg** de hielo (**${bolsas}** ${bolsas === 1 ? 'bolsa' : 'bolsas'} de 3 kg). Regla práctica: entre 0,5 y 1 kg por persona según si es solo para enfriar bebidas o también para tragos, y sumá un tercio más si hace mucho calor.`,
      tone: 'neutral',
      icon: '🧊',
    };
  }

  return out;
}
