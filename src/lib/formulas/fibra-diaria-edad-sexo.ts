/**
 * Fibra diaria según IOM.
 */

export interface FibraDiariaEdadSexoInputs {
  sexo: string;
  edad: number;
}

export interface FibraDiariaEdadSexoOutputs {
  fibraGramos: number;
  rangoEdad: string;
  alimentosSugeridos: string;
  resumen: string;
}

export function fibraDiariaEdadSexo(inputs: FibraDiariaEdadSexoInputs): FibraDiariaEdadSexoOutputs {
  const edad = Number(inputs.edad);
  const sexo = inputs.sexo || 'mujer';
  if (!edad || edad <= 0) throw new Error('Ingresá edad válida');
  let fibra: number;
  let rango: string;
  if (edad < 9) {
    fibra = edad + 5;
    rango = 'Niños (regla edad+5)';
  } else if (edad <= 13) {
    fibra = sexo === 'hombre' ? 31 : 26;
    rango = '9-13 años';
  } else if (edad <= 18) {
    fibra = sexo === 'hombre' ? 38 : 26;
    rango = '14-18 años';
  } else if (edad <= 50) {
    fibra = sexo === 'hombre' ? 38 : 25;
    rango = '19-50 años';
  } else {
    fibra = sexo === 'hombre' ? 30 : 21;
    rango = '51+ años';
  }
  return {
    fibraGramos: fibra,
    rangoEdad: rango,
    alimentosSugeridos: '1 taza avena + 1 manzana + 1 taza lentejas + 1 taza brócoli ≈ 28g',
    resumen: `Necesitás ${fibra}g de fibra/día (${rango}, ${sexo}).`,
  };
}
