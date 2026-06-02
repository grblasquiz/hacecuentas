export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function deficitCaloricoPerderPesoSemana(i: Inputs): Outputs {
  const k=Number(i.kgAPerder)||0; const s=Number(i.semanasObjetivo)||1; const t=Number(i.tdee)||2000;
  const totalDef=k*7700;
  const defDia=totalDef/(s*7);
  const cal=t-defDia;
  const seguro=defDia<=1000?'Saludable':'Excesivo: bajá objetivo o extendé plazo';

  const out:Outputs={ deficitDiario:'-'+defDia.toFixed(0)+' kcal', caloriasDieta:cal.toFixed(0)+' kcal/día', seguro, resumen:`${k}kg en ${s}sem: déficit ${defDia.toFixed(0)} kcal/día, dieta ${cal.toFixed(0)} kcal. ${seguro}.` };

  if(k>0 && defDia>0){
    const ritmoSemanal=(defDia*7)/7700;
    if(defDia>1000){
      out._insight={ title:'Objetivo demasiado agresivo', text:`Para perder **${k} kg en ${s} semana(s)** necesitás un déficit de **${defDia.toFixed(0)} kcal/día**, por encima del límite saludable de ~1000 kcal. ${cal<1200?`Tu dieta quedaría en **${cal.toFixed(0)} kcal/día**, un piso peligroso. `:''}Extendé el plazo o bajá los kilos objetivo.`, tone:'warn', icon:'⚠️' };
    } else {
      out._insight={ title:'Ritmo sostenible', text:`Con **${defDia.toFixed(0)} kcal/día** de déficit perdés alrededor de **${ritmoSemanal.toFixed(2)} kg por semana** comiendo **${cal.toFixed(0)} kcal/día**. Está dentro del rango saludable (≤1000 kcal/día).`, tone:'good', icon:'🏃' };
    }
    if(cal>0){
      out._chart={ type:'doughnut', slices:[ {label:'Calorías de la dieta',value:Math.round(cal)}, {label:'Déficit diario',value:Math.round(defDia)} ], prefix:'', centerValue:t.toFixed(0)+' kcal', centerLabel:'Tu TDEE', ariaLabel:`Reparto de tu gasto diario de ${t.toFixed(0)} kcal entre lo que comés y el déficit` };
    }
  } else {
    out._insight={ title:'Cargá tu objetivo', text:'Ingresá los kilos a perder, el plazo y tu TDEE para ver el déficit diario y si el ritmo es saludable (el límite recomendado es ~1000 kcal/día).', tone:'neutral', icon:'🍽️' };
  }
  return out;
}
