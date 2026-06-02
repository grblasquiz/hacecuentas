export interface Inputs {
  tipo_vuelo: 'nacional' | 'internacional';
  valor_tiquete_base: number;
  aeropuerto_origen: string;
  aerolinea_categoria: 'nacional' | 'internacional';
}

export interface Outputs {
  valor_tiquete_base: number;
  tasa_embarque: number;
  subtotal_antes_iva: number;
  iva_19_porcent: number;
  cargo_servicios_terminal: number;
  total_tiquete: number;
  porcentaje_impuestos_tasas: number;
  desglose_texto: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 - DGAC y SII
  const IVA_RATE = 0.19; // 19% conforme DL 825
  
  // Tasas de embarque por tipo de vuelo (resolución DGAC 2026)
  const tasasEmbargue: Record<string, number> = {
    nacional: 4500,  // Promedio nacional CLP
    internacional: 35000 // USD 35 ≈ 35.000 CLP (TCE Banco Central ~1.000 CLP/USD)
  };
  
  // Cargo servicios terminal por aeropuerto (MOP / Operador terminal 2026)
  const cargosTerminal: Record<string, number> = {
    scl: 3500,          // Santiago terminal doméstica
    iquique: 2000,
    calama: 1800,
    antofagasta: 2200,
    valparaiso: 2000,
    concepcion: 2100,
    temuco: 2000,
    puerto_montt: 2100,
    punta_arenas: 2300
  };
  
  // Ajuste cargo terminal para vuelos internacionales (+40%)
  const cargoInternacional: Record<string, number> = {
    scl: 5000,
    iquique: 2800,
    calama: 2500,
    antofagasta: 3100,
    valparaiso: 2800,
    concepcion: 2900,
    temuco: 2800,
    puerto_montt: 2900,
    punta_arenas: 3200
  };
  
  // Seleccionar tasa de embarque
  const tasaEmbarque = tasasEmbargue[i.tipo_vuelo] || 4500;
  
  // Seleccionar cargo terminal según tipo vuelo
  const cargoTerminalBase = i.tipo_vuelo === 'internacional'
    ? (cargoInternacional[i.aeropuerto_origen] || 5000)
    : (cargosTerminal[i.aeropuerto_origen] || 2500);
  
  // Subtotal antes de IVA (base + tasas)
  const subtotalAntesIva = i.valor_tiquete_base + tasaEmbarque + cargoTerminalBase;
  
  // IVA 19%
  const iva = subtotalAntesIva * IVA_RATE;
  
  // Total a pagar
  const totalTiquete = subtotalAntesIva + iva;
  
  // Porcentaje impuestos y tasas
  const porcentajeImpuestos = ((tasaEmbarque + cargoTerminalBase + iva) / totalTiquete) * 100;
  
  // Desglose texto
  const desglose = `Tiquete base: $${i.valor_tiquete_base.toLocaleString('es-CL')}\n` +
    `Tasa embarque (DGAC): $${tasaEmbarque.toLocaleString('es-CL')}\n` +
    `Cargo servicios terminal: $${cargoTerminalBase.toLocaleString('es-CL')}\n` +
    `Subtotal: $${subtotalAntesIva.toLocaleString('es-CL')}\n` +
    `IVA 19%: $${Math.round(iva).toLocaleString('es-CL')}\n` +
    `---\n` +
    `TOTAL A PAGAR: $${Math.round(totalTiquete).toLocaleString('es-CL')}\n\n` +
    `Composición: ${((i.valor_tiquete_base / totalTiquete) * 100).toFixed(1)}% tiquete, ` +
    `${porcentajeImpuestos.toFixed(1)}% impuestos/tasas`;
  
  const totalR = Math.round(totalTiquete);
  const ivaR = Math.round(iva);
  const pctImpuestosR = Math.round(porcentajeImpuestos * 10) / 10;
  const recargo = tasaEmbarque + cargoTerminalBase + ivaR;

  const _insight = {
    title: 'Cuánto se va en impuestos y tasas',
    text: `Sobre un tiquete base de **$${i.valor_tiquete_base.toLocaleString('es-CL')}**, terminás pagando **$${totalR.toLocaleString('es-CL')}**: unos **$${recargo.toLocaleString('es-CL')}** son IVA, tasa de embarque y cargo de terminal, o sea el **${pctImpuestosR.toFixed(1)}%** del total. ${pctImpuestosR >= 30 ? 'Compará la tarifa final, no la base publicitada.' : 'El recargo es moderado para un vuelo doméstico.'}`,
    tone: pctImpuestosR >= 30 ? 'warn' : 'neutral',
    icon: '✈️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Tiquete base', value: i.valor_tiquete_base },
      { label: 'Tasa embarque', value: tasaEmbarque },
      { label: 'Cargo terminal', value: cargoTerminalBase },
      { label: 'IVA 19%', value: ivaR },
    ],
    prefix: '$',
    centerValue: `$${totalR.toLocaleString('es-CL')}`,
    centerLabel: 'Total a pagar',
    ariaLabel: `El total de $${totalR.toLocaleString('es-CL')} se compone del tiquete base, la tasa de embarque, el cargo de terminal y el IVA del 19%`,
  };

  return {
    valor_tiquete_base: i.valor_tiquete_base,
    tasa_embarque: tasaEmbarque,
    subtotal_antes_iva: subtotalAntesIva,
    iva_19_porcent: ivaR,
    cargo_servicios_terminal: cargoTerminalBase,
    total_tiquete: totalR,
    porcentaje_impuestos_tasas: pctImpuestosR,
    desglose_texto: desglose,
    _insight,
    _chart
  };
}
