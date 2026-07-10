import { doughnut, money, n, round } from './_ocio-costos';

export function costoStreamingArgentina(i: any) {
  const netflix = n(i.netflix);
  const disney = n(i.disney);
  const max = n(i.max);
  const prime = n(i.prime);
  const spotify = n(i.spotify);
  const youtube = n(i.youtube);
  const otros = n(i.otros);
  const meses = Math.max(1, n(i.meses, 12));
  const objetivo = n(i.objetivoAhorro);
  const mensual = netflix + disney + max + prime + spotify + youtube + otros;
  if (mensual <= 0) throw new Error('Ingresá al menos una suscripción');
  const anual = mensual * 12;
  const periodo = mensual * meses;
  const mesesParaObjetivo = objetivo > 0 ? Math.ceil(objetivo / mensual) : 0;
  const slices = [
    { label: 'Netflix', value: netflix },
    { label: 'Disney+', value: disney },
    { label: 'Max', value: max },
    { label: 'Prime', value: prime },
    { label: 'Spotify', value: spotify },
    { label: 'YouTube', value: youtube },
    { label: 'Otros', value: otros },
  ];

  return {
    mensual: round(mensual),
    anual: round(anual),
    periodo: round(periodo),
    mesesParaObjetivo,
    ahorroSiCortasMitad: round(mensual * 0.5 * 12),
    _chart: doughnut(slices, mensual, 'Composición mensual del gasto en plataformas'),
    _insight: {
      title: 'Suscripciones acumuladas',
      text: `Tus plataformas suman **${money(mensual)} por mes** y **${money(anual)} por año**. Cortar o compartir la mitad del gasto liberaría cerca de **${money(mensual * 0.5 * 12)} al año**.`,
      tone: mensual > 50000 ? 'warn' : 'neutral',
      icon: '📺',
    },
  };
}
