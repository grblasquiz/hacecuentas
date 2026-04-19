export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function monotributoCuota2026TodasCategorias(i: Inputs): Outputs {
  const c=String(i.categoria||'A');
  const cuotas: Record<string,[number,number,number]> = {
    A:[7100,20500,15400], B:[13500,22500,15400], C:[23200,24800,15400], D:[38100,27300,15400],
    E:[72300,30000,19200], F:[99400,33000,23200], G:[126400,36300,27900], H:[286700,39900,33600],
    I:[467300,43900,40400], J:[544700,48300,48500], K:[632500,53100,58300]
  };
  const [ig,sp,os]=cuotas[c]||cuotas.A;
  const total=ig+sp+os;
  return { cuota:'$'+total.toLocaleString('es-AR'), integrado:'$'+ig.toLocaleString('es-AR'), sipa:'$'+sp.toLocaleString('es-AR'), resumen:`Categoría ${c}: cuota total $${total.toLocaleString('es-AR')}/mes.` };
}
