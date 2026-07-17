import { doughnut, money, n, positive, round } from './_ocio-costos';

export function hotelVsAlquilerTemporarioEscapada(i: any) {
  const noches = positive(i.noches, 'las noches');
  const personas = positive(i.personas, 'la cantidad de personas');
  const hotelTotal = noches * n(i.hotelNoche) + personas * Math.max(1, noches + 1) * n(i.comidaHotelPersonaDia) + n(i.transporteHotel);
  const alquilerTotal = noches * n(i.alquilerNoche) + n(i.limpiezaAlquiler) + n(i.comisionAlquiler) + personas * Math.max(1, noches + 1) * n(i.comidaAlquilerPersonaDia) + n(i.transporteAlquiler);
  const diferencia = hotelTotal - alquilerTotal;
  const ganador = diferencia > 0 ? 'Alquiler temporario' : diferencia < 0 ? 'Hotel' : 'Empate';
  const ahorro = Math.abs(diferencia);

  return {
    hotelTotal: round(hotelTotal),
    alquilerTotal: round(alquilerTotal),
    diferencia: round(diferencia),
    ahorro: round(ahorro),
    ganador,
    porPersonaHotel: round(hotelTotal / personas),
    porPersonaAlquiler: round(alquilerTotal / personas),
    _chart: doughnut([
      { label: 'Hotel', value: hotelTotal },
      { label: 'Alquiler temporario', value: alquilerTotal },
    ], Math.max(hotelTotal, alquilerTotal), 'Comparación hotel vs alquiler temporario'),
    _insight: {
      title: `${ganador} conviene más`,
      text: diferencia === 0
        ? `Hotel y alquiler temporario quedan prácticamente iguales para **${personas} personas** y **${noches} noches**.`
        : `${ganador} queda **${money(ahorro)} más barato** para **${personas} personas** y **${noches} noches**.`,
      tone: 'neutral',
      icon: '🏨',
    },
  };
}
