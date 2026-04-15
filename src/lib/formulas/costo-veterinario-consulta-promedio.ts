/** Costo veterinario estimado por tipo de consulta, zona y especie */
export interface Inputs {
  tipoConsulta: string;
  zona?: string;
  especie?: string;
  cantidadVisitas: number;
}
export interface Outputs {
  costoConsulta: number;
  costoAnual: number;
  costoMensual: number;
  detalle: string;
}

const PRECIOS: Record<string, Record<string, [number, number]>> = {
  general: { caba: [18000, 25000], gba: [12000, 18000], interior: [10000, 15000] },
  urgencia: { caba: [35000, 55000], gba: [25000, 40000], interior: [20000, 30000] },
  especialista: { caba: [35000, 65000], gba: [25000, 45000], interior: [20000, 35000] },
  cirugiaMenor: { caba: [80000, 150000], gba: [60000, 120000], interior: [50000, 100000] },
  cirugiaMayor: { caba: [150000, 400000], gba: [120000, 300000], interior: [80000, 250000] },
  castracion: { caba: [60000, 120000], gba: [45000, 90000], interior: [35000, 70000] },
};

const NOMBRES: Record<string, string> = {
  general: 'Consulta general / control',
  urgencia: 'Urgencia / guardia nocturna',
  especialista: 'Especialista',
  cirugiaMenor: 'Cirugía menor',
  cirugiaMayor: 'Cirugía mayor',
  castracion: 'Castración / esterilización',
};

export function costoVeterinarioConsultaPromedio(i: Inputs): Outputs {
  const tipo = String(i.tipoConsulta || 'general');
  const zona = String(i.zona || 'caba');
  const especie = String(i.especie || 'perro');
  const visitas = Number(i.cantidadVisitas);

  if (!visitas || visitas < 1 || visitas > 52) throw new Error('Ingresá la cantidad de visitas por año (1-52)');
  if (!PRECIOS[tipo]) throw new Error('Tipo de consulta no válido');

  const rango = PRECIOS[tipo][zona] || PRECIOS[tipo].caba;
  const promedio = Math.round((rango[0] + rango[1]) / 2);

  // Ajuste por especie: gatos suelen ser ~10% más baratos, exóticos ~20% más caros
  let ajuste = 1.0;
  if (especie === 'gato') ajuste = 0.9;
  else if (especie === 'otro') ajuste = 1.2;

  const costoConsulta = Math.round(promedio * ajuste);
  const costoAnual = costoConsulta * visitas;
  const costoMensual = Math.round(costoAnual / 12);

  const nombreTipo = NOMBRES[tipo] || tipo;
  const zonaLabel = zona === 'caba' ? 'CABA/GBA norte' : zona === 'gba' ? 'GBA sur/oeste' : 'Interior';

  return {
    costoConsulta,
    costoAnual,
    costoMensual,
    detalle: `${nombreTipo} para ${especie} en ${zonaLabel}: ~$${costoConsulta.toLocaleString('es-AR')} por consulta. Con ${visitas} visitas/año = $${costoAnual.toLocaleString('es-AR')}/año ($${costoMensual.toLocaleString('es-AR')}/mes).`,
  };
}
