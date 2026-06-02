/** Cuánto vale mi tiempo */
export interface Inputs { sueldo: number; horasTrabajoSemana: number; trasladoDiarioMin: number; }
export interface Outputs { valorHora: number; valorMinuto: number; horasRealesMes: number; mensaje: string; _insight?: any; _chart?: any; }

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

  const hTrabajo = Math.round(horasTrabajoMes);
  const hTraslado = Math.round(trasladoHorasMes);
  const pctTraslado = horasRealesMes > 0 ? Math.round((hTraslado / horasRealesMes) * 100) : 0;
  const costoTrasladoMes = valorHora * hTraslado;

  const tieneTraslado = trasladoMin > 0;
  const insightTone: "good" | "warn" | "neutral" = pctTraslado >= 15 ? "warn" : "neutral";
  const insightText = tieneTraslado
    ? `Tu hora real vale **$${valorHora.toLocaleString("es-AR")}**. El traslado se come **${hTraslado}h/mes** (${pctTraslado}% de tu tiempo laboral): a tu valor por hora, eso equivale a **$${costoTrasladoMes.toLocaleString("es-AR")}** mensuales de tiempo no pago.`
    : `Tu hora real vale **$${valorHora.toLocaleString("es-AR")}** sobre **${horasRealesMes}h/mes**. Sin traslado declarado, casi todo tu tiempo cuenta como trabajo efectivo.`;

  const out: Outputs = {
    valorHora, valorMinuto, horasRealesMes,
    mensaje: `Tu hora real vale $${valorHora.toLocaleString()}. Dedicás ${horasRealesMes}h/mes al trabajo (${hTrabajo}h trabajo + ${hTraslado}h traslado).`,
    _insight: {
      title: "Lo que cuesta tu tiempo",
      text: insightText,
      tone: insightTone,
      icon: "⏳"
    }
  };

  if (tieneTraslado) {
    out._chart = {
      type: "doughnut",
      slices: [
        { label: "Trabajo", value: hTrabajo },
        { label: "Traslado", value: hTraslado }
      ],
      prefix: "",
      centerValue: `${horasRealesMes} h`,
      centerLabel: "tiempo/mes",
      ariaLabel: `Distribución de tus ${horasRealesMes} horas mensuales: ${hTrabajo} de trabajo y ${hTraslado} de traslado`
    };
  }

  return out;
}