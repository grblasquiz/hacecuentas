export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function propinaPaisPorcentajeCostumbreCultural(i: Inputs): Outputs {
  const p=String(i.pais||'eeuu');
  const data={'eeuu':{pct:'18-22%',cost:'Esencial. Sueldos bajos + propinas.',nota:'Ubers 15-20%. Taxis 15%.'},'europa':{pct:'5-10%',cost:'Opcional. Verificar si está incluido.',nota:'Italia/Francia: 5%. Alemania: redondear.'},'japon':{pct:'0%',cost:'No aceptada. Considerada ofensiva.',nota:'Servicio ya incluido en cultura.'},'mexico':{pct:'10-15%',cost:'Estándar.',nota:'15% si buen servicio.'},'brasil':{pct:'10%',cost:'Suele estar incluido.',nota:'Verificar recibo "10% serviço".'},'argentina':{pct:'10%',cost:'Opcional pero esperada.',nota:'Redondear si no es redondo.'},'uk':{pct:'10-15%',cost:'Si no está en cuenta.',nota:'Pubs: 0%. Taxis: redondear.'},'australia':{pct:'0-10%',cost:'No obligatoria.',nota:'Solo si muy buen servicio.'}};
  const d=data[p];

  const nombre={'eeuu':'Estados Unidos','europa':'Europa','japon':'Japón','mexico':'México','brasil':'Brasil','argentina':'Argentina','uk':'Reino Unido','australia':'Australia'}[p]||p;
  // Tono según qué tan obligatoria es la propina (riesgo de quedar mal)
  const obligatoria=d.cost.toLowerCase().startsWith('esencial')||d.cost.toLowerCase().startsWith('estándar');
  const noAceptada=d.pct==='0%';
  const tone:'good'|'warn'|'neutral'=obligatoria?'warn':noAceptada?'good':'neutral';
  const text=noAceptada
    ? `En **${nombre}** la propina **no se acostumbra** y puede resultar ofensiva: no dejes nada extra, el servicio ya está incluido en la cultura.`
    : obligatoria
      ? `En **${nombre}** la propina es **${d.pct} y se da por hecho** (${d.cost.toLowerCase()}). Por debajo de ese rango podés quedar mal: ${d.nota}`
      : `En **${nombre}** la propina ronda **${d.pct}** y es más bien opcional (${d.cost.toLowerCase()}). ${d.nota}`;

  const _insight={
    title:`Propina en ${nombre}`,
    text,
    tone,
    icon:'🌍',
  };

  return { porcentajeSugerido:d.pct, costumbre:d.cost, nota:d.nota, _insight };
}
