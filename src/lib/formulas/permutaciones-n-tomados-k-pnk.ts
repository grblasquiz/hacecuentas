export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function permutacionesNTomadosKPnk(i: Inputs): Outputs {
  const n=Math.floor(Number(i.n)||0); const k=Math.floor(Number(i.k)||0);
  if (k<0||k>n) return {
    resultado:'0',
    resumen:'k fuera de rango.',
    _insight: {
      title: 'Revisá los valores',
      text: 'En una permutación **k debe estar entre 0 y n**: no podés ordenar más elementos de los que tenés.',
      tone: 'warn',
      icon: '🔢',
    },
  };
  let p=1; for (let j=0;j<k;j++) p*=(n-j);
  const combinaciones = p.toLocaleString();
  const ordenan = k === n
    ? `Estás ordenando los **${n} elementos** completos (k = n), así que P(${n},${k}) coincide con ${n}!.`
    : `De **${n} elementos** elegís y **ordenás ${k}**; como el **orden importa**, cada selección distinta cuenta por separado.`;
  return {
    resultado:combinaciones,
    resumen:`P(${n},${k}) = ${combinaciones}.`,
    _insight: {
      title: `Hay ${combinaciones} permutaciones`,
      text: `${ordenan} El resultado es **${combinaciones}** ordenaciones posibles.`,
      tone: 'neutral',
      icon: '🔢',
    },
  };
}
