export interface Inputs { [k: string]: number | string; }
export interface Outputs { kcalTotal: string; porKm: string; resumen: string; _insight?: any; }
export function caloriasQuemadasRunningKmPeso(i: Inputs): Outputs {
  const km=Number(i.km)||0; const p=Number(i.pesoKg)||0; const r=String(i.ritmo||'moderado');
  const metR: Record<string,number> = { lento:8, moderado:10, rapido:11.5 };
  const minPorKm: Record<string,number> = { lento:6, moderado:5, rapido:4 };
  const min=km*minPorKm[r];
  const kcal=metR[r]*p*(min/60);
  const porKmVal = km > 0 ? kcal/km : 0;
  const minMedialunas = kcal / 230; // medialuna ≈ 230 kcal
  const insight = {
    title: 'Lo que te dejó la corrida',
    text: `Esos **${km} km** a ritmo **${r}** te queman **${kcal.toFixed(0)} kcal** (~**${porKmVal.toFixed(0)} kcal/km**), el equivalente a unas **${minMedialunas.toFixed(1)} medialunas**.` +
      (r === 'rapido'
        ? ' A ritmo rápido el gasto por minuto es máximo: muy eficiente si buscás quemar en poco tiempo.'
        : ' Sumá kilómetros o subí el ritmo para elevar el gasto total.'),
    tone: 'good',
    icon: '🏃',
  };
  return { kcalTotal:kcal.toFixed(0)+' kcal', porKm:porKmVal.toFixed(0)+' kcal/km', resumen:`${km}km ${r} con ${p}kg: ${kcal.toFixed(0)} kcal (${porKmVal.toFixed(0)}/km).`, _insight: insight };
}
