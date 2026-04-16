/** Sueldo por segundo */
export interface Inputs { sueldo: number; horasSemana: number; }
export interface Outputs { porSegundo: number; porMinuto: number; porHora: number; porDia: number; mientras8hSueno: number; mensaje: string; }

export function cuantoGanoPorSegundo(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo);
  const horasSemana = Number(i.horasSemana) || 40;
  if (!sueldo || sueldo <= 0) throw new Error('Ingresá tu sueldo');

  const horasMes = horasSemana * 4.33;
  const porHora = Math.round(sueldo / horasMes);
  const porMinuto = Number((porHora / 60).toFixed(2));
  const porSegundo = Number((porMinuto / 60).toFixed(4));
  const porDia = Math.round(sueldo / 22);
  const mientras8hSueno = Math.round(porHora * 8);

  return {
    porSegundo, porMinuto, porHora, porDia, mientras8hSueno,
    mensaje: `Ganás $${porSegundo}/seg, $${porMinuto}/min, $${porHora.toLocaleString()}/hora. En 8h de sueño: $${mientras8hSueno.toLocaleString()}.`
  };
}