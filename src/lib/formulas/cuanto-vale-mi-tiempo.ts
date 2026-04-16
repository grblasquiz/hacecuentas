/** Cuánto vale mi tiempo */
export interface Inputs { sueldo: number; horasTrabajoSemana: number; trasladoDiarioMin: number; }
export interface Outputs { valorHora: number; valorMinuto: number; horasRealesMes: number; mensaje: string; }

export function cuantoValeMiTiempo(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo);
  const horasSemana = Number(i.horasTrabajoSemana) || 45;
  const trasladoMin = Number(i.trasladoDiarioMin) || 0;
  if (!sueldo || sueldo <= 0) throw new Error('Ingresá tu sueldo');

  const diasLab = 22; // average working days/month
  const trasladoHorasMes = (trasladoMin / 60) * diasLab;
  const horasTrabajoMes = (horasSemana / 5) * diasLab;
  const horasRealesMes = Math.round(horasTrabajoMes + trasladoHorasMes);

  const valorHora = Math.round(sueldo / horasRealesMes);
  const valorMinuto = Math.round(valorHora / 60);

  return {
    valorHora, valorMinuto, horasRealesMes,
    mensaje: `Tu hora real vale $${valorHora.toLocaleString()}. Dedicás ${horasRealesMes}h/mes al trabajo (${Math.round(horasTrabajoMes)}h trabajo + ${Math.round(trasladoHorasMes)}h traslado).`
  };
}