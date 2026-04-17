/** Instagram Ads CPM */
export interface Inputs { nicho: string; pais: string; objetivo: string; }
export interface Outputs { cpmEstimado: string; rangoCPM: string; cpcEstimado: string; tip: string; }

export function instagramAdsCpmNicho(i: Inputs): Outputs {
  const n = String(i.nicho);
  const p = String(i.pais);
  const o = String(i.objetivo);
  if (!n || !p || !o) throw new Error('Seleccioná todos los campos');
  const basePais: Record<string, number> = {
    'Argentina': 3, 'México': 3.5, 'Colombia': 3, 'Chile': 3.5, 'Perú': 3,
    'España': 6, 'Global Europa': 6, 'EEUU': 12, 'Brasil': 3.5, 'India': 1,
  };
  const multNicho: Record<string, number> = {
    'Ecommerce / retail': 1.0, 'Belleza / cuidado personal': 1.0, 'Fitness / salud': 1.3,
    'Finanzas / banca': 2.5, 'Bienes raíces': 2.0, 'Educación / cursos': 1.5,
    'Turismo': 1.2, 'Gaming': 0.8, 'B2B / SaaS': 2.2, 'Comida / delivery': 0.9,
  };
  const adjObj: Record<string, number> = {
    'Awareness (reach)': 0.85, 'Traffic (clicks)': 0.9, 'Engagement': 1.05,
    'Conversions': 1.2, 'Lead generation': 1.35,
  };
  const bp = basePais[p] || 4;
  const mn = multNicho[n] || 1;
  const ao = adjObj[o] || 1;
  const cpm = bp * mn * ao;
  const rangoMin = cpm * 0.7;
  const rangoMax = cpm * 1.3;
  const cpc = cpm / 10; // CTR 1%
  return {
    cpmEstimado: `$${cpm.toFixed(2)} USD`,
    rangoCPM: `$${rangoMin.toFixed(2)} - $${rangoMax.toFixed(2)} USD`,
    cpcEstimado: `$${cpc.toFixed(2)} USD por click (con CTR 1%)`,
    tip: cpm > 15 ? 'CPM alto — probá audiencias más amplias y placements automáticos' : 'CPM saludable — mantené la config de targeting',
  };
}
