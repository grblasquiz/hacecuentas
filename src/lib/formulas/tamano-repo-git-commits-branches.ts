export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tamanoRepoGitCommitsBranches(i: Inputs): Outputs {
  const c=Number(i.commits)||0; const a=Number(i.archivos)||0; const kb=Number(i.kbProm)||5;
  const mb=(a*kb+c*2)/1024;
  let cons='OK'; if (mb>500) cons='Considera LFS o split'; else if (mb>100) cons='Empieza a pesar';
  return { estimado:`${mb.toFixed(1)} MB`, consejo:cons, resumen:`Repo estimado: ${mb.toFixed(0)} MB. ${cons}.` };
}
