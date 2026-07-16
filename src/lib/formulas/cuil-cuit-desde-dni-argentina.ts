/**
 * CUIL/CUIT desde el DNI — Argentina.
 *
 * Utilidad determinística (no depende de ningún dato fiscal, por eso el calc
 * usa frequency:"never"). Implementa el algoritmo REAL de ANSES/ARCA:
 *
 *   CUIL = prefijo(2) + DNI(8, con ceros a la izquierda) + dígito verificador(1)
 *
 *   - Prefijo: 20 (masculino), 27 (femenino). Si el dígito verificador diera 10
 *     (caso imposible de un solo dígito), se usa el prefijo alternativo 23 y se
 *     recalcula el verificador.
 *   - Dígito verificador (módulo 11): se multiplican los 10 dígitos del prefijo+DNI
 *     por la serie fija [5,4,3,2,7,6,5,4,3,2], se suman, se toma el resto de dividir
 *     por 11 y el verificador es 11 − resto (con las excepciones de resto 0 y 1).
 *
 * Para una persona física, el CUIT es el MISMO número que el CUIL (mismo prefijo
 * 20/23/27). El prefijo 30/33/34 corresponde a personas jurídicas (empresas), que
 * no se derivan de un DNI.
 */

export interface Inputs {
  dni: number | string;
  sexo?: string; // 'M' | 'F' | 'X'  (X → se usa prefijo 20 por defecto)
}

export interface Outputs {
  cuil: string;
  cuit: string;
  prefijo: string;
  digitoVerificador: number;
  dniNormalizado: string;
  detalle: string;
  _insight?: any;
}

const MULT = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

/** Resto módulo 11 de la base de 10 dígitos (prefijo + DNI de 8). */
function restoMod11(base10: string): number {
  let suma = 0;
  for (let k = 0; k < 10; k++) suma += Number(base10[k]) * MULT[k];
  return suma % 11;
}

export function compute(i: Inputs): Outputs {
  // Normalizar DNI: solo dígitos, sin puntos. Máx 8 dígitos, mín 1.
  const dniLimpio = String(i.dni ?? '').replace(/\D/g, '').replace(/^0+/, '');
  if (!dniLimpio || dniLimpio.length === 0) {
    throw new Error('Ingresá un número de DNI válido (solo números).');
  }
  if (dniLimpio.length > 8) {
    throw new Error('El DNI no puede tener más de 8 dígitos.');
  }
  const dni8 = dniLimpio.padStart(8, '0');

  const sexo = String(i.sexo || 'M').toUpperCase();
  let prefijo = sexo === 'F' ? '27' : '20'; // 'X'/desconocido → 20

  let base = prefijo + dni8;
  let resto = restoMod11(base);
  let dv: number;

  if (resto === 0) {
    dv = 0;
  } else if (resto === 1) {
    // El verificador daría 10 (dos dígitos, imposible). ANSES asigna prefijo 23
    // y recalcula el dígito con la nueva base.
    prefijo = '23';
    base = prefijo + dni8;
    const resto23 = restoMod11(base);
    dv = resto23 === 0 ? 0 : 11 - resto23;
    if (dv === 10) dv = 9; // guarda defensiva: nunca devolver dos dígitos
  } else {
    dv = 11 - resto;
  }

  const dniFmt = Number(dniLimpio).toLocaleString('es-AR');
  const cuil = `${prefijo}-${dni8}-${dv}`;
  const generoTxt = sexo === 'F' ? 'femenino' : sexo === 'X' ? 'no binario/otro' : 'masculino';

  const _insight = {
    title: `Tu CUIL es ${cuil}`,
    text: `Para el DNI **${dniFmt}** (género ${generoTxt}) el CUIL/CUIT es **${cuil}**. Se arma con el prefijo **${prefijo}**, tu DNI con ceros a la izquierda (**${dni8}**) y el dígito verificador **${dv}**, calculado por módulo 11. Para una persona física el **CUIT es el mismo número** que el CUIL.`,
    tone: 'good',
    icon: '🪪',
  };

  return {
    cuil,
    cuit: cuil, // persona física: CUIT = CUIL
    prefijo,
    digitoVerificador: dv,
    dniNormalizado: dni8,
    detalle: `DNI ${dniFmt} → prefijo ${prefijo} + ${dni8} + dígito verificador ${dv} = CUIL/CUIT ${cuil}.`,
    _insight,
  };
}
