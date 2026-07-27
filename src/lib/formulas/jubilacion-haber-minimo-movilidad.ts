/** Haber jubilatorio con fórmula de movilidad Argentina
 *  Ley 27.609 (2020): movilidad trimestral por RIPTE + IPC
 *  Actualización: fórmula vigente 2024-2026
 */

export interface Inputs {
  haberActual: number;
  variacionRipte: number;
  variacionIpc: number;
  trimestresProyeccion: number;
  aniosAporte: number;
}

export interface Outputs {
  haberProyectado: number;
  aumentoTotal: number;
  aumentoPorcentaje: number;
  movilidadTrimestral: number;
  haberMinimo: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

export function jubilacionHaberMinimoMovilidad(i: Inputs): Outputs {
  const haber = Number(i.haberActual);
  const ripte = Number(i.variacionRipte);
  const ipc = Number(i.variacionIpc);
  const trimestres = Math.max(1, Math.round(Number(i.trimestresProyeccion) || 4));

  if (!haber || haber <= 0) throw new Error('Ingresá tu haber jubilatorio actual');
  if (ripte === undefined) throw new Error('Ingresá la variación RIPTE trimestral');
  if (ipc === undefined) throw new Error('Ingresá la variación IPC trimestral');

  // Fórmula de movilidad: combinación RIPTE (50%) + IPC (50%)
  // Desde DNU 274/2024: movilidad mensual por IPC del mes anterior
  // Usamos la fórmula simplificada para proyección
  const movilidadTrimestral = (ripte + ipc) / 2;

  let haberProyectado = haber;
  for (let t = 0; t < trimestres; t++) {
    haberProyectado = haberProyectado * (1 + movilidadTrimestral / 100);
  }

  const aumentoTotal = haberProyectado - haber;
  const aumentoPorcentaje = ((haberProyectado / haber) - 1) * 100;

  // Haber mínimo jubilatorio jun-2026 (movilidad IPC, DNU 274/2024)
  const haberMinimo = 411_989;

  const formula = `Haber proyectado = $${haber.toLocaleString()} × (1 + ${movilidadTrimestral.toFixed(2)}%)^${trimestres} = $${Math.round(haberProyectado).toLocaleString()}`;
  const explicacion = `Haber actual: $${haber.toLocaleString()}. Movilidad trimestral estimada: ${movilidadTrimestral.toFixed(2)}% (RIPTE ${ripte}% + IPC ${ipc}% promediados). En ${trimestres} trimestre(s): haber proyectado $${Math.round(haberProyectado).toLocaleString()} (+${aumentoPorcentaje.toFixed(1)}%, +$${Math.round(aumentoTotal).toLocaleString()}). Haber mínimo garantizado (ref. junio 2026): ~$${haberMinimo.toLocaleString()}. Nota: desde marzo 2024 la movilidad se actualiza mensualmente por IPC del mes anterior (DNU 274/2024).`;

  const baseSlice = Math.max(0, Math.min(haber, haberProyectado));
  const aumentoSlice = Math.max(0, haberProyectado - baseSlice);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Haber actual', value: Math.round(baseSlice) },
      { label: 'Aumento movilidad', value: Math.round(aumentoSlice) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(haberProyectado).toLocaleString('es-AR'),
    centerLabel: 'Proyectado',
    ariaLabel: 'Composición del haber proyectado: haber actual más aumento por movilidad',
  };

  // Variación acumulada de precios en el período (IPC compuesto por trimestre)
  let ipcAcum = 1;
  for (let t = 0; t < trimestres; t++) ipcAcum *= (1 + ipc / 100);
  const inflacionPct = (ipcAcum - 1) * 100;
  const ganaInflacion = aumentoPorcentaje >= inflacionPct;
  const _insight = {
    title: ganaInflacion ? 'Le ganás a la inflación' : 'Perdés poder de compra',
    text: ganaInflacion
      ? `En **${trimestres} trimestre${trimestres === 1 ? '' : 's'}** tu haber sube **${aumentoPorcentaje.toFixed(1)}%** (a **$${Math.round(haberProyectado).toLocaleString('es-AR')}**), por encima de la inflación del período (**${inflacionPct.toFixed(1)}%**). Mantenés el poder de compra.`
      : `En **${trimestres} trimestre${trimestres === 1 ? '' : 's'}** tu haber sube **${aumentoPorcentaje.toFixed(1)}%** (a **$${Math.round(haberProyectado).toLocaleString('es-AR')}**), pero la inflación acumula **${inflacionPct.toFixed(1)}%**: perdés poder de compra porque el RIPTE arrastra la movilidad por debajo del IPC.`,
    tone: (ganaInflacion ? 'good' : 'warn') as 'good' | 'warn',
    icon: '📈',
  };

  return {
    haberProyectado: Math.round(haberProyectado),
    aumentoTotal: Math.round(aumentoTotal),
    aumentoPorcentaje: Number(aumentoPorcentaje.toFixed(2)),
    movilidadTrimestral: Number(movilidadTrimestral.toFixed(2)),
    haberMinimo,
    formula,
    explicacion,
    _chart: chart,
    _insight,
  };
}
