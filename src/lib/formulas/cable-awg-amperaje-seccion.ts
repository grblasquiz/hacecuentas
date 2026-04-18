const TABLA_AWG = [{awg: 18, mm2: 0.82, d: 1.02, a: 10}, {awg: 16, mm2: 1.31, d: 1.29, a: 13}, {awg: 14, mm2: 2.08, d: 1.63, a: 15}, {awg: 12, mm2: 3.31, d: 2.05, a: 20}, {awg: 10, mm2: 5.26, d: 2.59, a: 30}, {awg: 8, mm2: 8.37, d: 3.26, a: 40}, {awg: 6, mm2: 13.3, d: 4.11, a: 55}, {awg: 4, mm2: 21.2, d: 5.19, a: 70}, {awg: 2, mm2: 33.6, d: 6.54, a: 95}];
export interface CableAwgAmperajeSeccionInputs { corriente: number; tipoInstalacion: string; }
export interface CableAwgAmperajeSeccionOutputs { awg: string; seccionMm2: string; diametroMm: string; resumen: string; }
export function cableAwgAmperajeSeccion(i: CableAwgAmperajeSeccionInputs): CableAwgAmperajeSeccionOutputs {
  const c = Number(i.corriente);
  if (!c || c <= 0) throw new Error('Ingresá corriente');
  const entry = TABLA_AWG.find(e => e.a >= c) ?? TABLA_AWG[TABLA_AWG.length - 1];
  return { awg: 'AWG ' + entry.awg, seccionMm2: entry.mm2.toFixed(2) + ' mm²', diametroMm: entry.d.toFixed(2) + ' mm',
    resumen: `Para ${c} A necesitás AWG ${entry.awg} (${entry.mm2} mm², diámetro ${entry.d} mm). Soporta hasta ${entry.a} A.` };
}
