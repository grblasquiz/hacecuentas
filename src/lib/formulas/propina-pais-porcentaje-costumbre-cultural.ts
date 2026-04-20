export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function propinaPaisPorcentajeCostumbreCultural(i: Inputs): Outputs {
  const p=String(i.pais||'eeuu');
  const data={'eeuu':{pct:'18-22%',cost:'Esencial. Sueldos bajos + propinas.',nota:'Ubers 15-20%. Taxis 15%.'},'europa':{pct:'5-10%',cost:'Opcional. Verificar si está incluido.',nota:'Italia/Francia: 5%. Alemania: redondear.'},'japon':{pct:'0%',cost:'No aceptada. Considerada ofensiva.',nota:'Servicio ya incluido en cultura.'},'mexico':{pct:'10-15%',cost:'Estándar.',nota:'15% si buen servicio.'},'brasil':{pct:'10%',cost:'Suele estar incluido.',nota:'Verificar recibo "10% serviço".'},'argentina':{pct:'10%',cost:'Opcional pero esperada.',nota:'Redondear si no es redondo.'},'uk':{pct:'10-15%',cost:'Si no está en cuenta.',nota:'Pubs: 0%. Taxis: redondear.'},'australia':{pct:'0-10%',cost:'No obligatoria.',nota:'Solo si muy buen servicio.'}};
  const d=data[p];
  return { porcentajeSugerido:d.pct, costumbre:d.cost, nota:d.nota };
}
