/** Compost: ratio Carbono/Nitrógeno */
export interface Inputs { kgVerde: number; kgMarron: number; }
export interface Outputs { ratioCN: string; estado: string; ajuste: string; tiempoEstimado: string; }

export function compostProporcionCarbonoNitrogeno(i: Inputs): Outputs {
  const verde = Number(i.kgVerde);
  const marron = Number(i.kgMarron);
  if (verde <= 0 && marron <= 0) throw new Error('Ingresá al menos un material');

  // Verde promedio C:N = 15:1, Marrón promedio C:N = 60:1
  const cVerde = verde * 15;
  const nVerde = verde * 1;
  const cMarron = marron * 60;
  const nMarron = marron * 1;
  const totalC = cVerde + cMarron;
  const totalN = nVerde + nMarron;
  const ratio = totalN > 0 ? totalC / totalN : 999;

  let estado = '';
  let ajuste = '';
  let tiempo = '';

  if (ratio >= 25 && ratio <= 35) {
    estado = 'Excelente — ratio ideal para compostaje rápido';
    ajuste = 'No necesitás ajustar. Revolvé cada 1-2 semanas y mantené húmedo.';
    tiempo = '2–4 meses';
  } else if (ratio < 25) {
    const kgMarronExtra = ((25 * totalN - totalC) / 60);
    estado = 'Demasiado nitrógeno — riesgo de olor y putrefacción';
    ajuste = `Agregá aproximadamente ${Math.ceil(kgMarronExtra)} kg de material marrón (hojas secas, cartón).`;
    tiempo = '1–3 meses (si se corrige el ratio)';
  } else {
    const kgVerdeExtra = ((totalC - 30 * totalN) / 15);
    estado = 'Demasiado carbono — descomposición muy lenta';
    ajuste = `Agregá aproximadamente ${Math.ceil(kgVerdeExtra)} kg de material verde (restos de cocina, pasto).`;
    tiempo = '6–12 meses (si no se corrige)';
  }

  return {
    ratioCN: `${Math.round(ratio)}:1`,
    estado,
    ajuste,
    tiempoEstimado: tiempo,
  };
}
