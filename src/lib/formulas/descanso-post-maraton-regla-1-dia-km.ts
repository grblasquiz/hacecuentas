export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function descansoPostMaratonRegla1DiaKm(i: Inputs): Outputs {
  const km = Number(i.kmCarrera) || 0;
  const dias = Math.round(km / 2);
  const sem = Math.ceil(dias / 7);
  return { diasSuave: dias.toString(), semanasRestablecer: sem.toString(),
    resumen: `Descanso: ${dias} días suaves (~${sem} semanas) post ${km}km.` };
}
