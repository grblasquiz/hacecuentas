/** Percentil mundial Hyrox según tiempo, edad y categoría */
export interface Inputs { tiempoMinutos: number; edad: number; categoria: 'open' | 'pro' | 'doubles'; sexo: 'masculino' | 'femenino'; }
export interface Outputs { percentil: number; categoriaTiempo: string; tiempoVsMedianaMin: number; explicacion: string; _chart?: any; }
export function hyroxTiempoEdadCategoriaMundial(i: Inputs): Outputs {
  const t = Number(i.tiempoMinutos);
  const edad = Number(i.edad);
  if (!t || t <= 0) throw new Error('Ingresá tiempo en minutos');
  if (!edad || edad < 16 || edad > 90) throw new Error('Edad debe estar entre 16 y 90 años');
  // Medianas globales aprox por categoría (minutos), abril 2026
  const medianas: Record<string, Record<string, number>> = {
    open: { masculino: 78, femenino: 92 },
    pro: { masculino: 70, femenino: 84 },
    doubles: { masculino: 75, femenino: 88 },
  };
  const mediana = medianas[i.categoria]?.[i.sexo] || 80;
  // Ajuste por edad: cada año >35, +0.4 min; cada año <30, -0.2 min
  let medianaAjustada = mediana;
  if (edad > 35) medianaAjustada += (edad - 35) * 0.4;
  if (edad < 30) medianaAjustada -= (30 - edad) * 0.2;
  // Percentil: tiempo por debajo de mediana = top
  // Aproximación: cada 10% más rápido = +25 percentiles
  const ratio = (medianaAjustada - t) / medianaAjustada;
  let percentil = 50 + ratio * 250;
  percentil = Math.max(1, Math.min(99, percentil));
  let cat: string;
  if (percentil >= 95) cat = 'Elite mundial';
  else if (percentil >= 80) cat = 'Top amateur';
  else if (percentil >= 60) cat = 'Avanzado';
  else if (percentil >= 40) cat = 'Intermedio';
  else if (percentil >= 20) cat = 'Principiante avanzado';
  else cat = 'Finisher';
  const percentilRedondeado = Number(percentil.toFixed(0));
  const chart = {
    type: 'scale' as const,
    marker: percentilRedondeado,
    markerLabel: 'Tu percentil: ' + percentilRedondeado,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Finisher', max: 20, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Principiante avanzado', max: 40, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Intermedio', max: 60, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Avanzado', max: 80, color: '#d9f99d', colorDark: '#4d7c0f' },
      { nombre: 'Top amateur', max: 95, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Elite mundial', max: 100, color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de percentil mundial Hyrox: de Finisher a Elite mundial',
  };

  return {
    percentil: percentilRedondeado,
    categoriaTiempo: cat,
    tiempoVsMedianaMin: Number((t - medianaAjustada).toFixed(1)),
    explicacion: `Tiempo ${t} min en Hyrox ${i.categoria} ${i.sexo} (edad ${edad}): percentil ~${percentil.toFixed(0)} mundial — **${cat}**. Mediana ajustada por edad: ${medianaAjustada.toFixed(1)} min.`,
    _chart: chart,
  };
}
