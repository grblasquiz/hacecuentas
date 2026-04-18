export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function biodegradacionResiduoTiempo(i: Inputs): Outputs {
  const tiempos: Record<string, string> = {
    'papel': '2-5 meses', 'cascara-fruta': '2-4 semanas', 'algodon': '1-5 meses',
    'vidrio': '~4000 años', 'lata': '10-500 años', 'plastico': '450+ años',
    'tetra': '30-40 años', 'pañal': '500+ años', 'neumatico': '1000+ años'
  };
  const m = String(i.material);
  const t = tiempos[m] || 'Desconocido';
  return { tiempoEstimado: t, resumen: `${m}: ${t} para biodegradarse completamente.` };
}
