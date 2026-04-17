/** Litros de agua para pez Betta según tipo y convivencia. */
export interface Inputs {
  tipo?: string;
  cantidad?: number;
  conCompaneros?: boolean;
}
export interface Outputs {
  litrosMinimo: number;
  litrosIdeal: number;
  temperatura: string;
  equipamiento: string;
  cambioAguaFrecuencia: string;
}

export function aguaPezBettaLitros(i: Inputs): Outputs {
  const tipo = String(i.tipo || 'macho');
  const cant = Math.max(1, Math.round(Number(i.cantidad ?? 1)));
  const conComp = i.conCompaneros === true;

  let min = 10, ideal = 20;
  if (tipo === 'hembra-sola') { min = 10; ideal = 15; }
  else if (tipo === 'sorority') {
    // Sorority: mínimo 5 hembras
    const n = Math.max(cant, 5);
    min = 40 + (n - 5) * 5;
    ideal = 60 + (n - 5) * 8;
  } else {
    // macho: solo uno — si cant > 1, escalamos como advertencia
    if (cant > 1) {
      min = 10 * cant;
      ideal = 20 * cant;
    }
  }

  if (conComp) {
    min = Math.max(min, 40);
    ideal = Math.max(ideal, 70);
  }

  const equipamiento = 'Calefactor (25-27°C), filtro esponja o cascada suave, plantas naturales o seda, tapa (saltan), acondicionador de agua, termómetro.';
  const cambio = min <= 15
    ? '30% cada semana (con acondicionador de cloro)'
    : min <= 40
      ? '25% cada semana'
      : '20-25% por semana';

  return {
    litrosMinimo: Math.round(min),
    litrosIdeal: Math.round(ideal),
    temperatura: '25-27°C constante. Por debajo de 22°C enferman.',
    equipamiento,
    cambioAguaFrecuencia: cambio,
  };
}
