/**
 * Low-FODMAP 20/30/50.
 */

export interface MacrosLowFodmapSiboInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosLowFodmapSiboOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  resumen: string;
}

export function macrosLowFodmapSibo(inputs: MacrosLowFodmapSiboInputs): MacrosLowFodmapSiboOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(
    __lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas'
  );
  const prot = (cal * 0.20) / 4;
  const grasa = (cal * 0.30) / 9;
  const carbos = (cal * 0.50) / 4;
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    resumen: __lang === 'en'
      ? `Low-FODMAP ${cal} kcal: ${prot.toFixed(0)}g protein + ${grasa.toFixed(0)}g fat + ${carbos.toFixed(0)}g tolerated carbs.`
      : `Low-FODMAP ${cal} kcal: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos tolerados.`,
  };
}
