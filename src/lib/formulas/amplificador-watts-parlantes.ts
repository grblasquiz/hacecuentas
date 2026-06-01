export interface AmplificadorWattsParlantesInputs { potenciaAmp: number; impedanciaParlante: number; cantidadParlantes: number; conexion: string; __lang?: string; }
export interface AmplificadorWattsParlantesOutputs { impedanciaTotal: string; wattsPorParlante: string; compatible: string; resumen: string; }
export function amplificadorWattsParlantes(i: AmplificadorWattsParlantesInputs): AmplificadorWattsParlantesOutputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorCampos: 'Completá campos',
      compatibleSi: 'Sí (seguro para mayoría amp)',
      compatiblePremium: 'Solo amp premium',
      compatibleNo: 'NO — peligroso',
      speakers: 'parlantes',
      total: 'total',
      perSpeaker: 'por parlante',
    },
    en: {
      errorCampos: 'Fill in all fields',
      compatibleSi: 'Yes (safe for most amps)',
      compatiblePremium: 'Premium amp only',
      compatibleNo: 'NO — dangerous',
      speakers: 'speakers',
      total: 'total',
      perSpeaker: 'per speaker',
    },
  } as const)[__lang];
  const p = Number(i.potenciaAmp); const z = Number(i.impedanciaParlante); const n = Number(i.cantidadParlantes);
  if (!p || !z || !n) throw new Error(T.errorCampos);
  const zTotal = i.conexion === 'serie' ? z * n : z / n;
  const wPorParlante = p / n;
  const compatible = zTotal >= 4 ? T.compatibleSi : zTotal >= 2 ? T.compatiblePremium : T.compatibleNo;
  return { impedanciaTotal: zTotal.toFixed(2) + ' Ω', wattsPorParlante: wPorParlante.toFixed(0) + ' W', compatible,
    resumen: `${n} ${T.speakers} ${z}Ω en ${i.conexion}: ${zTotal.toFixed(1)} Ω ${T.total}. ${wPorParlante.toFixed(0)}W ${T.perSpeaker}. ${compatible}.` };
}
