/**
 * Depreciación y valor estimado de un auto usado en México. Modelo heurístico:
 * caída fuerte el primer año + depreciación compuesta anual + ajuste por kilometraje.
 * El valor real lo fija el mercado (Libro Azul / Guía EBC): esto es una estimación.
 * Sin constantes fiscales.
 */
export interface Inputs {
  precioNuevo: number;                 // precio de compra / valor de nuevo ($)
  antiguedadAnios: number;             // años de antigüedad del auto
  kmRecorridos: number;                // kilometraje total del odómetro
  tasaDepreciacionAnual: number;       // % de depreciación anual, editable
  primerAnioMayor: 'si' | 'no';        // aplicar caída mayor (20%) el primer año
}

export interface Outputs {
  valorEstimado: number;
  depreciacionTotal: number;
  porcentajeDepreciacion: number;
  penalizacionKm: number;
  depreciacionAnualPromedio: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const precio = Math.max(0, Number(i.precioNuevo) || 0);
  const antiguedad = Math.max(0, Math.round(Number(i.antiguedadAnios) || 0));
  const km = Math.max(0, Number(i.kmRecorridos) || 0);
  const tasa = Math.min(60, Math.max(0, Number(i.tasaDepreciacionAnual) || 0)) / 100;
  const primerAnio = i.primerAnioMayor !== 'no';

  // Depreciación por antigüedad
  let valor = precio;
  if (antiguedad >= 1) {
    let inicio = 1;
    if (primerAnio) {
      valor = valor * (1 - 0.20); // el primer año suele caer ~20%
      inicio = 2;
    }
    for (let y = inicio; y <= antiguedad; y++) {
      valor = valor * (1 - tasa);
    }
  }

  // Ajuste por kilometraje: se penaliza el exceso sobre ~15.000 km/año.
  const kmEsperado = 15000 * antiguedad;
  const excesoKm = Math.max(0, km - kmEsperado);
  const penalizacionKmPct = Math.min(0.20, (excesoKm / 10000) * 0.05); // 5% por cada 10.000 km extra, tope 20%
  const valorPenalizacion = valor * penalizacionKmPct;
  const valorEstimado = Math.max(0, valor - valorPenalizacion);

  const depreciacionTotal = precio - valorEstimado;
  const porcentajeDepreciacion = precio > 0 ? (depreciacionTotal / precio) * 100 : 0;
  const depreciacionAnualPromedio = antiguedad > 0 ? depreciacionTotal / antiguedad : 0;

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const money = (v: number) => '$' + Math.round(v).toLocaleString('es-MX');

  const _insight = {
    title: 'Valor estimado de tu auto',
    text: `Un auto de **${money(precio)}** a nuevo, con **${antiguedad}** año(s) y **${km.toLocaleString('es-MX')} km**, vale hoy alrededor de **${money(valorEstimado)}**: perdió **${money(depreciacionTotal)}** (**${porcentajeDepreciacion.toFixed(1)}%**). ${excesoKm > 0 ? `El kilometraje alto le resta un ${(penalizacionKmPct * 100).toFixed(0)}% extra.` : 'El kilometraje está dentro de lo esperado.'} Contrastá con el Libro Azul antes de comprar o vender.`,
    tone: 'neutral',
    icon: '🚙',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Valor de nuevo', 'Valor estimado hoy'],
    values: [Math.round(precio), Math.round(valorEstimado)],
    prefix: '$',
    ariaLabel: `Valor de nuevo ${money(precio)} frente a valor estimado hoy ${money(valorEstimado)}.`,
  };

  return {
    valorEstimado: round2(valorEstimado),
    depreciacionTotal: round2(depreciacionTotal),
    porcentajeDepreciacion: round2(porcentajeDepreciacion),
    penalizacionKm: round2(valorPenalizacion),
    depreciacionAnualPromedio: round2(depreciacionAnualPromedio),
    _insight,
    _chart,
  };
}
