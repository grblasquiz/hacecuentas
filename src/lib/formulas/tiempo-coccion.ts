/** Tiempo y temperatura de cocción por carne/corte/peso */
export interface Inputs {
  carne: string;
  pesoKg: number;
  coccion?: string; // punto
}
export interface Outputs {
  tiempoTotalMin: number;
  tempHorno: number;
  tempInterna: number;
  metodo: string;
  notas: string;
}

type Carne = {
  nombre: string;
  minPorKg: Record<string, number>; // rare, medium, well
  tempHorno: number;
  tempInterna: Record<string, number>;
  metodo: string;
  notas: string;
};

const CARNES: Record<string, Carne> = {
  pollo_entero: {
    nombre: 'Pollo entero',
    minPorKg: { bien: 60, medio: 60, jugoso: 60 }, // pollo siempre bien cocido
    tempHorno: 180,
    tempInterna: { bien: 74, medio: 74, jugoso: 74 },
    metodo: 'Horno estándar, espalda hacia arriba las últimas 15 min para dorar.',
    notas: '74 °C internos en pechuga. Reposar 10 min antes de trinchar.',
  },
  pollo_pechuga: {
    nombre: 'Pechuga de pollo',
    minPorKg: { bien: 25, medio: 25, jugoso: 25 },
    tempHorno: 200,
    tempInterna: { bien: 72, medio: 72, jugoso: 72 },
    metodo: 'Horno 200 °C. Sellar en sartén antes para dorar.',
    notas: 'No exceder 72-75 °C interna, si no queda seca.',
  },
  peceto: {
    nombre: 'Peceto',
    minPorKg: { jugoso: 20, medio: 30, bien: 45 },
    tempHorno: 200,
    tempInterna: { jugoso: 55, medio: 63, bien: 71 },
    metodo: 'Sellar por todas las caras, luego horno.',
    notas: 'Corte magro, no excederse. Cortar contra la fibra.',
  },
  bife_ancho: {
    nombre: 'Bife ancho / Asado',
    minPorKg: { jugoso: 25, medio: 35, bien: 50 },
    tempHorno: 180,
    tempInterna: { jugoso: 55, medio: 63, bien: 71 },
    metodo: 'Horno o parrilla lenta + alta al final.',
    notas: 'Ideal parrilla: 30-40 min/kg según grosor. Reposar 10 min.',
  },
  colita_cuadril: {
    nombre: 'Colita de cuadril',
    minPorKg: { jugoso: 30, medio: 40, bien: 55 },
    tempHorno: 200,
    tempInterna: { jugoso: 55, medio: 63, bien: 71 },
    metodo: 'Horno 200 °C o parrilla. Dorar antes por lado graso.',
    notas: 'Cortar contra la fibra en bastones finos.',
  },
  matambre: {
    nombre: 'Matambre de novillo',
    minPorKg: { bien: 180, medio: 180, jugoso: 180 },
    tempHorno: 150,
    tempInterna: { bien: 85, medio: 85, jugoso: 85 },
    metodo: 'Cocción lenta (150 °C × 3 hs) o a la parrilla 1.5-2 hs.',
    notas: 'Duro si no cocinás lo suficiente. Mejor a olla con caldo por 2 hs.',
  },
  cerdo_lomo: {
    nombre: 'Lomo de cerdo',
    minPorKg: { medio: 35, bien: 50, jugoso: 30 },
    tempHorno: 180,
    tempInterna: { medio: 65, bien: 71, jugoso: 62 },
    metodo: 'Horno 180 °C. Sellar previo. Glaseado en últimos 15 min.',
    notas: 'Punto medio: 63-65 °C interna. Reposar 10 min.',
  },
  pescado_filete: {
    nombre: 'Filete de pescado (salmón, merluza)',
    minPorKg: { bien: 15, medio: 12, jugoso: 10 },
    tempHorno: 200,
    tempInterna: { bien: 63, medio: 55, jugoso: 50 },
    metodo: 'Horno 200 °C o sartén. 1 min × cm de espesor x cara.',
    notas: 'Pescado gordo (salmón) soporta punto medio. Blanco mejor bien hecho.',
  },
  cordero_pierna: {
    nombre: 'Pierna de cordero',
    minPorKg: { jugoso: 35, medio: 45, bien: 55 },
    tempHorno: 180,
    tempInterna: { jugoso: 57, medio: 63, bien: 71 },
    metodo: 'Horno lento con romero, ajo, limón. Dorar con fuego alto al final.',
    notas: 'Reposar 15 min antes de servir.',
  },
  pavita: {
    nombre: 'Pavita (pechuga o muslo)',
    minPorKg: { bien: 40, medio: 40, jugoso: 40 },
    tempHorno: 180,
    tempInterna: { bien: 74, medio: 74, jugoso: 74 },
    metodo: 'Horno 180 °C con caldo abajo. 74 °C internos obligatorios.',
    notas: 'Como pollo, nunca medio. Jugosa con mantequilla bajo la piel.',
  },
};

export function tiempoCoccion(i: Inputs): Outputs {
  const carne = String(i.carne || 'pollo_entero');
  const peso = Number(i.pesoKg);
  const coccion = String(i.coccion || 'medio');
  if (!peso || peso <= 0) throw new Error('Ingresá el peso en kg');
  if (!CARNES[carne]) throw new Error('Carne no reconocida');

  const c = CARNES[carne];
  const min = (c.minPorKg[coccion] || c.minPorKg['medio'] || 40) * peso;
  const tempInt = c.tempInterna[coccion] || c.tempInterna['medio'] || 63;

  return {
    tiempoTotalMin: Math.round(min),
    tempHorno: c.tempHorno,
    tempInterna: tempInt,
    metodo: c.metodo,
    notas: c.notas,
  };
}
