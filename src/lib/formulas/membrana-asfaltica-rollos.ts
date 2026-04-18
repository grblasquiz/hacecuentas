export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function membranaAsfalticaRollos(i: Inputs): Outputs {
  const m = Number(i.m2) || 0;
  const rollos = Math.ceil((m * 1.1) / 10);
  return { rollos: rollos.toString(), resumen: `${rollos} rollos para ${m} m² (incluyendo 10% solape).` };
}
