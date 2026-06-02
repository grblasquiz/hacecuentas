export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function visaNomadaDigitalPortugalEspana(i: Inputs): Outputs {
  const p=String(i.pais||'portugal');
  const data={'portugal':{ing:3040,dur:'1-2 años renovable',req:'Ingresos 4x salario mínimo pt, seguro médico, antecedentes penales, alquiler pt.'},'espana':{ing:2640,dur:'1-3 años',req:'Ingresos 2x SMI, contrato remoto +1 año antigüedad, seguro médico.'},'estonia':{ing:4500,dur:'1 año',req:'Ingresos altos, trabajo remoto, no para ciudadanos UE.'},'croacia':{ing:2300,dur:'1 año',req:'Ingresos suficientes, seguro médico, alojamiento hr.'}};
  const d=data[p];
  const nombrePais={'portugal':'Portugal','espana':'España','estonia':'Estonia','croacia':'Croacia'}[p]||p;
  const _insight = {
    title: `Visa nómada digital — ${nombrePais}`,
    text: `Para la visa de ${nombrePais} tenés que acreditar **EUR ${d.ing.toLocaleString('es-AR')}/mes** de ingresos estables (trabajo remoto), y dura **${d.dur}**. Es el filtro clave: si tu sueldo neto en euros queda por debajo, te la rechazan.`,
    tone: "neutral" as const,
    icon: "💻",
  };
  return { ingresoMinimoMes:`EUR ${d.ing}/mes`, duracion:d.dur, requisitos:d.req, _insight };
}
