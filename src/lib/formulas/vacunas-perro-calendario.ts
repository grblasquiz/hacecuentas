/** Calendario de vacunación según edad del perro */
export interface Inputs {
  edadSemanas?: number;
  edadMeses?: number;
  estaVacunado?: boolean; // indica si ya recibió quíntuple
}
export interface Outputs {
  edadMeses: number;
  proximaVacuna: string;
  calendario: { edad: string; vacuna: string; descripcion: string }[];
  alerta: string;
  resumen: string;
  _insight?: any;
}

export function vacunasPerroCalendario(i: Inputs): Outputs {
  let em = Number(i.edadMeses);
  const semanas = Number(i.edadSemanas);
  if (!em && semanas) em = semanas / 4.345;
  if (!em || em <= 0) throw new Error('Ingresá la edad en semanas o meses');

  const calendario = [
    { edad: '6 semanas (1,5 meses)', vacuna: 'Puppy / Séxtuple cachorro', descripcion: 'Parvovirus + moquillo (inmunidad temprana frente a anticuerpos maternos).' },
    { edad: '8-9 semanas (2 meses)', vacuna: '1° Séxtuple / Quíntuple', descripcion: 'Parvovirus, moquillo, hepatitis, parainfluenza, leptospirosis (2 cepas).' },
    { edad: '11-12 semanas (3 meses)', vacuna: '2° Séxtuple / Quíntuple', descripcion: 'Refuerzo (misma vacuna). Crítico para inmunidad definitiva.' },
    { edad: '15-16 semanas (4 meses)', vacuna: '3° Séxtuple + Antirrábica', descripcion: 'Último refuerzo cachorro + primera antirrábica (obligatoria por ley).' },
    { edad: '6 meses', vacuna: 'Refuerzo antirrábica', descripcion: '(Opcional según protocolo veterinario).' },
    { edad: '1 año', vacuna: 'Refuerzo anual séxtuple + antirrábica', descripcion: 'Comienza el calendario anual adulto.' },
    { edad: 'Anual de por vida', vacuna: 'Séxtuple + antirrábica', descripcion: 'Refuerzo todos los años junto con desparasitación.' },
  ];

  let proxima = '';
  let alerta = '';

  if (em < 1.5) proxima = 'A las 6 semanas: vacuna Puppy (primera).';
  else if (em < 2) proxima = 'A las 8-9 semanas: 1° Séxtuple.';
  else if (em < 3) proxima = 'A las 11-12 semanas: 2° Séxtuple.';
  else if (em < 4) proxima = 'A las 15-16 semanas: 3° Séxtuple + primera antirrábica.';
  else if (em < 6) proxima = 'A los 6 meses: refuerzo antirrábica (opcional).';
  else if (em < 12) proxima = 'Al año: refuerzo anual séxtuple + antirrábica.';
  else proxima = 'Refuerzo anual séxtuple y antirrábica todos los años.';

  if (em < 4 && i.estaVacunado !== true) {
    alerta = 'Importante: no saques a tu cachorro a la calle ni lo pongas en contacto con otros perros hasta que tenga el esquema cachorro completo (3 dosis).';
  }
  if (em > 12 && i.estaVacunado === false) {
    alerta = 'Tu perro adulto sin vacunas: consultá con veterinario para poner al día. La antirrábica es obligatoria por ley en Argentina.';
  }

  const enEsquemaCachorro = em < 4;
  const adultoSinVacunas = em > 12 && i.estaVacunado === false;
  let insightTitle: string, insightText: string, insightTone: string, insightIcon: string;
  if (enEsquemaCachorro) {
    insightTitle = 'Etapa cachorro: esquema en curso';
    insightText = `Con **${em.toFixed(1)} meses** tu perro está completando el esquema inicial. ${proxima} Hasta terminar las **3 dosis** evitá la calle y el contacto con otros perros.`;
    insightTone = 'warn';
    insightIcon = '🐶';
  } else if (adultoSinVacunas) {
    insightTitle = 'Adulto sin vacunas: ponelo al día';
    insightText = `Tu perro tiene **${em.toFixed(1)} meses** y figura sin vacunar. La **antirrábica es obligatoria por ley** en Argentina: consultá al veterinario para reiniciar el esquema cuanto antes.`;
    insightTone = 'warn';
    insightIcon = '⚠️';
  } else if (em >= 12) {
    insightTitle = 'Etapa adulta: refuerzo anual';
    insightText = `Con **${em.toFixed(1)} meses** tu perro ya está en calendario adulto. ${proxima} Aprovechá para combinarlo con la **desparasitación**.`;
    insightTone = 'good';
    insightIcon = '🦴';
  } else {
    insightTitle = 'Transición a refuerzos';
    insightText = `Tu perro tiene **${em.toFixed(1)} meses**: ya pasó el esquema cachorro y entra en la fase de refuerzos. ${proxima}`;
    insightTone = 'neutral';
    insightIcon = '💉';
  }
  const _insight = { title: insightTitle, text: insightText, tone: insightTone, icon: insightIcon };

  return {
    edadMeses: Number(em.toFixed(1)),
    proximaVacuna: proxima,
    calendario,
    alerta,
    resumen: `Tu perro tiene ${em.toFixed(1)} meses. Próxima vacuna: ${proxima}`,
    _insight,
  };
}
