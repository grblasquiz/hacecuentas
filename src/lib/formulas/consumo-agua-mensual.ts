/** Estimador de consumo de agua mensual */
export interface Inputs { personas: number; duchasDia: number; duracionDucha?: number; lavadosRopa?: number; costoM3?: number; }
export interface Outputs { consumoMensualLitros: string; consumoDiarioLitros: string; costoMensual: number; litrosPorPersona: string; }

export function consumoAguaMensual(i: Inputs): Outputs {
  const personas = Number(i.personas);
  const duchas = Number(i.duchasDia);
  const minDucha = Number(i.duracionDucha) || 8;
  const lavados = Number(i.lavadosRopa) || 3;
  const costoM3 = Number(i.costoM3) || 200;
  if (!personas || personas <= 0) throw new Error('Ingresá la cantidad de personas');
  if (duchas < 0) throw new Error('Duchas no puede ser negativo');

  const litrosDucha = duchas * minDucha * 9; // 9 L/min promedio
  const litrosInodoro = personas * 5 * 8; // 5 veces/día × 8L
  const litrosCocina = personas * 12;
  const litrosLavado = (lavados * 60) / 7; // por día
  const litrosOtros = personas * 8;
  const diario = litrosDucha + litrosInodoro + litrosCocina + litrosLavado + litrosOtros;
  const mensual = diario * 30;
  const m3 = mensual / 1000;
  const costoMensual = m3 * costoM3;

  return {
    consumoMensualLitros: `${Math.round(mensual).toLocaleString('es-AR')} litros (${m3.toFixed(1)} m3)`,
    consumoDiarioLitros: `${Math.round(diario).toLocaleString('es-AR')} litros/día`,
    costoMensual: Math.round(costoMensual),
    litrosPorPersona: `${Math.round(diario / personas)} litros/persona/día`,
  };
}
