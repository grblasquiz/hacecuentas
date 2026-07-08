/**
 * Calculadora de Letra del DNI Argentino
 * Algoritmo módulo 11 con pesos 2,3,4,5,6,7
 */
export interface LetraDniInputs { numeroDni: number; }
export interface LetraDniOutputs { letraDni: string; dniCompleto: string; explicacion: string; _insight?: any; }

export function letraDniArgentina(inputs: LetraDniInputs): LetraDniOutputs {
  const dni = Number(inputs.numeroDni);
  if (!dni || dni < 1000000 || dni > 99999999) throw new Error('Ingresá un número de DNI válido (7-8 dígitos)');

  const dniStr = dni.toString().padStart(8, '0');
  const pesos = [2, 3, 4, 5, 6, 7, 2, 3];
  let suma = 0;
  for (let i = 0; i < 8; i++) {
    suma += parseInt(dniStr[7 - i]) * pesos[i];
  }
  const resto = suma % 11;
  const resultado = 11 - resto;

  const LETRAS = 'ABCDEFGHIJKL';
  const indice = resultado === 11 ? 0 : resultado === 10 ? 10 : resultado;
  const letra = LETRAS[indice] || 'A';

  const dniFormateado = dni.toLocaleString('es-AR');

  const _insight = {
    title: 'Letra del DNI',
    text: `Para el DNI **${dniFormateado}**, la letra de control por módulo 11 es **${letra}**. Es un valor orientativo: el DNI argentino no tiene letra verificadora oficial — en los trámites se usa el dígito verificador del CUIL/CUIT.`,
    tone: 'neutral',
    icon: '🪪',
  };

  return {
    letraDni: letra,
    dniCompleto: `${dniFormateado} ${letra}`,
    explicacion: `Suma ponderada: ${suma}. Módulo 11: ${resto}. Resultado: ${resultado} → Letra ${letra}`,
    _insight,
  };
}
