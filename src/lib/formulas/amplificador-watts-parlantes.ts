export interface AmplificadorWattsParlantesInputs { potenciaAmp: number; impedanciaParlante: number; cantidadParlantes: number; conexion: string; }
export interface AmplificadorWattsParlantesOutputs { impedanciaTotal: string; wattsPorParlante: string; compatible: string; resumen: string; }
export function amplificadorWattsParlantes(i: AmplificadorWattsParlantesInputs): AmplificadorWattsParlantesOutputs {
  const p = Number(i.potenciaAmp); const z = Number(i.impedanciaParlante); const n = Number(i.cantidadParlantes);
  if (!p || !z || !n) throw new Error('Completá campos');
  const zTotal = i.conexion === 'serie' ? z * n : z / n;
  const wPorParlante = p / n;
  const compatible = zTotal >= 4 ? 'Sí (seguro para mayoría amp)' : zTotal >= 2 ? 'Solo amp premium' : 'NO — peligroso';
  return { impedanciaTotal: zTotal.toFixed(2) + ' Ω', wattsPorParlante: wPorParlante.toFixed(0) + ' W', compatible,
    resumen: `${n} parlantes ${z}Ω en ${i.conexion}: ${zTotal.toFixed(1)} Ω total. ${wPorParlante.toFixed(0)}W por parlante. ${compatible}.` };
}
