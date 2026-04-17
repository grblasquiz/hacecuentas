/** Dilución cerveza */
export interface Inputs { volumenActual: number; abvActual: number; abvObjetivo: number; }
export interface Outputs { aguaAgregar: number; volumenFinal: number; reduccionIbu: number; advertencia: string; }

export function dilucionCervezaAlcoholObjetivo(i: Inputs): Outputs {
  const v = Number(i.volumenActual);
  const a = Number(i.abvActual);
  const o = Number(i.abvObjetivo);
  if (!v || v <= 0) throw new Error('Ingresá volumen actual');
  if (!a || a <= 0) throw new Error('Ingresá ABV actual');
  if (!o || o <= 0) throw new Error('Ingresá ABV objetivo');
  if (o >= a) throw new Error('El ABV objetivo debe ser menor que el actual');

  const vFinal = v * a / o;
  const agua = vFinal - v;
  const reduccion = (1 - v / vFinal) * 100;

  let adv = '';
  if (reduccion > 40) adv = 'Dilución alta — usá agua hervida estéril y reducirás mucho sabor y cuerpo.';
  else if (reduccion > 20) adv = 'Dilución moderada — perderás ~20-30% de aromas e IBU.';
  else adv = 'Dilución leve — el efecto en sabor será bajo.';

  return {
    aguaAgregar: Number(agua.toFixed(2)),
    volumenFinal: Number(vFinal.toFixed(2)),
    reduccionIbu: Number(reduccion.toFixed(1)),
    advertencia: adv,
  };
}
