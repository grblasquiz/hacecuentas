export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function determinanteInversaMatriz2x2(i: Inputs): Outputs {
  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0; const d=Number(i.d)||0;
  const det=a*d-b*c;
  if (Math.abs(det)<1e-10) return {
    det:'0', inversa:'—', resumen:'Matriz singular, sin inversa.',
    _insight: {
      title: 'Matriz singular',
      text: 'El determinante es **0**, así que la matriz **no tiene inversa**: sus filas (o columnas) son linealmente dependientes y el sistema asociado no tiene solución única.',
      tone: 'warn',
      icon: '⚠️',
    },
  };
  const f=1/det;
  const inv=`[[${(d*f).toFixed(3)}, ${(-b*f).toFixed(3)}], [${(-c*f).toFixed(3)}, ${(a*f).toFixed(3)}]]`;
  return {
    det:det.toFixed(3), inversa:inv, resumen:`det=${det.toFixed(2)}, invertible.`,
    _insight: {
      title: 'Matriz invertible',
      text: `El determinante es **${det.toFixed(3)}** (distinto de 0), por lo que la matriz **sí tiene inversa** y el sistema asociado tiene solución única.`,
      tone: 'good',
      icon: '✅',
    },
  };
}
