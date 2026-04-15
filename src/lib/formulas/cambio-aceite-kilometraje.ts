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

  return {
    kmRestantes: Math.max(0, kmRestantes),
    kmProximoCambio,
    porcentajeUso: Number(Math.min(100, porcentajeUso).toFixed(1)),
    detalle: `Recorriste ${kmRecorridos.toLocaleString('es-AR')} km desde el último cambio (${porcentajeUso.toFixed(0)}% del intervalo). Próximo cambio a los ${kmProximoCambio.toLocaleString('es-AR')} km. ${kmRestantes > 0 ? `Faltan ${kmRestantes.toLocaleString('es-AR')} km.` : ''} ${estado}.`,
  };
}
