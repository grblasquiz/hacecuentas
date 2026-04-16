/** pH del suelo: corrección con cal o azufre */
export interface Inputs { phActual: number; phDeseado: number; superficieM2: number; tipoSuelo?: string; }
export interface Outputs { productoUsar: string; kgTotal: number; gramosM2: number; instruccion: string; }

const BUFFER_SUELO: Record<string, number> = { arenoso: 0.7, franco: 1.0, arcilloso: 1.4 };

export function phSueloCorreccion(i: Inputs): Outputs {
  const phAct = Number(i.phActual);
  const phDes = Number(i.phDeseado);
  const m2 = Number(i.superficieM2);
  const suelo = String(i.tipoSuelo || 'franco');
  if (!phAct || !phDes) throw new Error('Ingresá ambos valores de pH');
  if (!m2 || m2 <= 0) throw new Error('Ingresá la superficie');
  if (phAct === phDes) throw new Error('El pH actual ya es el deseado');

  const buffer = BUFFER_SUELO[suelo] || 1;
  const diff = Math.abs(phDes - phAct);

  let producto = '';
  let gm2 = 0;
  let instruccion = '';

  if (phDes > phAct) {
    // Subir pH = agregar cal
    producto = 'Cal agrícola (carbonato de calcio)';
    gm2 = diff * 200 * buffer; // ~200 g/m2 por punto de pH en suelo franco
    instruccion = 'Esparcí la cal uniformemente sobre el suelo y mezclala con los primeros 15-20 cm. Regá bien después. Aplicá 2-3 meses antes de sembrar.';
  } else {
    // Bajar pH = agregar azufre
    producto = 'Azufre elemental';
    gm2 = diff * 60 * buffer; // ~60 g/m2 por punto de pH
    instruccion = 'Esparcí el azufre sobre el suelo y mezclalo con los primeros 15 cm. Las bacterias del suelo lo convierten en ácido sulfúrico en 1-3 meses. No aplicar cerca de raíces activas.';
  }

  const kgTotal = (gm2 * m2) / 1000;

  return {
    productoUsar: producto,
    kgTotal: Number(kgTotal.toFixed(2)),
    gramosM2: Math.round(gm2),
    instruccion,
  };
}
