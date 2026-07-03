/** Cuánto pollo comprar por persona según cantidad de comensales, corte y rol del plato. */
export interface Inputs {
  adultos?: number | string;
  ninos?: number | string;
  corte?: string;
  rol?: string;
  __country?: string;
}

export interface Outputs {
  pollo_kg: number;
  unidades: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function polloPorPersona(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.floor(Number(i.adultos) || 0));
  const ninos = Math.max(0, Math.floor(Number(i.ninos) || 0));
  const corte = String(i.corte || 'presas');
  const rol = String(i.rol || 'principal');

  const gPP: Record<string, number> = { pollo_entero: 350, presas: 300, pechuga: 220, muslos: 300 };
  const rolF: Record<string, number> = { principal: 1, guarnicion: 0.6 };

  const g = gPP[corte] ?? 300;
  const rf = rolF[rol] ?? 1;

  const total = adultos + ninos;
  const total_g = adultos * g * rf + ninos * g * rf * 0.6;
  const pollo_kg = total > 0 ? Math.ceil((total_g / 1000) * 4) / 4 : 0;
  const unidades = total > 0 && corte === 'pollo_entero' ? Math.max(1, Math.ceil(pollo_kg / 1.8)) : 0;
  const presas = total > 0 && corte !== 'pollo_entero' ? Math.round(pollo_kg / 0.15) : 0;

  let resumen = '';
  if (total > 0) {
    if (corte === 'pollo_entero') {
      resumen = `Para ${adultos} adulto${adultos === 1 ? '' : 's'}${ninos > 0 ? ` y ${ninos} niño${ninos === 1 ? '' : 's'}` : ''}: ${pollo_kg} kg de pollo, unos ${unidades} pollo${unidades === 1 ? '' : 's'} entero${unidades === 1 ? '' : 's'}.`;
    } else {
      resumen = `Para ${adultos} adulto${adultos === 1 ? '' : 's'}${ninos > 0 ? ` y ${ninos} niño${ninos === 1 ? '' : 's'}` : ''}: ${pollo_kg} kg de pollo, unas ${presas} presas aproximadamente.`;
    }
  } else {
    resumen = 'Cargá cuántas personas van a comer para calcular el pollo.';
  }

  const out: Outputs = { pollo_kg, unidades, resumen };

  if (total > 0) {
    out._insight = {
      title: 'Cuánto pollo comprar',
      text: `Para ${adultos} adulto${adultos === 1 ? '' : 's'}${ninos > 0 ? ` y ${ninos} niño${ninos === 1 ? '' : 's'}` : ''} calculá **${pollo_kg} kg** de pollo${corte === 'pollo_entero' ? ` (unos **${unidades}** pollos enteros)` : ` (unas **${presas}** presas)`}. Como plato principal, la referencia es ${g} g por adulto; los niños comen alrededor del 60%.`,
      tone: 'neutral',
      icon: '🍗',
    };
  }

  return out;
}
