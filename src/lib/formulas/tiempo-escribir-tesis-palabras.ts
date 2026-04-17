/** ¿Cuánto tarda escribir una tesis? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  semanas: number;
  meses: number;
  desgloseEtapas: string;
}

export function tiempoEscribirTesisPalabras(i: Inputs): Outputs {
  const pal = Number(i.palabrasObjetivo) || 30000;
  const hsem = Number(i.horasSemana) || 15;
  const exp = String(i.experiencia || 'alguna');
  if (pal <= 0 || hsem <= 0) throw new Error('Datos inválidos');

  const HXP: Record<string, number> = { ninguna: 0.045, alguna: 0.035, buena: 0.025 };
  const hxp = HXP[exp] || 0.035;

  const horas = Math.round(pal * hxp);
  const sem = Math.round(horas / hsem);
  const meses = Math.round(sem / 4.33 * 10) / 10;

  const invest = Math.round(horas * 0.4);
  const draft = Math.round(horas * 0.25);
  const rev = Math.round(horas * 0.2);
  const fmt = Math.round(horas * 0.1);
  const def = horas - invest - draft - rev - fmt;

  return {
    horasTotales: horas,
    semanas: sem,
    meses,
    desgloseEtapas: `Investig ${invest}h / Draft ${draft}h / Revisiones ${rev}h / Formato ${fmt}h / Defensa ${def}h`,
  };

}
