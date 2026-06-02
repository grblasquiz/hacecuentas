export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function pesoSaludableAdolescenteImcJuvenil(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  return {
    resultado:r.toFixed(2),
    resumen:`Cálculo con ${v1} y ${v2}: resultado ${r.toFixed(2)}.`,
    _insight: {
      title: 'Tu resultado',
      text: `Aplicando ${v1} sobre ${v2}, el cálculo da **${r.toFixed(2)}** — equivale a tomar el **${v2}%** de ${v1}. Cambiá cualquiera de los dos valores para ver cómo se mueve el resultado.`,
      tone: 'neutral',
      icon: '📊',
    },
  };
}
