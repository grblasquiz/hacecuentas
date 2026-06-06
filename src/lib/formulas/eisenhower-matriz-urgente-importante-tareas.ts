export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Matriz Eisenhower — Ratio de enfoque = (tareas importantes Q1+Q2) / total de tareas.
// v1 = tareas importantes (Q1 + Q2); v2 = total de tareas clasificadas.
export function eisenhowerMatrizUrgenteImportanteTareas(i: Inputs): Outputs {
  const importantes = Math.max(0, Number(i.v1) || 0);
  const total = Math.max(1, Number(i.v2) || 1);
  // El ratio no puede superar 1: las importantes no pueden ser más que el total.
  const ratio = Math.min(importantes, total) / total;
  const pct = Math.round(ratio * 100);

  let nivel: string;
  let accion: string;
  let tone: string;
  let icon: string;
  if (ratio >= 0.70) {
    nivel = 'Foco excelente';
    accion = 'La mayor parte de tu energía va a lo que importa. Sostené los bloques de Q2 y seguí delegando Q3.';
    tone = 'positive';
    icon = '🎯';
  } else if (ratio >= 0.60) {
    nivel = 'Buen foco';
    accion = 'Estás en el rango recomendado por Covey (≥0.60). Subí el ratio delegando más Q3 y eliminando Q4.';
    tone = 'positive';
    icon = '✅';
  } else if (ratio >= 0.40) {
    nivel = 'Foco moderado';
    accion = 'Hay margen claro: delegá o limitá las tareas Q3 y eliminá las Q4 para liberar tiempo de Q2.';
    tone = 'neutral';
    icon = '⚠️';
  } else {
    nivel = 'Alerta de dispersión';
    accion = 'Más del 60% son Q3 (urgencias ajenas) o Q4 (distracciones). Bloqueá al menos 1 h diaria de Q2 protegida.';
    tone = 'negative';
    icon = '🚨';
  }

  const insight = {
    title: `${nivel}: ratio de enfoque ${ratio.toFixed(2)}`,
    text: `El **${pct}%** de tus tareas (${Math.min(importantes, total)} de ${total}) son importantes (Q1 + Q2). ${accion}`,
    tone,
    icon,
  };

  return {
    resultado: ratio.toFixed(2),
    resumen: `Ratio de enfoque = ${Math.min(importantes, total)} importantes ÷ ${total} totales = ${ratio.toFixed(2)} (${pct}%). ${nivel}.`,
    _insight: insight,
  };
}
