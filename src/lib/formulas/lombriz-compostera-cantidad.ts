/** Lombrices para compostera */
export interface Inputs { kgResiduosSemanal: number; personas?: number; }
export interface Outputs { lombricesTotales: number; kgLombrices: number; humusMensualKg: number; tamanoCompostera: string; }

export function lombrizComposteraCantidad(i: Inputs): Outputs {
  let kgSem = Number(i.kgResiduosSemanal);
  const personas = Number(i.personas) || 0;
  if (!kgSem || kgSem <= 0) {
    if (personas > 0) kgSem = personas * 0.8;
    else throw new Error('Ingresá los kg de residuos semanales');
  }

  // 1 kg lombrices = ~1000 unid. Procesan ~0.5 kg/día = 3.5 kg/sem
  const kgLombrices = kgSem / 3.5;
  const lombrices = Math.round(kgLombrices * 1000);
  const humusMes = kgSem * 4 * 0.55; // 55% del peso se convierte en humus

  let tamano = '';
  if (kgSem <= 2) tamano = 'Compostera chica (40×30×30 cm, 2 bandejas)';
  else if (kgSem <= 5) tamano = 'Compostera mediana (50×40×40 cm, 3 bandejas)';
  else if (kgSem <= 10) tamano = 'Compostera grande (60×50×50 cm, 3-4 bandejas)';
  else tamano = 'Compostera industrial o múltiples composteras';

  return {
    lombricesTotales: lombrices,
    kgLombrices: Number(kgLombrices.toFixed(1)),
    humusMensualKg: Number(humusMes.toFixed(1)),
    tamanoCompostera: tamano,
  };
}
