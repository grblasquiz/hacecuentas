/** Calcula cuándo toca el próximo cambio de aceite según kilometraje */
export interface Inputs {
  kmActual: number;
  kmUltimoCambio: number;
  intervaloKm: number;
}
export interface Outputs {
  kmRestantes: number;
  kmProximoCambio: number;
  porcentajeUso: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function cambioAceiteKilometraje(i: Inputs): Outputs {
  const actual = Number(i.kmActual);
  const ultimo = Number(i.kmUltimoCambio);
  const intervalo = Number(i.intervaloKm);

  if (actual < 0) throw new Error('El kilometraje actual no puede ser negativo');
  if (ultimo < 0) throw new Error('El kilometraje del último cambio no puede ser negativo');
  if (actual < ultimo) throw new Error('El kilometraje actual debe ser mayor o igual al del último cambio');
  if (!intervalo || intervalo < 3000 || intervalo > 20000) throw new Error('El intervalo debe estar entre 3.000 y 20.000 km');

  const kmRecorridos = actual - ultimo;
  const kmProximoCambio = ultimo + intervalo;
  const kmRestantes = kmProximoCambio - actual;
  const porcentajeUso = (kmRecorridos / intervalo) * 100;

  let estado = '';
  if (kmRestantes <= 0) {
    estado = '⚠️ YA TE PASASTE — cambiá el aceite ya';
  } else if (porcentajeUso >= 80) {
    estado = 'Agendá el cambio pronto';
  } else if (porcentajeUso >= 50) {
    estado = 'A mitad del intervalo';
  } else {
    estado = 'Todavía falta';
  }

  const pctCap = Number(Math.min(100, porcentajeUso).toFixed(1));
  const kmRestOut = Math.max(0, kmRestantes);

  let tone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (kmRestantes <= 0) {
    tone = 'warn';
    insightText = `Ya superaste el intervalo: deberías haber cambiado el aceite a los **${kmProximoCambio.toLocaleString('es-AR')} km** y vas **${Math.abs(kmRestantes).toLocaleString('es-AR')} km** pasado. Rodar con aceite vencido acelera el desgaste del motor — agendalo ya.`;
  } else if (porcentajeUso >= 80) {
    tone = 'warn';
    insightText = `Llevás **${porcentajeUso.toFixed(0)}%** del intervalo consumido y te quedan solo **${kmRestOut.toLocaleString('es-AR')} km**. Conviene reservar turno ahora para no pasarte del cambio.`;
  } else if (porcentajeUso >= 50) {
    tone = 'neutral';
    insightText = `Vas por la mitad del ciclo (**${porcentajeUso.toFixed(0)}%**): te quedan **${kmRestOut.toLocaleString('es-AR')} km** antes del próximo cambio a los **${kmProximoCambio.toLocaleString('es-AR')} km**. Sin urgencia, pero tenelo en el radar.`;
  } else {
    tone = 'good';
    insightText = `Recién vas **${porcentajeUso.toFixed(0)}%** del intervalo: tenés **${kmRestOut.toLocaleString('es-AR')} km** de margen hasta el próximo cambio. El aceite está fresco, podés rodar tranquilo.`;
  }

  return {
    kmRestantes: kmRestOut,
    kmProximoCambio,
    porcentajeUso: pctCap,
    detalle: `Recorriste ${kmRecorridos.toLocaleString('es-AR')} km desde el último cambio (${porcentajeUso.toFixed(0)}% del intervalo). Próximo cambio a los ${kmProximoCambio.toLocaleString('es-AR')} km. ${kmRestantes > 0 ? `Faltan ${kmRestantes.toLocaleString('es-AR')} km.` : ''} ${estado}.`,
    _insight: {
      title: 'Estado del aceite',
      text: insightText,
      tone,
      icon: '🛢️',
    },
    _chart: {
      type: 'scale',
      marker: pctCap,
      markerLabel: `${pctCap.toFixed(0)}% usado`,
      min: 0,
      segments: [
        { nombre: 'Holgado', max: 50, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'A mitad', max: 80, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Cambiá pronto', max: 100, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Vencido', max: 110, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Uso del intervalo de aceite: ${pctCap.toFixed(0)}% consumido`,
    },
  };
}
