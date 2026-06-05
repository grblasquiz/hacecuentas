export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function notaMinimaAprobarFinalParcialPromedio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Inputs
  const notaMinima = Number(i.notaMinima) || 4;      // nota mínima aprobatoria (default 4)
  const totalInstancias = Math.max(1, Number(i.totalInstancias) || 2); // total de exámenes
  const sumaNotas = Number(i.sumaNotas) || 0;         // suma de notas ya obtenidas
  const instanciasRestantes = Math.max(1, Number(i.instanciasRestantes) || 1); // cuántos faltan

  // Core formula:
  // Nota necesaria en promedio = (notaMinima × totalInstancias − sumaNotas) / instanciasRestantes
  const puntajeTotal = notaMinima * totalInstancias;
  const puntosFaltantes = puntajeTotal - sumaNotas;
  const notaNecesaria = puntosFaltantes / instanciasRestantes;

  let estado: string;
  let tono: string;
  if (notaNecesaria <= 0) {
    estado = __lang === 'en' ? 'You already have enough points to pass!' : '¡Ya tenés los puntos suficientes para aprobar!';
    tono = 'positive';
  } else if (notaNecesaria > 10) {
    estado = __lang === 'en'
      ? `You need ${notaNecesaria.toFixed(2)}/10 — mathematically impossible (max is 10). Consider the recuperatorio or re-enrolling.`
      : `Necesitás ${notaNecesaria.toFixed(2)} — es imposible (el máximo es 10). Considerá el recuperatorio o recursar.`;
    tono = 'negative';
  } else {
    estado = __lang === 'en'
      ? `You need at least ${notaNecesaria.toFixed(2)}/10 in the remaining exam(s) to pass.`
      : `Necesitás al menos ${notaNecesaria.toFixed(2)} en los exámenes restantes para aprobar.`;
    tono = notaNecesaria >= 7 ? 'caution' : 'neutral';
  }

  const resumen = __lang === 'en'
    ? `Minimum required: (${notaMinima} × ${totalInstancias} − ${sumaNotas}) ÷ ${instanciasRestantes} = ${notaNecesaria.toFixed(2)}`
    : `Nota mínima: (${notaMinima} × ${totalInstancias} − ${sumaNotas}) ÷ ${instanciasRestantes} = ${notaNecesaria.toFixed(2)}`;

  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: estado,
    tone: tono,
    icon: '📝',
  };

  return { resultado: notaNecesaria.toFixed(2), resumen, _insight };
}
