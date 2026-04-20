export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function visaNomadaDigitalPortugalEspana(i: Inputs): Outputs {
  const p=String(i.pais||'portugal');
  const data={'portugal':{ing:3040,dur:'1-2 años renovable',req:'Ingresos 4x salario mínimo pt, seguro médico, antecedentes penales, alquiler pt.'},'espana':{ing:2640,dur:'1-3 años',req:'Ingresos 2x SMI, contrato remoto +1 año antigüedad, seguro médico.'},'estonia':{ing:4500,dur:'1 año',req:'Ingresos altos, trabajo remoto, no para ciudadanos UE.'},'croacia':{ing:2300,dur:'1 año',req:'Ingresos suficientes, seguro médico, alojamiento hr.'}};
  const d=data[p];
  return { ingresoMinimoMes:`EUR ${d.ing}/mes`, duracion:d.dur, requisitos:d.req };
}
