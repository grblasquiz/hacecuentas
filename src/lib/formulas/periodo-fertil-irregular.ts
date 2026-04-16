/** Período fértil con ciclos irregulares — Ogino adaptado */
export interface Inputs { cicloMasCorto: number; cicloMasLargo: number; fumIrreg: string; }
export interface Outputs { ventanaFertil: string; inicioVentana: string; finVentana: string; recomendacion: string; }

export function periodoFertilIrregular(i: Inputs): Outputs {
  const corto = Number(i.cicloMasCorto);
  const largo = Number(i.cicloMasLargo);
  const fum = new Date(i.fumIrreg + 'T00:00:00');
  if (isNaN(fum.getTime())) throw new Error('Ingresá una fecha válida');
  if (corto < 18 || corto > 40) throw new Error('Ciclo más corto: entre 18 y 40 días');
  if (largo < 24 || largo > 50) throw new Error('Ciclo más largo: entre 24 y 50 días');
  if (largo < corto) throw new Error('El ciclo más largo debe ser mayor que el más corto');

  const diaInicio = corto - 18;
  const diaFin = largo - 11;

  const inicio = new Date(fum.getTime());
  inicio.setDate(inicio.getDate() + diaInicio);
  const fin = new Date(fum.getTime());
  fin.setDate(fin.getDate() + diaFin);

  const amplitud = diaFin - diaInicio + 1;
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  let rec = `Tu ventana fértil abarca ${amplitud} días (del día ${diaInicio + 1} al ${diaFin + 1} del ciclo).`;
  if (amplitud > 14) rec += ' Es una ventana amplia porque tus ciclos varían mucho. Te recomendamos complementar con tests de ovulación (LH) para mayor precisión.';
  else rec += ' Complementá con tests de ovulación para confirmar el día exacto.';

  return {
    ventanaFertil: `Día ${diaInicio + 1} al día ${diaFin + 1} del ciclo (${amplitud} días)`,
    inicioVentana: fmt(inicio),
    finVentana: fmt(fin),
    recomendacion: rec,
  };
}
