export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function calendarioSiembraHemisferioNorte(i: Inputs): Outputs {
  const plan: Record<string, string> = {
    enero: 'Frutales bare root, ajos', febrero: 'Habas, arvejas indoor', marzo: 'Lechuga, rabanito',
    abril: 'Tomate, pimiento, maíz', mayo: 'Pepino, sandía, calabaza', junio: 'Porotos, maíz tardío',
    julio: 'Coliflor, repollo otoño', agosto: 'Acelga, lechuga otoño', septiembre: 'Ajos, espinaca invierno',
    octubre: 'Ajos, bulbos floración', noviembre: 'Frutales desnudos', diciembre: 'Descanso/planificación'
  };
  const m = String(i.mes);
  return { recomendadas: plan[m] || 'Variable', resumen: `En ${m} en hemisferio norte: sembrar ${plan[m] || 'variado'}.` };
}
