/** Estimación de espacio necesario para backups con crecimiento mensual */
export interface Inputs { tamanoActualGb: number; crecimientoMensual: number; mesesRetencion: number; frecuenciaBackup?: string; }
export interface Outputs { espacioTotalGb: number; espacioTotalTb: number; tamanoFinalGb: number; cantidadBackups: number; detalle: string; }

export function espacioBackupCrecimientoMensual(i: Inputs): Outputs {
  const tamano = Number(i.tamanoActualGb);
  const crecimiento = Number(i.crecimientoMensual) / 100;
  const meses = Math.floor(Number(i.mesesRetencion));
  const frecuencia = String(i.frecuenciaBackup || 'mensual');

  if (!tamano || tamano <= 0) throw new Error('Ingresá el tamaño actual en GB');
  if (crecimiento < 0) throw new Error('El crecimiento no puede ser negativo');
  if (!meses || meses <= 0) throw new Error('Ingresá los meses de retención');

  // Cantidad de backups según frecuencia
  let backupsPorMes: number;
  switch (frecuencia) {
    case 'diario': backupsPorMes = 30; break;
    case 'semanal': backupsPorMes = 4.33; break;
    case 'mensual': default: backupsPorMes = 1; break;
  }

  const cantidadBackups = Math.round(meses * backupsPorMes);
  const intervaloMeses = 1 / backupsPorMes;

  // Sumar el tamaño de cada backup
  let espacioTotal = 0;
  for (let b = 0; b < cantidadBackups; b++) {
    const mesDelBackup = b * intervaloMeses;
    const tamanoEnEseMomento = tamano * Math.pow(1 + crecimiento, mesDelBackup);
    espacioTotal += tamanoEnEseMomento;
  }

  const tamanoFinal = tamano * Math.pow(1 + crecimiento, meses);

  return {
    espacioTotalGb: Number(espacioTotal.toFixed(1)),
    espacioTotalTb: Number((espacioTotal / 1024).toFixed(3)),
    tamanoFinalGb: Number(tamanoFinal.toFixed(1)),
    cantidadBackups,
    detalle: `${cantidadBackups} backups ${frecuencia}es durante ${meses} meses: ${espacioTotal.toFixed(1)} GB (${(espacioTotal / 1024).toFixed(2)} TB) totales. Datos finales: ${tamanoFinal.toFixed(1)} GB (crecimiento ${(crecimiento * 100).toFixed(1)}%/mes).`,
  };
}
