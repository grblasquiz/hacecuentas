export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function inglesNivelesCambridgeDuolingoTiempoConversion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const n=String(i.nivelActual||'b1'); const h=Number(i.horasSemana)||5;
  const niveles=['cero','a1','a2','b1','b2','c1','c2'];
  const horasAcum={'cero':0,'a1':100,'a2':200,'b1':400,'b2':700,'c1':1000,'c2':1500};
  const idx=niveles.indexOf(n);
  const siguiente=niveles[idx+1];
  if(!siguiente) return {
    semanasASiguiente: __lang === 'en' ? 'Already at C2' : 'Ya en C2',
    totalHasta: '—',
    observacion: __lang === 'en' ? 'Maximum level' : 'Nivel máximo',
  };
  const horasNec=horasAcum[siguiente]-horasAcum[n];
  const semanas=Math.ceil(horasNec/h);
  const hastaC1=horasAcum['c1']-horasAcum[n];
  return {
    semanasASiguiente: __lang === 'en' ? `${semanas} weeks to ${siguiente.toUpperCase()}` : `${semanas} semanas a ${siguiente.toUpperCase()}`,
    totalHasta: __lang === 'en' ? `${hastaC1} hours to C1` : `${hastaC1} horas a C1`,
    observacion: __lang === 'en' ? `From ${n.toUpperCase()} to next level: ${horasNec} hours.` : `Desde ${n.toUpperCase()} al siguiente: ${horasNec} horas.`,
  };
}
