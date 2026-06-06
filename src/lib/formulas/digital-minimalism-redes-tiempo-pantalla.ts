export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Calculadora de tiempo en redes / digital minimalism.
// v1 = uso diario actual en redes (min/día), v2 = meta diaria (min/día).
// Índice = uso actual / meta. >1 = exceso. Devuelve interpretación,
// % de reducción necesario y plan escalonado (−15 min/semana).
export function digitalMinimalismRedesTiempoPantalla(i: Inputs): Outputs {
  const actual = Number(i.v1) || 0;            // minutos/día actuales
  const metaRaw = Number(i.v2);
  const meta = Number.isFinite(metaRaw) && metaRaw > 0 ? metaRaw : 30; // default umbral saludable
  const indice = actual / meta;

  // % de reducción necesario para llegar a la meta
  const reduccionPct = actual > meta ? Math.round(((actual - meta) / actual) * 100) : 0;
  const minutosACortar = Math.max(0, actual - meta);

  // Semanas para llegar a la meta con −15 min/semana
  const semanas = minutosACortar > 0 ? Math.ceil(minutosACortar / 15) : 0;

  let lectura: string;
  let plan: string;
  let tone: 'positive' | 'neutral' | 'warning' | 'danger';
  if (indice <= 1) {
    lectura = 'Estás dentro de tu meta';
    plan = 'Mantené tus hábitos actuales y reforzá los límites de app para no recaer.';
    tone = 'positive';
  } else if (indice <= 1.5) {
    lectura = 'Leve exceso';
    plan = 'Activá límites de app y desactivá las notificaciones push no-humanas.';
    tone = 'neutral';
  } else if (indice <= 3) {
    lectura = 'Exceso moderado';
    plan = `Reducción gradual de −15 min/semana: llegás a la meta en ~${semanas} semanas.`;
    tone = 'warning';
  } else if (indice <= 5) {
    lectura = 'Exceso alto';
    plan = `Hacé un "digital declutter" de 30 días (Newport) + reintroducción selectiva. Reducción escalonada: ~${semanas} semanas.`;
    tone = 'warning';
  } else {
    lectura = 'Uso compulsivo';
    plan = 'Considerá apoyo profesional y un protocolo estructurado de desconexión.';
    tone = 'danger';
  }

  const resumen = indice <= 1
    ? `Usás ${actual} min/día y tu meta es ${meta} min/día: índice ${indice.toFixed(2)}. ${lectura}. ${plan}`
    : `Usás las redes ${indice.toFixed(2)} veces más que tu meta (${actual} vs ${meta} min/día). Necesitás reducir un ${reduccionPct}% (${minutosACortar} min/día). ${lectura}. ${plan}`;

  return {
    resultado: indice.toFixed(2),
    resumen,
    reduccion: actual > meta ? `${reduccionPct}% (${minutosACortar} min/día menos)` : '0% — ya estás en tu meta',
    _insight: {
      title: 'Tu índice de uso',
      text: indice <= 1
        ? `Estás **dentro** de tu meta (índice **${indice.toFixed(2)}**). ${plan}`
        : `Usás las redes **${indice.toFixed(2)}×** tu meta. Reducí un **${reduccionPct}%** (${minutosACortar} min/día). ${plan}`,
      tone,
      icon: '📵',
    },
  };
}
