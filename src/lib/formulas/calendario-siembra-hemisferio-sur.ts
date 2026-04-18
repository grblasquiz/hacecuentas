export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function calendarioSiembraHemisferioSur(i: Inputs): Outputs {
  const plan: Record<string, string> = {
    marzo: 'Acelga, espinaca, lechuga, rabanito', abril: 'Habas, arvejas, zanahoria',
    mayo: 'Ajo, cebolla, arveja', junio: 'Alcauciles, ajos', julio: 'Lechuga, espinaca',
    agosto: 'Tomate (plantín), pimiento (plantín)', septiembre: 'Maíz, zapallito, choclo',
    octubre: 'Tomate, zapallito, pimiento, morrón, calabaza', noviembre: 'Sandía, melón, pepino',
    diciembre: 'Porotos, maíz tardío', enero: 'Acelga otoño, lechuga cabeza',
    febrero: 'Hinojo, zanahoria otoño, rúcula'
  };
  const m = String(i.mes);
  return { recomendadas: plan[m] || 'Variable', resumen: `En ${m} en hemisferio sur: sembrar ${plan[m] || 'variado'}.` };
}
