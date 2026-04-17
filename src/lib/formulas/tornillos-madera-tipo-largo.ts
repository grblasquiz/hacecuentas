/**
 * Calculadora de tornillos para madera por espesor
 */

export interface Inputs {
  espesorSup: number; espesorInf: number; tipoMadera: number; tipoUnion: number;
}

export interface Outputs {
  largoTornillo: string; diametroTornillo: string; tipoCabeza: string; pretaladrado: string;
}

export function tornillosMaderaTipoLargo(inputs: Inputs): Outputs {
  const es = Number(inputs.espesorSup);
  const ei = Number(inputs.espesorInf);
  const tm = Math.round(Number(inputs.tipoMadera));
  const tu = Math.round(Number(inputs.tipoUnion));
  if (!es || !ei || !tm || !tu) throw new Error('Completá los campos');
  const largoCalc = es + (2/3) * ei;
  const tipicos = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 120];
  const largo = tipicos.find(t => t >= largoCalc) || Math.ceil(largoCalc);
  let diam = 4;
  if (es >= 25) diam = 5;
  else if (es <= 12) diam = 3.5;
  if (tu === 3) diam = Math.max(diam, 5);
  const cabezaMap: Record<number, string> = {
    1: 'Fresada (hundir y tapar)',
    2: 'Cilíndrica o decorativa',
    3: 'Hexagonal o allen (estructural)',
  };
  const pretaladroRule = tm === 1 ? (diam >= 5 ? 'Recomendado con mecha' : 'Opcional en pino') :
    tm === 2 ? 'Obligatorio (MDF se abre)' :
    'Obligatorio (madera dura)';
  const mechaMap: Record<number, number> = { 3: 2, 3.5: 2.5, 4: 3, 4.5: 3.5, 5: 4, 6: 5 };
  const mecha = mechaMap[diam] || 3;
  return {
    largoTornillo: `${largo} mm`,
    diametroTornillo: `${diam} mm`,
    tipoCabeza: cabezaMap[tu] || cabezaMap[1],
    pretaladrado: `${pretaladroRule} - Mecha ${mecha} mm`,
  };
}
