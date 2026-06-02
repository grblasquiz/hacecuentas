/** Cuenta regresiva: días, horas, minutos hasta una fecha */
export interface Inputs { fechaObjetivo: string; }
export interface Outputs {
  diasTotales: number;
  horasTotales: number;
  minutosTotales: number;
  semanas: number;
  meses: number;
  resumen: string;
  _insight?: any;
}

export function cuentaRegresiva(i: Inputs): Outputs {
  const parts = String(i.fechaObjetivo || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const destino = new Date(yy, mm - 1, dd);
  if (isNaN(destino.getTime())) throw new Error('Ingresá una fecha válida');

  const hoy = new Date();
  const diffMs = destino.getTime() - hoy.getTime();

  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const horas = Math.ceil(diffMs / (1000 * 60 * 60));
  const minutos = Math.ceil(diffMs / (1000 * 60));
  const semanas = Math.floor(dias / 7);
  const meses = Math.floor(dias / 30.44);

  let resumen = '';
  if (dias < 0) resumen = `Hace ${Math.abs(dias)} días que pasó esa fecha.`;
  else if (dias === 0) resumen = '¡Es hoy!';
  else if (dias === 1) resumen = 'Falta 1 día (mañana).';
  else if (dias < 7) resumen = `Faltan ${dias} días.`;
  else if (dias < 60) resumen = `Faltan ${dias} días (${semanas} semanas).`;
  else resumen = `Faltan ${dias} días (aprox. ${meses} meses).`;

  let _insight: any;
  if (dias < 0) {
    _insight = {
      title: "Fecha pasada",
      text: `Esa fecha ya quedó atrás: pasaron **${Math.abs(dias)} días**. La cuenta regresiva está en negativo.`,
      tone: "neutral",
      icon: "🗓️",
    };
  } else if (dias === 0) {
    _insight = {
      title: "¡Es hoy!",
      text: `El día llegó: la cuenta regresiva marca **0 días**. Quedan apenas **${Math.max(0, horas)} horas**.`,
      tone: "good",
      icon: "🎯",
    };
  } else {
    _insight = {
      title: "Cuenta regresiva activa",
      text: `Faltan **${dias} días** (${horas.toLocaleString("es-AR")} horas o ${minutos.toLocaleString("es-AR")} minutos). Son unas **${semanas} semanas**${meses >= 2 ? ` / ${meses} meses` : ""}.`,
      tone: "neutral",
      icon: "⏳",
    };
  }

  return {
    diasTotales: dias,
    horasTotales: horas,
    minutosTotales: minutos,
    semanas,
    meses,
    resumen,
    _insight,
  };
}
