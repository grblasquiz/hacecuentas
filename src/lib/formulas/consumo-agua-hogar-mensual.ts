/** Consumo de agua doméstico mensual según hábitos del hogar */
export interface Inputs {
  habitantes: number;
  duchasPorDiaPorPersona?: number;
  minutosPorDucha?: number;
  cargasLavarropas?: number;
  usosInodoroPorPersona?: number;
  riegoLitrosDia?: number;
  tipoDucha?: string;
}
export interface Outputs {
  consumoDiarioLitros: number;
  consumoMensualLitros: number;
  consumoMensualM3: number;
  litrosPorPersonaDia: number;
  categoria: string;
  resumen: string;
}

export function consumoAguaHogarMensual(i: Inputs): Outputs {
  const h = Number(i.habitantes);
  const duchasDia = Number(i.duchasPorDiaPorPersona) || 1;
  const minDucha = Number(i.minutosPorDucha) || 8;
  const cargasLav = Number(i.cargasLavarropas) || 4;
  const inodoros = Number(i.usosInodoroPorPersona) || 5;
  const riego = Number(i.riegoLitrosDia) || 0;
  const tipoDucha = String(i.tipoDucha || 'normal');

  if (!h || h <= 0) throw new Error('Ingresá la cantidad de habitantes (al menos 1)');
  if (minDucha < 0 || minDucha > 60) throw new Error('Los minutos de ducha deben estar entre 0 y 60');

  // Caudal ducha: normal 12 L/min, economizadora 6 L/min
  const caudalDucha = tipoDucha === 'economizadora' ? 6 : 12;

  // Consumo diario por persona
  const duchaDiaPersona = duchasDia * minDucha * caudalDucha;
  const inodoroDiaPersona = inodoros * 9; // 9 L/descarga promedio
  const lavaplatosDia = 8; // litros/persona en lavado manual/cocina
  const higieneDia = 10; // lavado manos, cepillado, etc.
  const totalPersonaDia = duchaDiaPersona + inodoroDiaPersona + lavaplatosDia + higieneDia;

  // Lavarropas 70 L/carga (carga frontal moderna)
  const lavarropasSemanales = cargasLav * 70;
  const lavarropasDia = lavarropasSemanales / 7;

  const consumoDiarioLitros = totalPersonaDia * h + lavarropasDia + riego;
  const consumoMensualLitros = consumoDiarioLitros * 30;
  const consumoMensualM3 = consumoMensualLitros / 1000;
  const litrosPorPersonaDia = consumoDiarioLitros / h;

  // OMS: 100 L/persona/día es un consumo razonable
  let categoria = '';
  if (litrosPorPersonaDia < 80) categoria = 'Consumo bajo — muy eficiente';
  else if (litrosPorPersonaDia < 130) categoria = 'Consumo normal';
  else if (litrosPorPersonaDia < 200) categoria = 'Consumo alto';
  else categoria = 'Consumo excesivo — revisá hábitos y fugas';

  return {
    consumoDiarioLitros: Math.round(consumoDiarioLitros),
    consumoMensualLitros: Math.round(consumoMensualLitros),
    consumoMensualM3: Number(consumoMensualM3.toFixed(2)),
    litrosPorPersonaDia: Math.round(litrosPorPersonaDia),
    categoria,
    resumen: `Tu hogar consume ~${consumoMensualM3.toFixed(1)} m³ por mes (${Math.round(litrosPorPersonaDia)} L por persona/día). ${categoria}.`,
  };
}
