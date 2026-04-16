/** Costo mensual de mantener un hijo */
export interface Inputs { edadHijo: string; tipoEducacion: string; obraSocial?: string; actividadesExtra?: number; }
export interface Outputs { costoMensualTotal: number; costoAnual: number; desglose: string; costoHasta18: number; }

export function costoHijoMensual(i: Inputs): Outputs {
  const edad = i.edadHijo || 'primaria';
  const edu = i.tipoEducacion || 'publica';
  const salud = i.obraSocial || 'obra-social';
  const actividades = Number(i.actividadesExtra) || 0;

  const alimentacion: Record<string, number> = { 'bebe': 80000, 'jardin': 85000, 'primaria': 100000, 'secundaria': 120000, 'universidad': 100000 };
  const educacionCost: Record<string, Record<string, number>> = {
    'publica': { 'bebe': 0, 'jardin': 0, 'primaria': 8000, 'secundaria': 10000, 'universidad': 5000 },
    'privada-media': { 'bebe': 90000, 'jardin': 110000, 'primaria': 140000, 'secundaria': 170000, 'universidad': 0 },
    'privada-premium': { 'bebe': 150000, 'jardin': 200000, 'primaria': 280000, 'secundaria': 350000, 'universidad': 0 },
  };
  const saludCost: Record<string, number> = { 'obra-social': 0, 'prepaga-basica': 30000, 'prepaga-premium': 65000 };
  const higiene: Record<string, number> = { 'bebe': 40000, 'jardin': 15000, 'primaria': 8000, 'secundaria': 12000, 'universidad': 12000 };
  const ropa: Record<string, number> = { 'bebe': 25000, 'jardin': 25000, 'primaria': 28000, 'secundaria': 40000, 'universidad': 35000 };

  const alim = alimentacion[edad] || 100000;
  const eduCost = (educacionCost[edu] || educacionCost['publica'])[edad] || 0;
  const saludMonto = saludCost[salud] || 0;
  const hig = higiene[edad] || 10000;
  const rop = ropa[edad] || 28000;
  const actCost = actividades * 20000;
  const otros = 25000;

  const costoMensualTotal = alim + eduCost + saludMonto + hig + rop + actCost + otros;
  const costoAnual = costoMensualTotal * 12;

  const edadActual: Record<string, number> = { 'bebe': 1, 'jardin': 4, 'primaria': 9, 'secundaria': 15, 'universidad': 19 };
  const aniosRestantes = Math.max(0, 18 - (edadActual[edad] || 9));
  const costoHasta18 = costoMensualTotal * 12 * aniosRestantes;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    costoMensualTotal: Math.round(costoMensualTotal),
    costoAnual: Math.round(costoAnual),
    desglose: `Alimentación $${fmt.format(alim)} + Educación $${fmt.format(eduCost)} + Salud $${fmt.format(saludMonto)} + Higiene $${fmt.format(hig)} + Ropa $${fmt.format(rop)} + Actividades $${fmt.format(actCost)} + Otros $${fmt.format(otros)}`,
    costoHasta18: Math.round(costoHasta18),
  };
}
