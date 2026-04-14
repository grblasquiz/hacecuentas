export interface Inputs { sueldoMensual: number; horasSemana: number; }
export interface Outputs { valorHora: number; valorDia: number; valorMinuto: number; horasMes: number; }

export function sueldoHora(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual);
  const horasSem = Number(i.horasSemana) || 40;
  if (!sueldo || sueldo <= 0) throw new Error('Ingresá el sueldo mensual');
  if (horasSem <= 0 || horasSem > 84) throw new Error('Horas semanales inválidas');
  const horasMes = horasSem * 52 / 12; // 52 semanas / 12 meses
  const valorHora = sueldo / horasMes;
  return {
    valorHora: Math.round(valorHora),
    valorDia: Math.round(valorHora * (horasSem / 5)),
    valorMinuto: Math.round(valorHora / 60),
    horasMes: Number(horasMes.toFixed(1)),
  };
}
