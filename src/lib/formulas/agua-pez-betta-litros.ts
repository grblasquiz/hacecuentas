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
  _insight?: any;
}

export function aguaPezBettaLitros(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar.
  (i as any).conCompaneros = (i as any).conCompaneros === true || (i as any).conCompaneros === 'true';
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

  const machosJuntos = (tipo === 'macho') && cant > 1;
  const _insight = {
    title: machosJuntos ? 'Ojo: bettas machos juntos' : 'El acuario de tu betta',
    text: machosJuntos
      ? `Mínimo **${Math.round(min)} L** (ideal **${Math.round(ideal)} L**), pero **${cant} machos no pueden convivir**: pelean a muerte. Necesitás peceras separadas.`
      : `Tu betta necesita mínimo **${Math.round(min)} L**, ideal **${Math.round(ideal)} L**. Olvidate del recipiente chico: con más agua, calefactor a 25-27°C y filtro suave vive mucho mejor.`,
    tone: machosJuntos ? 'warn' : 'neutral',
    icon: '🐟',
  };

  return {
    litrosMinimo: Math.round(min),
    litrosIdeal: Math.round(ideal),
    temperatura: '25-27°C constante. Por debajo de 22°C enferman.',
    equipamiento,
    cambioAguaFrecuencia: cambio,
    _insight,
  };
}
