export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function kanbanWipLimitCantidadTareasColumna(i: Inputs): Outputs {
  // Heurística estándar de Kanban (David Anderson): WIP por persona ≈ 1 a 1.5 tareas.
  // Límite total sugerido = round(equipo × 1.5); por columna = max(1, round(total / columnas)).
  const equipo = Math.max(1, Math.round(Number(i.equipo) || 0));
  const columnas = Math.max(1, Math.round(Number(i.columnas) || 1));

  const limiteTotal = Math.round(equipo * 1.5);
  const limiteConservador = equipo; // 1 tarea por persona (sin buffer)
  const porColumna = Math.max(1, Math.round(limiteTotal / columnas));

  const _insight = {
    title: 'Límite WIP sugerido',
    text: `Con un equipo de **${equipo}** persona(s) y **${columnas}** columna(s) activa(s), el WIP total sugerido es **${limiteTotal} tarea(s)** (heurística de 1,5 tareas por persona), lo que da **${porColumna} tarea(s) por columna**. Mantener el trabajo en curso bajo este número reduce el multitasking y acorta el Lead Time.`,
    tone: 'neutral',
    icon: '📋',
  };

  return {
    porColumna,
    limiteTotal,
    resumen: `WIP limit sugerido: ${porColumna} tarea(s) por columna (${limiteTotal} en total ÷ ${columnas} columna(s)). Rango por persona: ${limiteConservador}–${limiteTotal} tareas (1 a 1,5 por persona).`,
    _insight,
  };
}
