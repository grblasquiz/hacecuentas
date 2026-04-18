export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function nivelesDeleDalfGoetheHskEquivalencia(i: Inputs): Outputs {
  const e=String(i.examen||'dele'); const n=String(i.nivel||'inter');
  const niv:Record<string,Record<string,string>>={dele:{elem:'A1/A2',inter:'B1/B2',avan:'C1',sup:'C2'},dalf:{elem:'A1/A2',inter:'B1/B2',avan:'C1',sup:'C2'},goethe:{elem:'A1/A2',inter:'B1/B2',avan:'C1',sup:'C2'},hsk:{elem:'HSK1-2 (A1)',inter:'HSK3-4 (B1)',avan:'HSK5 (B2/C1)',sup:'HSK6 (C2)'},jlpt:{elem:'N5-N4 (A1-A2)',inter:'N3 (B1)',avan:'N2 (B2/C1)',sup:'N1 (C1/C2)'}};
  const nmap:Record<string,string>={elem:'Elemental',inter:'Intermedio',avan:'Avanzado',sup:'Superior'};
  return { mcer:niv[e][n]||'—', examenLiteral:`${e.toUpperCase()} ${nmap[n]}`, resumen:`${e.toUpperCase()} ${nmap[n]}: ${niv[e][n]||'N/A'}.` };
}
