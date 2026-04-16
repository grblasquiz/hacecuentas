/** Fecha probable de parto (FPP) — regla de Naegele */
export interface Inputs { fechaUltimaMenstruacion: string; }
export interface Outputs {
  fechaProbableParto: string;
  semanasEmbarazo: number;
  diasEmbarazo: number;
  trimestre: number;
  fechaControl: string;
}

export function fechaParto(i: Inputs): Outputs {
  const fum = i.fechaUltimaMenstruacion;
  if (!fum) throw new Error('Ingresá la fecha de última menstruación');
  const fecha = new Date(fum + 'T00:00:00');
  if (isNaN(fecha.getTime())) throw new Error('Fecha inválida');

  // Naegele: FUM + 280 días (40 semanas)
  const fpp = new Date(fecha);
  fpp.setDate(fpp.getDate() + 280);

  const hoy = new Date();
  const diasTranscurridos = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
  const semanas = Math.floor(diasTranscurridos / 7);
  const dias = diasTranscurridos % 7;

  let trim = 1;
  if (semanas >= 27) trim = 3;
  else if (semanas >= 13) trim = 2;

  // Próximo control (cada 4 semanas hasta sem 28, luego cada 2 semanas hasta 36, luego semanal)
  const proxControl = new Date(hoy);
  if (semanas < 28) proxControl.setDate(proxControl.getDate() + 28);
  else if (semanas < 36) proxControl.setDate(proxControl.getDate() + 14);
  else proxControl.setDate(proxControl.getDate() + 7);

  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

  return {
    fechaProbableParto: fmt(fpp),
    semanasEmbarazo: semanas,
    diasEmbarazo: dias,
    trimestre: trim,
    fechaControl: fmt(proxControl),
  };
}
