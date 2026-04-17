/**
 * Calculadora de Horas de Anticipo al Aeropuerto
 */
export interface CheckInAnticipoHorasAeropuertoInputs {
  tipoVuelo: string;
  equipaje: string;
  aeropuertoSize: string;
}
export interface CheckInAnticipoHorasAeropuertoOutputs {
  horasAnticipo: number;
  horaSalida: string;
  desglose: string;
}
export function checkInAnticipoHorasAeropuerto(i: CheckInAnticipoHorasAeropuertoInputs): CheckInAnticipoHorasAeropuertoOutputs {
  const tipo = String(i.tipoVuelo || "internacional");
  const eq = String(i.equipaje || "bodega");
  const size = String(i.aeropuertoSize || "mediano");
  let base = tipo === "internacional" ? 3 : 2;
  if (tipo === "internacional" && eq === "mano") base = 2.5;
  if (tipo === "domestico" && eq === "mano") base = 1.5;
  if (size === "grande") base += 0.5;
  if (size === "pequeno") base -= 0.25;
  const h = Math.floor(base);
  const m = Math.round((base - h) * 60);
  return {
    horasAnticipo: Number(base.toFixed(1)),
    horaSalida: `${h}h ${m}min antes del vuelo`,
    desglose: "Check-in (30-45min) + Security (15-30min) + Migraciones (20-45min) + caminar y buffer."
  };
}
