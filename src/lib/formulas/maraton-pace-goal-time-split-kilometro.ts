export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function maratonPaceGoalTimeSplitKilometro(i: Inputs): Outputs {
  const h=Number(i.tiempoHoras)||0;
  const totSeg=h*3600;
  const paceSeg=totSeg/42.195;
  const pMin=Math.floor(paceSeg/60); const pSeg=Math.round(paceSeg%60);
  const paceMi=paceSeg*1.609;
  const mMin=Math.floor(paceMi/60); const mSeg=Math.round(paceMi%60);
  const half=totSeg/2;
  const hh=Math.floor(half/3600); const hm=Math.floor((half%3600)/60); const hs=Math.round(half%60);
  return { pacePorKm:`${pMin}:${String(pSeg).padStart(2,'0')}/km`, paceMilla:`${mMin}:${String(mSeg).padStart(2,'0')}/mi`, media:`${hh}:${String(hm).padStart(2,'0')}:${String(hs).padStart(2,'0')}` };
}
