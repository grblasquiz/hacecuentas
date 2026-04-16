/** Calendario de vacunas del bebé — Argentina */
export interface Inputs { fechaNacimiento: string; }
export interface Outputs { proximaVacuna: string; calendario: string; vacunasAlDia: string; nota: string; }

const esquema = [
  { meses: 0, vacunas: 'BCG + Hepatitis B (1° dosis)' },
  { meses: 2, vacunas: 'Quíntuple (1°) + IPV (1°) + Rotavirus (1°) + Neumococo (1°)' },
  { meses: 3, vacunas: 'Meningococo (1°)' },
  { meses: 4, vacunas: 'Quíntuple (2°) + IPV (2°) + Rotavirus (2°) + Neumococo (2°)' },
  { meses: 5, vacunas: 'Meningococo (2°)' },
  { meses: 6, vacunas: 'Quíntuple (3°) + IPV (3°) + Antigripal (1°)' },
  { meses: 7, vacunas: 'Antigripal (2°)' },
  { meses: 12, vacunas: 'Triple viral SRP (1°) + Neumococo (refuerzo) + Hepatitis A (única)' },
  { meses: 15, vacunas: 'Meningococo (refuerzo) + Varicela (1°)' },
  { meses: 18, vacunas: 'Quíntuple (refuerzo) + IPV (refuerzo)' },
];

export function vacunasBebe(i: Inputs): Outputs {
  const nac = new Date(i.fechaNacimiento);
  if (isNaN(nac.getTime())) throw new Error('Ingresá una fecha de nacimiento válida');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const edadMeses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());

  let proxima = '';
  let calendario = '';
  let vacunasAlDia = '';

  for (const e of esquema) {
    const fechaVacuna = new Date(nac.getTime());
    fechaVacuna.setMonth(fechaVacuna.getMonth() + e.meses);
    const fechaStr = fechaVacuna.toISOString().split('T')[0];
    const estado = edadMeses >= e.meses ? '✓' : '○';
    calendario += `${estado} ${e.meses} meses (${fechaStr}): ${e.vacunas}\n`;

    if (!proxima && edadMeses < e.meses) {
      proxima = `${e.vacunas} — fecha estimada: ${fechaStr}`;
    }
  }

  if (!proxima) {
    if (edadMeses >= 18) proxima = 'Tu bebé completó el esquema de 0-18 meses. Las próximas son a los 5-6 años.';
    else proxima = esquema[0].vacunas;
  }

  const completadas = esquema.filter(e => edadMeses >= e.meses).length;
  vacunasAlDia = `${completadas} de ${esquema.length} etapas completadas (según la edad)`;

  return {
    proximaVacuna: proxima,
    calendario: calendario.trim(),
    vacunasAlDia,
    nota: 'Las fechas son estimadas. Consultá con tu pediatra para el esquema exacto. Todas las vacunas son gratuitas y obligatorias en Argentina.',
  };
}
