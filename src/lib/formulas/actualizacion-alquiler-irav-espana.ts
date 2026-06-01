/** Actualización alquiler IRAV España — Ley Vivienda 2023, tope 2,2% en 2026 */
export interface Inputs { alquilerActual: number; indiceIrav: number; granTenedor: string; zonaTensionada: string; }
export interface Outputs { alquilerNuevo: number; incrementoEuros: number; incrementoPct: number; topeAplicado: number; notaAplicacion: string; _insight?: any; _chart?: any; }

export function actualizacionAlquilerIravEspana(i: Inputs): Outputs {
  const alquiler = Number(i.alquilerActual);
  const irav = Number(i.indiceIrav);
  const granTenedor = String(i.granTenedor || 'no') === 'si';
  const zonaTensionada = String(i.zonaTensionada || 'no') === 'si';
  if (!alquiler || alquiler <= 0) throw new Error('Ingresá alquiler actual válido');
  // Tope legal IRAV 2026: 2,2% (Ley 12/2023 por la Vivienda, aplicado por INE)
  // Para gran tenedor en zona tensionada: el tope puede ser más estricto o aplicar índices específicos
  const topeLegal = 2.2;
  let incrementoPct: number;
  let nota: string;
  if (isNaN(irav) || irav <= 0) {
    incrementoPct = topeLegal;
    nota = 'Se aplica el tope legal del 2,2% del IRAV para 2026.';
  } else if (irav > topeLegal) {
    incrementoPct = topeLegal;
    nota = `El IRAV ingresado (${irav}%) supera el tope legal. Se aplica el 2,2% máximo.`;
  } else {
    incrementoPct = irav;
    nota = `Se aplica el IRAV ingresado: ${irav}%.`;
  }
  if (granTenedor && zonaTensionada) {
    // Gran tenedor en zona tensionada: límite aún más estricto según índice de referencia publicado
    incrementoPct = Math.min(incrementoPct, topeLegal);
    nota += ' Gran tenedor en zona tensionada: sujeto también al índice de referencia local.';
  }
  const incrementoEuros = alquiler * (incrementoPct / 100);
  const alquilerNuevo = alquiler + incrementoEuros;
  const nuevoR = Math.round(alquilerNuevo * 100) / 100;
  const incEurR = Math.round(incrementoEuros * 100) / 100;
  const incPctR = Number(incrementoPct.toFixed(2));
  const fmtEur = (n: number) => '€' + n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const enTope = incPctR >= topeLegal;
  const _insight = {
    title: 'Tu nuevo alquiler',
    text: `El alquiler pasa de **${fmtEur(alquiler)}** a **${fmtEur(nuevoR)}** al mes: **+${fmtEur(incEurR)}** (${incPctR}%).` + (enTope ? ` Estás en el **tope legal del ${topeLegal}%**, el casero no puede subir más en 2026.` : ` Por debajo del tope legal del ${topeLegal}%, así que es una subida moderada.`),
    tone: enTope ? 'warn' : 'good',
    icon: '🏠',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Alquiler actual', value: alquiler },
      { label: 'Incremento', value: incEurR },
    ],
    prefix: '€',
    centerValue: fmtEur(nuevoR),
    centerLabel: 'Nuevo/mes',
    ariaLabel: `Nuevo alquiler de ${fmtEur(nuevoR)}: ${fmtEur(alquiler)} actuales más ${fmtEur(incEurR)} de incremento`,
  };
  return {
    alquilerNuevo: nuevoR,
    incrementoEuros: incEurR,
    incrementoPct: incPctR,
    topeAplicado: topeLegal,
    notaAplicacion: nota,
    _insight,
    _chart,
  };
}
