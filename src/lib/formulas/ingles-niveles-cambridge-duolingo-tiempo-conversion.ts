export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function inglesNivelesCambridgeDuolingoTiempoConversion(i: Inputs): Outputs {
  const n=String(i.nivelActual||'b1'); const h=Number(i.horasSemana)||5;
  const niveles=['cero','a1','a2','b1','b2','c1','c2'];
  const horasAcum={'cero':0,'a1':100,'a2':200,'b1':400,'b2':700,'c1':1000,'c2':1500};
  const idx=niveles.indexOf(n);
  const siguiente=niveles[idx+1];
  if(!siguiente) return { semanasASiguiente:'Ya en C2', totalHasta:'—', observacion:'Nivel máximo' };
  const horasNec=horasAcum[siguiente]-horasAcum[n];
  const semanas=Math.ceil(horasNec/h);
  const hastaC1=horasAcum['c1']-horasAcum[n];
  return { semanasASiguiente:`${semanas} semanas a ${siguiente.toUpperCase()}`, totalHasta:`${hastaC1} horas a C1`, observacion:`Desde ${n.toUpperCase()} al siguiente: ${horasNec} horas.` };
}
