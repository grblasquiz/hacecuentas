export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function rpeRirSeriesEntrenamientoPorcentaje(i: Inputs): Outputs {
  const r=Number(i.repeticiones)||0; const rpe=Number(i.rpe)||8;
  const rir=10-rpe;
  const pctMap:Record<string,number>={'1_10':100,'1_9':96,'2_10':95,'2_9':92,'3_10':92,'3_9':89,'5_10':87,'5_9':84,'5_8':81,'8_10':80,'8_8':74,'10_9':71,'10_8':68};
  const key=`${r}_${rpe}`; const pct=pctMap[key]||(rpe/10*100-r*2);
  return { rir:`${rir} (reps en reserva)`, porcentaje1rm:`~${Math.round(pct)}%`, interpretacion:`${r} reps @ RPE ${rpe}: te quedaban ${rir} reps, ~${Math.round(pct)}% de tu 1RM.` };
}
