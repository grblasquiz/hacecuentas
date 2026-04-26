/** Kg de pellet + heno por mes para conejo según peso y edad */
export interface Inputs { pesoKg: number; edadMeses: number; tipoActividad: string; }
export interface Outputs { pelletKgMes: number; henoKgMes: number; verdurasGramosDia: number; costoMensualEstimado: number; explicacion: string; }
export function conejoAlimentoPelletHenoMesKg(i: Inputs): Outputs {
  const peso = Number(i.pesoKg);
  const edad = Number(i.edadMeses);
  const actividad = String(i.tipoActividad || '').toLowerCase();
  if (!peso || peso <= 0) throw new Error('Ingresá el peso del conejo');
  // Pellet: adulto 25g/kg, junior 50g/kg
  const ratioPellet = edad < 6 ? 0.05 : edad < 12 ? 0.035 : 0.025;
  const factorActividad = actividad === 'alta' ? 1.15 : actividad === 'baja' ? 0.9 : 1;
  const pelletDiaG = peso * 1000 * ratioPellet * factorActividad;
  const pelletMesKg = (pelletDiaG * 30) / 1000;
  // Heno: ad libitum, ref ~peso corporal en heno por día
  const henoDiaG = peso * 60; // 6% peso/día
  const henoMesKg = (henoDiaG * 30) / 1000;
  // Verduras frescas: ~10% peso corporal
  const verduras = peso * 100;
  // Costo ref ARS 2026: pellet $4500/kg, heno $3800/kg
  const costo = pelletMesKg * 4500 + henoMesKg * 3800;
  return {
    pelletKgMes: Number(pelletMesKg.toFixed(2)),
    henoKgMes: Number(henoMesKg.toFixed(2)),
    verdurasGramosDia: Number(verduras.toFixed(0)),
    costoMensualEstimado: Number(costo.toFixed(0)),
    explicacion: `Conejo ${peso}kg, ${edad} meses: ${pelletMesKg.toFixed(2)}kg pellet + ${henoMesKg.toFixed(2)}kg heno por mes + ${verduras.toFixed(0)}g verduras/día.`,
  };
}
