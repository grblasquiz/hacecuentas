export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

/**
 * Calculadora de Tiempo de Calidad con Hijos
 *
 * Fórmula:
 *   Tiempo de calidad (min) = Tiempo compartido total
 *                            − Tiempo con pantallas
 *                            − Tiempo en tareas paralelas
 *                            − Tiempo de transporte pasivo
 *
 *   Índice de calidad (%) = (Tiempo de calidad / Tiempo compartido total) × 100
 *
 * Fuente de referencia: AAP (Academia Americana de Pediatría),
 *   Harvard Center on the Developing Child, OMS Directrices 2019 menores de 5 años.
 * Umbral mínimo recomendado: 20 min/día para niños escolares, 30 min para < 5 años.
 */
export function tiempoCalidadHijosPadresMadresMinutos(i: Inputs): Outputs {
  const __lang = (i.__lang as string) || 'es';

  const tiempoTotal   = Math.max(0, Number(i.tiempo_total)   || 0);
  const tiempoPantallas  = Math.max(0, Number(i.tiempo_pantallas) || 0);
  const tiempoTareas  = Math.max(0, Number(i.tiempo_tareas)  || 0);
  const tiempoTransporte = Math.max(0, Number(i.tiempo_transporte) || 0);

  const distracciones = tiempoPantallas + tiempoTareas + tiempoTransporte;
  const tiempoCalidad = Math.max(0, tiempoTotal - distracciones);
  const indice = tiempoTotal > 0 ? (tiempoCalidad / tiempoTotal) * 100 : 0;

  // Benchmark mínimo (AAP): 20 min/día para escolares, 30 min para < 5 años
  const umbral = 20;
  const diferencia = tiempoCalidad - umbral;
  const suficiente = tiempoCalidad >= umbral;

  // Tono interpretativo
  let tone: string;
  let icon: string;
  if (tiempoCalidad >= 45) {
    tone = 'positive';
    icon = '🌟';
  } else if (tiempoCalidad >= 20) {
    tone = 'neutral';
    icon = '✅';
  } else if (tiempoCalidad >= 10) {
    tone = 'warning';
    icon = '⚠️';
  } else {
    tone = 'negative';
    icon = '❗';
  }

  if (__lang === 'en') {
    const indiceStr = indice.toFixed(1);
    let interpretation: string;
    if (tiempoCalidad >= 45) {
      interpretation = `${tiempoCalidad} minutes of quality time — excellent (${indiceStr}% of shared time). Consistently above the 20-min daily benchmark.`;
    } else if (tiempoCalidad >= 20) {
      interpretation = `${tiempoCalidad} minutes of quality time (${indiceStr}% of shared time) — meets the 20-min daily recommendation. Try to maintain this consistently.`;
    } else if (tiempoCalidad >= 10) {
      interpretation = `Only ${tiempoCalidad} minutes of quality time (${indiceStr}% of shared time) — below the recommended 20 min/day. Recover ${diferencia < 0 ? Math.abs(diferencia) : 0} more minutes from distractions.`;
    } else {
      interpretation = `${tiempoCalidad} minutes of quality time (${indiceStr}% of shared time) — critically low. Even a 15-min distraction-free routine daily would make a measurable difference.`;
    }
    return {
      resultado: tiempoCalidad,
      indice_calidad: parseFloat(indice.toFixed(1)),
      resumen: interpretation,
      _insight: {
        title: 'Your quality time',
        text: `Out of **${tiempoTotal} shared minutes**, **${tiempoCalidad} minutes** are genuine quality time — a **${indiceStr}%** quality index. The AAP recommends at least **20 min/day** of undivided attention per child.`,
        tone,
        icon,
      },
    };
  }

  if (__lang === 'pt') {
    const indiceStr = indice.toFixed(1);
    let interpretation: string;
    if (tiempoCalidad >= 45) {
      interpretation = `${tiempoCalidad} minutos de tempo de qualidade — excelente (${indiceStr}% do tempo compartilhado). Consistentemente acima do mínimo recomendado de 20 min/dia.`;
    } else if (tiempoCalidad >= 20) {
      interpretation = `${tiempoCalidad} minutos de tempo de qualidade (${indiceStr}% do tempo compartilhado) — atende à recomendação de 20 min/dia. Tente manter essa consistência.`;
    } else if (tiempoCalidad >= 10) {
      interpretation = `Apenas ${tiempoCalidad} minutos de tempo de qualidade (${indiceStr}% do tempo compartilhado) — abaixo dos 20 min/dia recomendados. Recupere ${diferencia < 0 ? Math.abs(diferencia) : 0} minutos das distrações.`;
    } else {
      interpretation = `${tiempoCalidad} minutos de tempo de qualidade (${indiceStr}% do tempo compartilhado) — muito baixo. Mesmo uma rotina de 15 min sem telas por dia faria diferença mensurável.`;
    }
    return {
      resultado: tiempoCalidad,
      indice_calidad: parseFloat(indice.toFixed(1)),
      resumen: interpretation,
      _insight: {
        title: 'Seu tempo de qualidade',
        text: `De **${tiempoTotal} minutos compartilhados**, **${tiempoCalidad} minutos** são de qualidade real — índice de **${indiceStr}%**. A AAP recomenda pelo menos **20 min/dia** de atenção exclusiva por filho.`,
        tone,
        icon,
      },
    };
  }

  // default: 'es'
  const indiceStr = indice.toFixed(1);
  let interpretation: string;
  if (tiempoCalidad >= 45) {
    interpretation = `${tiempoCalidad} minutos de calidad — excelente (${indiceStr}% del tiempo compartido). Superás el mínimo recomendado de 20 min/día de la AAP.`;
  } else if (tiempoCalidad >= 20) {
    interpretation = `${tiempoCalidad} minutos de calidad (${indiceStr}% del tiempo compartido) — cumplís la recomendación de 20 min/día. Mantené esta consistencia en la rutina diaria.`;
  } else if (tiempoCalidad >= 10) {
    interpretation = `Solo ${tiempoCalidad} minutos de calidad real (${indiceStr}% del tiempo compartido). Estás ${Math.abs(diferencia)} minutos por debajo del mínimo de 20 min/día (AAP). Revisá cuánto tiempo se va en pantallas o tareas paralelas.`;
  } else {
    interpretation = `Solo ${tiempoCalidad} minutos de calidad real (${indiceStr}% del tiempo compartido). Es un nivel crítico. Incluso una rutina de 15 min sin pantallas antes de dormir marcaría una diferencia real.`;
  }

  return {
    resultado: tiempoCalidad,
    indice_calidad: parseFloat(indice.toFixed(1)),
    resumen: interpretation,
    _insight: {
      title: 'Tu tiempo de calidad',
      text: `De **${tiempoTotal} minutos compartidos**, **${tiempoCalidad} minutos** son de calidad real — un índice de **${indiceStr}%**. La AAP recomienda mínimo **20 min/día** de atención exclusiva por hijo.`,
      tone,
      icon,
    },
  };
}
