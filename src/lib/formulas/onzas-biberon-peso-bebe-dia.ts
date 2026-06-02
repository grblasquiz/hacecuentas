export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function onzasBiberonPesoBebeDia(i: Inputs): Outputs {
  const p=Number(i.peso)||0; const m=Number(i.edadMes)||0;
  let mlkg=90; if (m>3) mlkg=75; if (m>6) mlkg=60;
  const mlDia=p*mlkg; const tomas=m<=3?6:5;
  const porToma = mlDia / tomas;
  const onzasDia = mlDia / 29.57;
  return {
    mlDia:`${mlDia.toFixed(0)} ml/día`,
    porToma:`${porToma.toFixed(0)} ml/toma`,
    resumen:`${p}kg a ${m}m: ~${mlDia.toFixed(0)}ml/día en ${tomas} tomas.`,
    _insight: {
      title: 'Cuánta fórmula por día',
      text: `Para un bebé de **${p} kg** a los **${m} meses**, una guía aproximada es **${mlDia.toFixed(0)} ml/día** (~${onzasDia.toFixed(1)} oz), repartidos en **${tomas} tomas** de unos ${porToma.toFixed(0)} ml. Es una referencia: cada bebé regula su apetito, no fuerces el biberón ni lo limites si pide más.`,
      tone: 'neutral',
      icon: '🍼',
    },
  };
}
