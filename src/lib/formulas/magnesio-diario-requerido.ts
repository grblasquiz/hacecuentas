/**
 * Magnesio RDA.
 */

export interface MagnesioDiarioRequeridoInputs {
  sexo: string;
  edad: number;
}

export interface MagnesioDiarioRequeridoOutputs {
  magnesioMg: number;
  suplementoSugerido: string;
  resumen: string;
}

export function magnesioDiarioRequerido(inputs: MagnesioDiarioRequeridoInputs): MagnesioDiarioRequeridoOutputs {
  const edad = Number(inputs.edad);
  const sexo = inputs.sexo || 'mujer';
  if (!edad || edad <= 0) throw new Error('Ingresá edad válida');
  let mg: number;
  if (edad < 4) mg = 80;
  else if (edad < 9) mg = 130;
  else if (edad < 14) mg = 240;
  else if (edad < 19) mg = sexo === 'hombre' ? 410 : 360;
  else if (edad < 31) mg = sexo === 'hombre' ? 400 : 310;
  else mg = sexo === 'hombre' ? 420 : 320;
  return {
    magnesioMg: mg,
    suplementoSugerido: 'Glicinato (sueño) o citrato (constipación). Evitar óxido.',
    resumen: `Tu RDA: ${mg} mg magnesio/día.`,
  };
}
