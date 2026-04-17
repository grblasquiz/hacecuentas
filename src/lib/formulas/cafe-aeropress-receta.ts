/** AeroPress */
export interface Inputs { metodo: string; mlTazaFinal: number; temperatura: number; }
export interface Outputs { gramosCafe: number; mlAgua: number; molido: string; timing: string; instrucciones: string; }

export function cafeAeropressReceta(i: Inputs): Outputs {
  const m = String(i.metodo);
  const ml = Number(i.mlTazaFinal);
  const temp = Number(i.temperatura);
  if (!ml || ml <= 0) throw new Error('Ingresá ml');
  if (!temp) throw new Error('Ingresá temperatura');

  let ratio = 15, molido = 'Medio-fino', timing = '2:00', instr = '';
  if (m === 'estandar') { ratio = 12; molido = 'Fino'; timing = 'Bloom 10s, total 1:30'; instr = 'AeroPress normal, bloom, stir, presionar tras 1:00-1:30.'; }
  else if (m === 'invertido') { ratio = 15; molido = 'Medio-fino'; timing = '2:00 total'; instr = 'AeroPress al revés. Café, agua, stir. Esperar 2 min. Invertir y presionar 30s.'; }
  else if (m === 'hoffmann') { ratio = 18; molido = 'Medio-fino'; timing = '2:30 total'; instr = 'Sin inversión, sin stir. Agregar agua, esperar 2 min. Presionar suave 30s.'; }
  else if (m === 'campeon') { ratio = 14; molido = 'Fino'; timing = 'Variable 1:30-2:30'; instr = 'Invertido. Café + agua, stir, esperar 1-2 min según receta. Presionar.'; }

  const cafe = ml / ratio;
  return {
    gramosCafe: Number(cafe.toFixed(1)),
    mlAgua: ml,
    molido,
    timing,
    instrucciones: instr,
  };
}
