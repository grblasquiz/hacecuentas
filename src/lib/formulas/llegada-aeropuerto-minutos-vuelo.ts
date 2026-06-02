/**
 * Calculadora: Hora exacta para llegar al aeropuerto
 */
export interface LlegadaAeropuertoMinutosVueloInputs {
  horaVuelo: number;
  minutosVuelo: number;
  tipoVuelo: string;
  tiempoTrasladoMin: number;
}
export interface LlegadaAeropuertoMinutosVueloOutputs {
  horaAeropuerto: string;
  horaSalidaCasa: string;
  horaGate: string;
  _insight?: any;
}
function fmt(totalMin: number): string {
  const t = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  const m = Math.round(t % 60);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}
export function llegadaAeropuertoMinutosVuelo(i: LlegadaAeropuertoMinutosVueloInputs): LlegadaAeropuertoMinutosVueloOutputs {
  const hV = Number(i.horaVuelo);
  const mV = Number(i.minutosVuelo);
  const tipo = String(i.tipoVuelo || "internacional");
  const trans = Number(i.tiempoTrasladoMin);
  if (isNaN(hV) || hV < 0 || hV > 23) throw new Error("Hora inválida");
  if (isNaN(mV) || mV < 0 || mV > 59) throw new Error("Minutos inválidos");
  if (!trans || trans < 0) throw new Error("Traslado inválido");
  const totalVuelo = hV * 60 + mV;
  const anticipo = tipo === "internacional" ? 180 : 120;
  const totalAero = totalVuelo - anticipo;
  const totalCasa = totalAero - trans;
  const totalGate = totalVuelo - 30;

  const horaCasaNorm = ((totalCasa % 1440) + 1440) % 1440;
  const hCasa = Math.floor(horaCasaNorm / 60);
  const cruzaDiaAnterior = totalCasa < 0;
  const madrugada = hCasa < 6;
  const anticipoTxt = tipo === 'internacional' ? '3 horas' : '2 horas';

  const insight = {
    title: 'Tu plan para no perder el vuelo',
    text:
      `Para un vuelo **${tipo}** que sale ${fmt(totalVuelo)}, presentate en el aeropuerto a las **${fmt(totalAero)}** (${anticipoTxt} antes) y salí de casa **${fmt(totalCasa)}**${cruzaDiaAnterior ? ' del día anterior' : ''} contando **${trans} min** de traslado. El embarque suele cerrar cerca de las **${fmt(totalGate)}**.` +
      (cruzaDiaAnterior
        ? ' Atención: la salida cae el día previo, dejá todo listo la noche anterior.'
        : madrugada
          ? ' Es salida de madrugada: agendá alarma y coordiná el transporte con anticipación.'
          : ''),
    tone: (cruzaDiaAnterior || madrugada ? 'warn' : 'neutral') as 'warn' | 'neutral',
    icon: '✈️',
  };

  return {
    horaAeropuerto: fmt(totalAero),
    horaSalidaCasa: fmt(totalCasa),
    horaGate: fmt(totalGate),
    _insight: insight
  };
}
