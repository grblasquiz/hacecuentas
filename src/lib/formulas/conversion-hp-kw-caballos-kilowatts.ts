export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionHpKwCaballosKilowatts(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const de=String(i.desde||'hp');
  let kw:number;
  if (de==='hp') kw=v*0.7457; else if (de==='cv') kw=v*0.7355; else kw=v;
  const hp = kw / 0.7457;
  const cv = kw / 0.7355;

  // Referencia tangible según la potencia
  let ref: string;
  if (kw < 1) ref = 'una electrobomba o herramienta chica';
  else if (kw < 5) ref = 'un motor de moto o cortacésped';
  else if (kw < 75) ref = 'el motor de un auto de calle';
  else if (kw < 300) ref = 'un auto deportivo o camioneta potente';
  else ref = 'un camión o maquinaria pesada';

  return {
    hp:`${hp.toFixed(2)} HP`,
    kw:`${kw.toFixed(2)} kW`,
    cv:`${cv.toFixed(2)} CV`,
    resumen:`${v} ${de} = ${kw.toFixed(1)} kW.`,
    _insight: {
      title: 'Cuánta potencia es',
      text: `**${v} ${de}** equivalen a **${kw.toFixed(1)} kW** = **${hp.toFixed(1)} HP** = **${cv.toFixed(1)} CV**. Es la potencia típica de ${ref}. (HP y CV difieren ~1,4%: 1 HP = 0,7457 kW, 1 CV = 0,7355 kW.)`,
      tone: 'neutral',
      icon: '⚙️'
    }
  };
}
