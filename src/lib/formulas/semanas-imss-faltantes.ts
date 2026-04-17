/**
 * Calculadora de semanas IMSS faltantes para pensión (Ley 97)
 * 1250 semanas requeridas
 */

export interface Inputs {
  semanasCotizadasActuales: number;
  edad: number;
}

export interface Outputs {
  semanasFaltan: number;
  aniosFaltan: number;
  porcentajeAvance: number;
  mensaje: string;
}

export function semanasImssFaltantes(i: Inputs): Outputs {
  const semanas = Number(i.semanasCotizadasActuales);
  const edad = Number(i.edad);

  if (semanas === undefined || semanas === null || isNaN(semanas) || semanas < 0) {
    throw new Error('Ingresá las semanas cotizadas actuales');
  }
  if (!edad || edad <= 0) throw new Error('Ingresá la edad');

  const REQ = 1250;
  const semanasFaltan = Math.max(0, REQ - semanas);
  const aniosFaltan = Number((semanasFaltan / 52).toFixed(2));
  const porcentajeAvance = Number(Math.min(100, (semanas / REQ) * 100).toFixed(2));

  let mensaje = '';
  if (semanasFaltan === 0) {
    mensaje = `Ya tenés las 1250 semanas requeridas. Avance: ${porcentajeAvance}%.`;
  } else {
    mensaje = `Te faltan ${semanasFaltan} semanas (${aniosFaltan} años cotizando). Avance: ${porcentajeAvance}%.`;
  }

  return {
    semanasFaltan,
    aniosFaltan,
    porcentajeAvance,
    mensaje,
  };
}
