export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function macrosRecompCutBulkLeanCalorias(i: Inputs): Outputs {
  const o=String(i.objetivo||'recomp'); const tmb=Number(i.tmb)||2000;
  const mult={'cut':0.80,'recomp':1.0,'lean_bulk':1.12,'bulk':1.22}[o] ?? 1.0;
  const cal=tmb*mult;
  const prot=Math.round(cal*0.3/4);
  const gra=Math.round(cal*0.25/9);
  const car=Math.round((cal-prot*4-gra*9)/4);
  const calR=Math.round(cal);
  const calFmt=calR.toLocaleString('es-AR');
  const kcalProt=prot*4, kcalCarbos=car*4, kcalGrasa=gra*9;
  const diff=calR-Math.round(tmb);
  const objLabel={'cut':'Cut','recomp':'Recomposición','lean_bulk':'Lean bulk','bulk':'Bulk'}[o] || 'Recomposición';
  let insight: any;
  if (o==='cut') {
    insight={ title:'Fase de definición (cut)', text:`Comés **${calFmt} kcal/día**, un **20% por debajo** de tu TMB (${Math.abs(diff)} kcal menos) para perder grasa. La proteína alta (**${prot} g**) protege el músculo en el déficit.`, tone:'warn', icon:'🔥' };
  } else if (o==='bulk' || o==='lean_bulk') {
    insight={ title:`Superávit para ${objLabel.toLowerCase()}`, text:`Apuntás a **${calFmt} kcal/día**, **+${diff} kcal sobre** tu TMB, con **${prot} g de proteína** y **${car} g de carbos** para ganar masa muscular.`, tone:'good', icon:'💪' };
  } else {
    insight={ title:'Recomposición a mantenimiento', text:`Comés tus **${calFmt} kcal de mantenimiento**, repartidas en **${prot} g de proteína, ${car} g de carbos y ${gra} g de grasa** para perder grasa y ganar músculo a la vez.`, tone:'neutral', icon:'🔄' };
  }
  return {
    calorias:`${calR} kcal`, proteina:`${prot} g`, carbos:`${car} g`, grasa:`${gra} g`,
    _insight: insight,
    _chart: {
      type:'doughnut',
      slices:[
        { label:'Proteína', value:kcalProt },
        { label:'Carbos', value:kcalCarbos },
        { label:'Grasa', value:kcalGrasa },
      ],
      centerValue:`${calFmt} kcal`,
      centerLabel:'Total diario',
      ariaLabel:`Reparto de calorías ${objLabel}: ${kcalProt} kcal proteína, ${kcalCarbos} kcal carbos, ${kcalGrasa} kcal grasa`,
    },
  };
}
