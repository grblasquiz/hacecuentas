export interface PcbAnchoTraceCorrienteInputs { corriente: number; espesorCu: number; ubicacion: string; deltaTemp: number; }
export interface PcbAnchoTraceCorrienteOutputs { anchoMin: string; anchoMil: string; resumen: string; }
export function pcbAnchoTraceCorriente(i: PcbAnchoTraceCorrienteInputs): PcbAnchoTraceCorrienteOutputs {
  const I = Number(i.corriente); const cu = Number(i.espesorCu); const dT = Number(i.deltaTemp);
  if (!I || !cu || !dT) throw new Error('Completá campos');
  const k = i.ubicacion === 'interna' ? 0.024 : 0.048;
  const area = Math.pow(I / (k * Math.pow(dT, 0.44)), 1 / 0.725);
  const widthMil = area / (cu * 1.378);
  const widthMm = widthMil * 0.0254;
  return { anchoMin: widthMm.toFixed(2) + ' mm', anchoMil: widthMil.toFixed(1) + ' mil',
    resumen: `Ancho mínimo de pista: ${widthMm.toFixed(2)} mm (${widthMil.toFixed(1)} mil) para conducir ${I}A con ΔT de ${dT}°C sobre ambiente.` };
}
