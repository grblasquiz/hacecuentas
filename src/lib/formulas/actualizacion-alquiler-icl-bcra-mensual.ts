export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function actualizacionAlquilerIclBcraMensual(i: Inputs): Outputs {
  const a=Number(i.alquilerInicial)||0; const i1=Number(i.iclInicial)||0; const i2=Number(i.iclActual)||0;
  if (i1===0) return { alquilerActual:'—', aumento:'—', resumen:'ICL inicial inválido.' };
  const nuevo=a*(i2/i1);
  const aum=((i2/i1)-1)*100;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const dif=nuevo-a;
  const _insight = {
    title: 'Tu nuevo alquiler con ICL',
    text: `El ICL aplica un ajuste del **${aum.toFixed(1)}%**: el alquiler pasa de ${fmt(a)} a **${fmt(nuevo)}**, ${dif>=0?`unos **${fmt(dif)}** más`:`unos **${fmt(-dif)}** menos`} por mes. Verificá que el período entre índices coincida con el de tu contrato.`,
    tone: (aum>0?'warn':'neutral'),
    icon: '🏠',
  };
  const out:Outputs = { alquilerActual:'$'+nuevo.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), aumento:aum.toFixed(1)+'%', resumen:`Alquiler $${a.toLocaleString('es-AR')} → $${nuevo.toFixed(0)} (+${aum.toFixed(1)}%).`, _insight };
  if (dif>=0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Alquiler base', value: Math.round(a) },
        { label: 'Aumento ICL', value: Math.round(dif) },
      ],
      prefix: '$',
      centerValue: fmt(nuevo),
      centerLabel: 'Nuevo alquiler',
      ariaLabel: `Composición del nuevo alquiler: base ${fmt(a)} más aumento ICL ${fmt(dif)}`,
    };
  }
  return out;
}
