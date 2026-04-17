/** Tiempo Ensayo Universitario */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  horasInvestigacion: number;
  horasEscritura: number;
  horasRevision: number;
  diasConDedicacion: number;
}

export function tiempoEnsayoUniversitario(i: Inputs): Outputs {
  const pal = Number(i.palabras) || 2500;
  const tipo = String(i.tipoEnsayo || 'argumentativo');
  const fam = String(i.familiaridadTema || 'media');
  if (pal <= 0) throw new Error('Palabras inválidas');

  const HXP: Record<string, number> = {
    reflexivo: 0.003, argumentativo: 0.005, comparativo: 0.005,
    critico: 0.006, investigacion: 0.008,
  };
  const FAM: Record<string, number> = { alta: 0.8, media: 1.0, baja: 1.3 };

  const hxp = HXP[tipo] || 0.005;
  const f = FAM[fam] || 1;

  const horas = pal * hxp * f;
  const inv = Math.round(horas * 0.3 * 10) / 10;
  const esc = Math.round(horas * 0.5 * 10) / 10;
  const rev = Math.round(horas * 0.2 * 10) / 10;

  return {
    horasTotales: Math.round(horas * 10) / 10,
    horasInvestigacion: inv,
    horasEscritura: esc,
    horasRevision: rev,
    diasConDedicacion: Math.ceil(horas / 3),
  };

}
