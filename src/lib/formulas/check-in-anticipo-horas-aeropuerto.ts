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
  _insight?: any;
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
  const tiempoTxt = m > 0 ? `${h} h ${m} min` : `${h} h`;
  const tipoTxt = tipo === "internacional" ? "vuelo internacional" : "vuelo doméstico";
  const eqTxt = eq === "mano" ? "solo equipaje de mano" : "equipaje a bodega";
  const sizeTxt = size === "grande" ? "un aeropuerto grande" : size === "pequeno" ? "un aeropuerto chico" : "un aeropuerto mediano";
  return {
    horasAnticipo: Number(base.toFixed(1)),
    horaSalida: `${h}h ${m}min antes del vuelo`,
    desglose: "Check-in (30-45min) + Security (15-30min) + Migraciones (20-45min) + caminar y buffer.",
    _insight: {
      title: 'A qué hora salir de casa',
      text: `Para un ${tipoTxt} con ${eqTxt} desde ${sizeTxt}, presentate **${tiempoTxt} antes** del despegue. Sumale aparte el viaje hasta el aeropuerto: el reloj arranca al pisar la terminal, no al salir de casa.`,
      tone: tipo === "internacional" ? 'warn' : 'neutral',
      icon: '✈️',
    },
  };
}
