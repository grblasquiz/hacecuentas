/** ¿Cuándo hacerse el test de embarazo? */
export interface Inputs { fumTest: string; duracionCicloTest: number; }
export interface Outputs { testSangre: string; testOrina: string; ovulacionEstimada: string; nota: string; }

export function testEmbarazoCuando(i: Inputs): Outputs {
  const parts = String(i.fumTest || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const fum = new Date(yy, mm - 1, dd);
  if (isNaN(fum.getTime())) throw new Error('Ingresá una fecha válida');
  const ciclo = Number(i.duracionCicloTest) || 28;

  const diaOvulacion = ciclo - 14;
  const ovulacion = new Date(fum.getTime());
  ovulacion.setDate(ovulacion.getDate() + diaOvulacion);

  // Test sangre: 8-10 DPO
  const sangre = new Date(ovulacion.getTime());
  sangre.setDate(sangre.getDate() + 9);

  // Test orina: 14 DPO = día de falta
  const orina = new Date(fum.getTime());
  orina.setDate(orina.getDate() + ciclo);

  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  return {
    testSangre: fmt(sangre),
    testOrina: fmt(orina),
    ovulacionEstimada: fmt(ovulacion),
    nota: 'Para mayor confiabilidad, hacé el test con la primera orina de la mañana. Si da negativo pero no viene la menstruación, repetí en 3-5 días.',
  };
}
