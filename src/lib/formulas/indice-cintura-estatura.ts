/** WHtR - Índice cintura/estatura */
export interface Inputs { cintura: number; estatura: number; }
export interface Outputs { whtr: number; clasificacion: string; cinturaSaludable: number; mensaje: string; }

export function indiceCinturaEstatura(i: Inputs): Outputs {
  const cintura = Number(i.cintura);
  const estatura = Number(i.estatura);
  if (!cintura || !estatura) throw new Error('Ingresá cintura y estatura');

  const whtr = Number((cintura / estatura).toFixed(2));
  const cinturaSaludable = Math.round(estatura * 0.5);

  let clasificacion: string;
  if (whtr < 0.40) clasificacion = '🟢 Delgadez (posible bajo peso)';
  else if (whtr < 0.50) clasificacion = '🟢 Sin riesgo metabólico adicional';
  else if (whtr < 0.54) clasificacion = '🟡 Riesgo ligeramente aumentado';
  else if (whtr < 0.60) clasificacion = '🟠 Riesgo aumentado';
  else clasificacion = '🔴 Riesgo alto — obesidad abdominal';

  return {
    whtr, clasificacion, cinturaSaludable,
    mensaje: `WHtR: ${whtr}. ${clasificacion}. Tu cintura máxima saludable: ${cinturaSaludable} cm.`
  };
}