/**
 * Conversor de Salario Mínimo General (SMG) México
 * Dos zonas: General y Frontera Norte
 * Valores 2026 (CONASAMI proyectados)
 */

export interface Inputs {
  zona: 'general' | 'frontera';
  sueldo?: number;
  tipo?: 'diario' | 'mensual' | 'anual';
  dias?: number;
}

export interface Outputs {
  cuantosMinimos: number;
  smgDiario: number;
  smgMensual: number;
  smgAnual: number;
  cumplePiso: string;
  diferenciaMinimo: number;
  mensaje: string;
}

const SMG_2026 = {
  general: 278.80,
  frontera: 419.88,
};

export function smgMexicoConversion(i: Inputs): Outputs {
  const zona = i.zona;
  if (!['general', 'frontera'].includes(zona)) {
    throw new Error('Zona debe ser general o frontera');
  }

  const smgDiario = SMG_2026[zona];
  const smgMensual = smgDiario * 30;
  const smgAnual = smgDiario * 365;

  const sueldo = Number(i.sueldo ?? 0);
  const tipo = i.tipo ?? 'mensual';

  // Convertir sueldo del usuario a base mensual para comparar
  let sueldoMensual = 0;
  if (sueldo > 0) {
    switch (tipo) {
      case 'diario':
        sueldoMensual = sueldo * 30;
        break;
      case 'mensual':
        sueldoMensual = sueldo;
        break;
      case 'anual':
        sueldoMensual = sueldo / 12;
        break;
    }
  }

  const cuantosMinimos = sueldoMensual > 0 ? sueldoMensual / smgMensual : 0;
  const diferenciaMinimo = sueldoMensual - smgMensual;
  const cumplePiso = sueldoMensual >= smgMensual ? 'Sí cumple el piso' : 'No cumple el piso';

  return {
    cuantosMinimos: Number(cuantosMinimos.toFixed(2)),
    smgDiario: Number(smgDiario.toFixed(2)),
    smgMensual: Number(smgMensual.toFixed(2)),
    smgAnual: Number(smgAnual.toFixed(2)),
    cumplePiso,
    diferenciaMinimo: Number(diferenciaMinimo.toFixed(2)),
    mensaje: `SMG ${zona} 2026: $${smgDiario}/día (mensual $${smgMensual.toFixed(2)}). ${sueldoMensual > 0 ? `Tu sueldo equivale a ${cuantosMinimos.toFixed(2)} SMG.` : ''}`,
  };
}
