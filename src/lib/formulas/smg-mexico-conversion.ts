/**
 * Conversor de Salario Mínimo General (SMG) México
 * Dos zonas: General y Frontera Norte
 * Valores proyectados 2026, validar contra fuente oficial CONASAMI
 */

export interface Inputs {
  zona: 'general' | 'frontera';
  dias?: number;
}

export interface Outputs {
  importePesos: number;
  mensual: number;
  anual: number;
  tasaDiaria: number;
  mensaje: string;
}

// Valores proyectados 2026, validar contra fuente oficial
const SMG_2026 = {
  general: 280.00,
  frontera: 420.00,
};

export function smgMexicoConversion(i: Inputs): Outputs {
  const zona = i.zona;
  const dias = Number(i.dias ?? 1);

  if (!['general', 'frontera'].includes(zona)) {
    throw new Error('Zona debe ser general o frontera');
  }
  if (!dias || dias <= 0) throw new Error('Ingresá los días (mínimo 1)');

  const tasaDiaria = SMG_2026[zona];
  const importePesos = tasaDiaria * dias;
  const mensual = tasaDiaria * 30.4;
  const anual = tasaDiaria * 365;

  return {
    importePesos: Number(importePesos.toFixed(2)),
    mensual: Number(mensual.toFixed(2)),
    anual: Number(anual.toFixed(2)),
    tasaDiaria,
    mensaje: `SMG ${zona} 2026: $${tasaDiaria}/día × ${dias} días = $${importePesos.toFixed(2)}. Mensual: $${mensual.toFixed(2)} | Anual: $${anual.toFixed(2)}.`,
  };
}
