/** Watts UVB necesarios según tamaño tortuga acuática y litros */
export interface Inputs { largoCaparazonCm: number; litrosPecera: number; alturaLamparaCm: number; tipoLampara: string; }
export interface Outputs { wattsUvbRecomendados: number; uviObjetivo: number; horasDiariasRecomendadas: number; vidaUtilMeses: number; explicacion: string; }
export function tortugaAcuaticaUvbWattsPecera(i: Inputs): Outputs {
  const caparazon = Number(i.largoCaparazonCm);
  const litros = Number(i.litrosPecera);
  const altura = Number(i.alturaLamparaCm) || 25;
  const tipo = String(i.tipoLampara || '').toLowerCase();
  if (!caparazon || caparazon <= 0) throw new Error('Ingresá el largo del caparazón');
  // UVB watts según tamaño tortuga + altura lámpara
  let baseWatts = caparazon < 8 ? 13 : caparazon < 15 ? 26 : caparazon < 25 ? 40 : 55;
  const factorLitros = litros > 200 ? 1.3 : litros > 100 ? 1.15 : 1;
  const factorAltura = altura > 30 ? 1.4 : altura > 20 ? 1.1 : 1;
  const watts = baseWatts * factorLitros * factorAltura;
  // UVI objetivo: 2.5-4 para tortugas acuáticas
  const uvi = 3 + (caparazon > 20 ? 0.5 : 0);
  const horas = caparazon < 10 ? 10 : 12;
  const vida: Record<string, number> = { 'compacta': 6, 'tubo-t5': 12, 'tubo-t8': 9, 'mercurio': 12 };
  const meses = vida[tipo] ?? 9;
  return {
    wattsUvbRecomendados: Number(watts.toFixed(0)),
    uviObjetivo: Number(uvi.toFixed(1)),
    horasDiariasRecomendadas: Number(horas.toFixed(0)),
    vidaUtilMeses: Number(meses.toFixed(0)),
    explicacion: `Tortuga ${caparazon}cm en ${litros}L: ${watts.toFixed(0)}W UVB (${tipo}), UVI ${uvi.toFixed(1)}, ${horas}h/día. Reemplazá la lámpara cada ${meses} meses.`,
  };
}
