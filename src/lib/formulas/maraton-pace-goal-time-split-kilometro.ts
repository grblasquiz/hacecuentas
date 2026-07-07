export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function maratonPaceGoalTimeSplitKilometro(i: Inputs): Outputs {
  const h=Number(i.tiempoHoras)||0;
  const totSeg=h*3600;
  const paceSeg=totSeg/42.195;
  const pMin=Math.floor(paceSeg/60); const pSeg=Math.round(paceSeg%60);
  const paceMi=paceSeg*1.609;
  const mMin=Math.floor(paceMi/60); const mSeg=Math.round(paceMi%60);
  const half=totSeg/2;
  const hh=Math.floor(half/3600); const hm=Math.floor((half%3600)/60); const hs=Math.round(half%60);
  const pacePorKm=`${pMin}:${String(pSeg).padStart(2,'0')}/km`;
  const mediaTxt=`${hh}:${String(hm).padStart(2,'0')}:${String(hs).padStart(2,'0')}`;
  const objetivoTxt=h>0?`${Math.floor(h)}h ${String(Math.round((h-Math.floor(h))*60)).padStart(2,'0')}m`:'tu objetivo';
  const _insight={
    title:'Tu ritmo objetivo',
    text:`Para terminar el maratón en **${objetivoTxt}** tenés que sostener **${pacePorKm}** sin aflojar los 42,195 km. Pasá la media maratón en **${mediaTxt}**: si llegás más rápido, arrancaste demasiado fuerte y vas a pagarlo en la segunda mitad.`,
    tone:'neutral',
    icon:'🏃',
  };
  return { pacePorKm, paceMilla:`${mMin}:${String(mSeg).padStart(2,'0')}/mi`, media:mediaTxt, _insight };
}
