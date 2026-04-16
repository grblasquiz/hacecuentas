/** Calendario de siembra Argentina por zona y mes */
export interface Inputs {
  zona: string;
  mes: string;
}
export interface Outputs {
  siembraDirecta: string;
  almacigo: string;
  trasplante: string;
  cantidadEspecies: number;
}

type CalendarioZona = Record<number, { directa: string[]; almacigo: string[]; trasplante: string[] }>;

const PAMPEANA: CalendarioZona = {
  1: { directa: ['Maíz tardío', 'Zapallito', 'Chaucha', 'Rúcula'], almacigo: ['Brócoli otoñal'], trasplante: ['Tomate', 'Pimiento', 'Berenjena'] },
  2: { directa: ['Rúcula', 'Rabanito', 'Chaucha'], almacigo: ['Repollo', 'Coliflor'], trasplante: ['Apio', 'Frutilla'] },
  3: { directa: ['Lechuga', 'Espinaca', 'Rabanito', 'Rúcula', 'Acelga'], almacigo: ['Cebolla', 'Coliflor', 'Brócoli'], trasplante: ['Repollo'] },
  4: { directa: ['Ajo', 'Arvejas', 'Habas', 'Lechuga', 'Espinaca', 'Rúcula', 'Rabanito', 'Acelga'], almacigo: ['Cebolla', 'Puerro', 'Brócoli', 'Coliflor'], trasplante: ['Lechuga', 'Acelga'] },
  5: { directa: ['Ajo', 'Habas', 'Arvejas', 'Espinaca', 'Lechuga'], almacigo: ['Cebolla', 'Puerro'], trasplante: ['Brócoli', 'Coliflor'] },
  6: { directa: ['Ajo', 'Habas', 'Arvejas'], almacigo: ['Lechuga', 'Cebolla'], trasplante: ['Puerro'] },
  7: { directa: ['Habas', 'Arvejas'], almacigo: ['Lechuga', 'Tomate (fin mes)', 'Pimiento'], trasplante: ['Cebolla'] },
  8: { directa: ['Rabanito', 'Rúcula', 'Zanahoria'], almacigo: ['Tomate', 'Pimiento', 'Berenjena', 'Albahaca'], trasplante: ['Lechuga', 'Cebolla'] },
  9: { directa: ['Remolacha', 'Rabanito', 'Zanahoria', 'Lechuga', 'Acelga', 'Perejil'], almacigo: ['Zapallo', 'Zapallito', 'Pepino', 'Melón', 'Sandía'], trasplante: ['Tomate', 'Pimiento'] },
  10: { directa: ['Maíz', 'Chaucha', 'Zapallito', 'Pepino'], almacigo: ['Albahaca'], trasplante: ['Tomate', 'Pimiento', 'Berenjena', 'Zapallo'] },
  11: { directa: ['Maíz', 'Poroto', 'Zapallito', 'Pepino', 'Chaucha'], almacigo: [], trasplante: ['Zapallo', 'Sandía', 'Melón'] },
  12: { directa: ['Maíz tardío', 'Poroto', 'Chaucha'], almacigo: ['Brócoli otoñal'], trasplante: ['Albahaca'] },
};

const ZONAS: Record<string, CalendarioZona> = {
  pampeana: PAMPEANA,
  litoral: PAMPEANA,
  cuyana: Object.fromEntries(Object.entries(PAMPEANA).map(([m, v]) => [m, v])),
  noa: Object.fromEntries(Object.entries(PAMPEANA).map(([m, v]) => {
    const mesNum = Number(m);
    const adjusted = ((mesNum - 2 + 12) % 12) + 1;
    return [m, PAMPEANA[adjusted] || v];
  })),
  nea: Object.fromEntries(Object.entries(PAMPEANA).map(([m, v]) => {
    const mesNum = Number(m);
    const adjusted = ((mesNum - 1 + 12) % 12) + 1;
    return [m, PAMPEANA[adjusted] || v];
  })),
  patagonia: Object.fromEntries(Object.entries(PAMPEANA).map(([m, v]) => {
    const mesNum = Number(m);
    const adjusted = ((mesNum) % 12) + 1;
    return [m, PAMPEANA[adjusted] || v];
  })),
};

export function siembraCalendarioArgentina(i: Inputs): Outputs {
  const zona = String(i.zona || 'pampeana');
  const mes = Number(i.mes);
  if (mes < 1 || mes > 12) throw new Error('Seleccioná un mes válido');

  const cal = ZONAS[zona] || ZONAS.pampeana;
  const data = cal[mes] || { directa: [], almacigo: [], trasplante: [] };

  const total = data.directa.length + data.almacigo.length + data.trasplante.length;

  return {
    siembraDirecta: data.directa.length > 0 ? data.directa.join(', ') : 'No hay siembra directa recomendada este mes',
    almacigo: data.almacigo.length > 0 ? data.almacigo.join(', ') : 'No hay almácigos recomendados este mes',
    trasplante: data.trasplante.length > 0 ? data.trasplante.join(', ') : 'No hay trasplantes recomendados este mes',
    cantidadEspecies: total,
  };
}
