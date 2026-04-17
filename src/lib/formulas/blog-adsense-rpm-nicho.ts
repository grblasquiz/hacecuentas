/** Blog AdSense RPM */
export interface Inputs { visitasMensuales: number; nicho: string; paisTrafico: string; }
export interface Outputs { rpmEstimado: string; ingresoMensual: string; ingresoAnual: string; recomendacion: string; }

export function blogAdsenseRpmNicho(i: Inputs): Outputs {
  const v = Number(i.visitasMensuales);
  const n = String(i.nicho);
  const p = String(i.paisTrafico);
  if (v <= 0) throw new Error('Visitas inválidas');
  const rpmBase: Record<string, number> = {
    'Finanzas / inversiones': 30,
    'Salud / medicina': 20,
    'Legal': 25,
    'Seguros': 40,
    'Tecnología / SaaS': 8,
    'Educación / cursos': 7,
    'Hogar / DIY': 7,
    'Viajes': 7,
    'Entretenimiento / cultura': 3.5,
    'Lifestyle / blogging': 2.5,
  };
  const multPais: Record<string, number> = {
    'EEUU': 1.0,
    'Canadá / UK / Australia': 0.85,
    'Europa occidental': 0.65,
    'España': 0.45,
    'México / Argentina / Chile': 0.25,
    'Brasil': 0.25,
    'India / SEA': 0.15,
  };
  const rpm = (rpmBase[n] || 3) * (multPais[p] || 0.5);
  const mensual = (v / 1000) * rpm;
  const anual = mensual * 12;
  let rec = '';
  if (v < 10000) rec = 'Con <10K/mes, AdSense es tu única opción. Priorizá tráfico antes que ads';
  else if (v < 50000) rec = 'Probá Ezoic: suele subir RPM 30-50% vs AdSense puro';
  else if (v < 100000) rec = 'Migrá a Mediavine: suele pagar 2-3x más que AdSense';
  else rec = 'Aplicá a Raptive (ex-AdThrive): top tier premium con RPM 2-5x AdSense';
  return {
    rpmEstimado: `$${rpm.toFixed(2)} USD por 1.000 visitas`,
    ingresoMensual: `$${mensual.toFixed(2)} USD/mes`,
    ingresoAnual: `$${anual.toFixed(2)} USD/año`,
    recomendacion: rec,
  };
}
