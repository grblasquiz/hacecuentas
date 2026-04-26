/** Percentil mundial Hyrox según tiempo, edad y categoría */
export interface Inputs { tiempoMinutos: number; edad: number; categoria: 'open' | 'pro' | 'doubles'; sexo: 'masculino' | 'femenino'; }
export interface Outputs { percentil: number; categoriaTiempo: string; tiempoVsMedianaMin: number; explicacion: string; }
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
  return {
    percentil: Number(percentil.toFixed(0)),
    categoriaTiempo: cat,
    tiempoVsMedianaMin: Number((t - medianaAjustada).toFixed(1)),
    explicacion: `Tiempo ${t} min en Hyrox ${i.categoria} ${i.sexo} (edad ${edad}): percentil ~${percentil.toFixed(0)} mundial — **${cat}**. Mediana ajustada por edad: ${medianaAjustada.toFixed(1)} min.`,
  };
}
