/** Cuántas milanesas preparar por persona y los insumos (carne/pollo, pan rallado, huevos). */
export interface Inputs {
  adultos?: number | string;
  ninos?: number | string;
  tipo?: string;
  apetito?: string;
  __country?: string;
}

export interface Outputs {
  milanesas: number;
  carne_kg: number;
  pan_rallado_g: number;
  huevos: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function milanesasPorPersona(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.floor(Number(i.adultos) || 0));
  const ninos = Math.max(0, Math.floor(Number(i.ninos) || 0));
  const tipo = String(i.tipo || 'carne');
  const apetito = String(i.apetito || 'normal');

  const base: Record<string, number> = { normal: 2, abundante: 3 };
  const b = base[apetito] ?? 2;

  const total = adultos + ninos;
  const milanesas = total > 0 ? Math.ceil(adultos * b + ninos * 1) : 0;
  const carne_kg = milanesas > 0 && tipo !== 'berenjena' ? Math.ceil(milanesas * 0.12 * 4) / 4 : 0;
  const pan_rallado_g = milanesas > 0 ? Math.round(milanesas * 30) : 0;
  const huevos = milanesas > 0 ? Math.max(1, Math.ceil(milanesas / 4)) : 0;

  const tipoLabel = tipo === 'pollo' ? 'de pollo' : tipo === 'berenjena' ? 'de berenjena' : 'de carne';

  const resumen = total > 0
    ? `Para ${adultos} adulto${adultos === 1 ? '' : 's'}${ninos > 0 ? ` y ${ninos} niño${ninos === 1 ? '' : 's'}` : ''}: ${milanesas} milanesas ${tipoLabel}${carne_kg > 0 ? `, ${carne_kg} kg de carne` : ''}, ${pan_rallado_g} g de pan rallado y ${huevos} huevos.`
    : 'Cargá cuántas personas van a comer para calcular las milanesas.';

  const out: Outputs = { milanesas, carne_kg, pan_rallado_g, huevos, resumen };

  if (milanesas > 0) {
    out._insight = {
      title: 'Cuántas milanesas preparar',
      text: `Para ${adultos} adulto${adultos === 1 ? '' : 's'}${ninos > 0 ? ` y ${ninos} niño${ninos === 1 ? '' : 's'}` : ''} calculá **${milanesas} milanesas ${tipoLabel}**${carne_kg > 0 ? `, unos **${carne_kg} kg** de carne` : ''}, **${pan_rallado_g} g** de pan rallado y **${huevos} huevos**. Regla base: 2 milanesas por adulto (3 con apetito abundante) y 1 por niño.`,
      tone: 'neutral',
      icon: '🍖',
    };
  }

  return out;
}
