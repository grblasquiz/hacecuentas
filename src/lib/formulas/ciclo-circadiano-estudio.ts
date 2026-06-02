/** Mejores Horas para Estudiar según tu Ciclo Circadiano */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  picoOptimo: string;
  segundoPico: string;
  evitarHoras: string;
  nota: string;
  _insight?: any;
}

export function cicloCircadianoEstudio(i: Inputs): Outputs {
  const crono = String(i.cronotipo || 'intermedio');
  const tarea = String(i.tipoTarea || 'memorizar');

  const TABLA: Record<string, Record<string, any>> = {
    alondra: {
      memorizar: { pico: '9-11 AM', seg: '16-17 PM', evitar: '14-16 PM (valle)' },
      razonar:   { pico: '10-12 AM', seg: '17-18 PM', evitar: '14-16 PM' },
      creativo:  { pico: '19-21 PM', seg: '7-8 AM', evitar: '10-12 AM' },
      revisar:   { pico: '14-16 PM', seg: '20-21 PM', evitar: '6-8 AM' },
    },
    intermedio: {
      memorizar: { pico: '10-12 AM', seg: '17-18 PM', evitar: '15-17 PM' },
      razonar:   { pico: '11-13 AM', seg: '18-19 PM', evitar: '14-16 PM' },
      creativo:  { pico: '18-20 PM', seg: '8-10 AM', evitar: '11-13 AM' },
      revisar:   { pico: '15-17 PM', seg: '21-22 PM', evitar: '8-10 AM' },
    },
    buho: {
      memorizar: { pico: '16-18 PM', seg: '21-22 PM', evitar: '8-11 AM' },
      razonar:   { pico: '17-19 PM', seg: '22-23 PM', evitar: '9-12 AM' },
      creativo:  { pico: '00-02 AM', seg: '13-15 PM', evitar: '18-20 PM' },
      revisar:   { pico: '21-23 PM', seg: '12-14 PM', evitar: '6-9 AM' },
    },
  };
  const t = TABLA[crono]?.[tarea] || TABLA.intermedio.memorizar;

  const NOMBRE_CRONO: Record<string, string> = { alondra: 'alondra (madrugador)', intermedio: 'intermedio', buho: 'búho (nocturno)' };
  const NOMBRE_TAREA: Record<string, string> = { memorizar: 'memorizar', razonar: 'razonar', creativo: 'trabajo creativo', revisar: 'revisar' };
  const cronoTxt = NOMBRE_CRONO[crono] || crono;
  const tareaTxt = NOMBRE_TAREA[tarea] || tarea;

  return {
    picoOptimo: t.pico,
    segundoPico: t.seg,
    evitarHoras: t.evitar,
    nota: 'El 50% del cronotipo es genético. Respetalo para ganar 20% eficiencia.',
    _insight: {
      title: 'Tu mejor franja para estudiar',
      text: `Con cronotipo **${cronoTxt}** y tareas de **${tareaTxt}**, tu pico de rendimiento es **${t.pico}** (con un segundo pico **${t.seg}**). Evitá las **${t.evitar}**, cuando tu energía cae.`,
      tone: 'good',
      icon: '🧠',
    },
  };

}
