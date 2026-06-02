export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; _chart?: any; }
export function nivelesDeleDalfGoetheHskEquivalencia(i: Inputs): Outputs {
  const e=String(i.examen||'dele'); const n=String(i.nivel||'inter');
  const niv:Record<string,Record<string,string>>={dele:{elem:'A1/A2',inter:'B1/B2',avan:'C1',sup:'C2'},dalf:{elem:'A1/A2',inter:'B1/B2',avan:'C1',sup:'C2'},goethe:{elem:'A1/A2',inter:'B1/B2',avan:'C1',sup:'C2'},hsk:{elem:'HSK1-2 (A1)',inter:'HSK3-4 (B1)',avan:'HSK5 (B2/C1)',sup:'HSK6 (C2)'},jlpt:{elem:'N5-N4 (A1-A2)',inter:'N3 (B1)',avan:'N2 (B2/C1)',sup:'N1 (C1/C2)'}};
  const nmap:Record<string,string>={elem:'Elemental',inter:'Intermedio',avan:'Avanzado',sup:'Superior'};
  const mcer=niv[e][n]||'—';
  // Posición en la escala MCER (A1=1 … C2=6) según el nivel elegido
  const posMap:Record<string,number>={elem:2,inter:4,avan:5,sup:6};
  const pos=posMap[n]??4;
  const interp:Record<string,string>={
    elem:`Con **${e.toUpperCase()} ${nmap[n]}** estás en el tramo **${mcer}**: manejás situaciones cotidianas y frases básicas. Es el piso para certificar el idioma.`,
    inter:`Con **${e.toUpperCase()} ${nmap[n]}** llegás a **${mcer}**, el nivel que la mayoría de universidades y empleadores piden como umbral funcional del idioma.`,
    avan:`Con **${e.toUpperCase()} ${nmap[n]}** alcanzás **${mcer}**: usás el idioma con fluidez en contextos académicos y profesionales exigentes.`,
    sup:`Con **${e.toUpperCase()} ${nmap[n]}** llegás a **${mcer}**, el techo del MCER: dominio casi nativo, equivalente al nivel más alto de la escala.`,
  };
  return {
    mcer,
    examenLiteral:`${e.toUpperCase()} ${nmap[n]}`,
    resumen:`${e.toUpperCase()} ${nmap[n]}: ${niv[e][n]||'N/A'}.`,
    _insight:{
      title:'Tu lugar en la escala MCER',
      text:interp[n]||`Equivale a **${mcer}** en el Marco Común Europeo.`,
      tone: n==='sup'||n==='avan' ? 'good' : 'neutral',
      icon:'🗣️',
    },
    _chart:{
      type:'scale',
      marker:pos,
      markerLabel:mcer,
      min:0,
      segments:[
        {nombre:'A1',max:1,color:'#fca5a5',colorDark:'#7f1d1d'},
        {nombre:'A2',max:2,color:'#fdba74',colorDark:'#7c2d12'},
        {nombre:'B1',max:3,color:'#fde047',colorDark:'#713f12'},
        {nombre:'B2',max:4,color:'#bef264',colorDark:'#365314'},
        {nombre:'C1',max:5,color:'#86efac',colorDark:'#14532d'},
        {nombre:'C2',max:6,color:'#6ee7b7',colorDark:'#064e3b'},
      ],
      ariaLabel:`${e.toUpperCase()} ${nmap[n]} ubicado en ${mcer} dentro de la escala MCER de A1 a C2`,
    },
  };
}
