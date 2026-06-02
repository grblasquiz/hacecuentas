/** Dilución cerveza */
export interface Inputs { volumenActual: number; abvActual: number; abvObjetivo: number; }
export interface Outputs { aguaAgregar: number; volumenFinal: number; reduccionIbu: number; advertencia: string; _insight?: any; _chart?: any; }

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
  let tone: 'good' | 'warn' | 'neutral';
  if (reduccion > 40) { adv = 'Dilución alta — usá agua hervida estéril y reducirás mucho sabor y cuerpo.'; tone = 'warn'; }
  else if (reduccion > 20) { adv = 'Dilución moderada — perderás ~20-30% de aromas e IBU.'; tone = 'neutral'; }
  else { adv = 'Dilución leve — el efecto en sabor será bajo.'; tone = 'good'; }

  const insightText = `Para bajar de **${a}%** a **${o}% ABV** sumá **${agua.toFixed(2)} L** de agua a tus ${v} L, llegando a **${vFinal.toFixed(2)} L** finales. El IBU y los aromas caen ~**${reduccion.toFixed(1)}%**.`;

  return {
    aguaAgregar: Number(agua.toFixed(2)),
    volumenFinal: Number(vFinal.toFixed(2)),
    reduccionIbu: Number(reduccion.toFixed(1)),
    advertencia: adv,
    _insight: { title: 'Cuánta agua agregar', text: insightText, tone, icon: '🍺' },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Cerveza original', value: Number(v.toFixed(2)) },
        { label: 'Agua a agregar', value: Number(agua.toFixed(2)) },
      ],
      prefix: '',
      centerValue: `${vFinal.toFixed(2)} L`,
      centerLabel: 'Volumen final',
      ariaLabel: `Volumen final de ${vFinal.toFixed(2)} litros: ${v} L de cerveza más ${agua.toFixed(2)} L de agua`,
    },
  };
}
