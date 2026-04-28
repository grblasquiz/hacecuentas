export interface Inputs {
  valor_catastral: number;
  municipio: string;
  tipo_personalizado?: number;
  tipo_inmueble: 'urbano' | 'rustico';
  es_vivienda_habitual?: boolean;
  familia_numerosa?: boolean;
  categoria_familia_numerosa?: 'general' | 'especial';
}

export interface Outputs {
  cuota_integra: number;
  descuento_familia_numerosa: number;
  cuota_final: number;
  cuota_mensual: number;
  comparativa: string;
  tipo_aplicado: number;
}

// Tipos impositivos IBI urbano 2026 — fuente: ordenanzas fiscales municipales
const TIPOS_MUNICIPIOS_URBANO: Record<string, number> = {
  madrid: 0.00456,      // Ordenanza Fiscal IBI Madrid 2026
  barcelona: 0.0066,    // Ordenanza Fiscal IBI Barcelona 2026
  valencia: 0.008,      // Ordenanza Fiscal IBI Valencia 2026
  sevilla: 0.0076,      // Ordenanza Fiscal IBI Sevilla 2026
  zaragoza: 0.0073,     // Ordenanza Fiscal IBI Zaragoza 2026
  malaga: 0.00826,      // Ordenanza Fiscal IBI Málaga 2026
  murcia: 0.0065,       // Ordenanza Fiscal IBI Murcia 2026
  palma: 0.0063,        // Ordenanza Fiscal IBI Palma 2026
  bilbao: 0.0049,       // Ordenanza Fiscal IBI Bilbao 2026
  alicante: 0.0078,     // Ordenanza Fiscal IBI Alicante 2026
};

// Tipos mínimos legales — art. 72 TRLRHL (RDL 2/2004)
const TIPO_MINIMO_URBANO = 0.004;   // 0,4%
const TIPO_MAXIMO_URBANO = 0.011;   // 1,1% (máximo general)
const TIPO_MINIMO_RUSTICO = 0.003;  // 0,3%
const TIPO_MAXIMO_RUSTICO = 0.009;  // 0,9%

// Bonificaciones familia numerosa — art. 74.4 TRLRHL
// Referencia orientativa (cada ayuntamiento fija el porcentaje)
const BONIF_FAMILIA_GENERAL = 0.50;   // 50% — estimación media
const BONIF_FAMILIA_ESPECIAL = 0.75;  // 75% — estimación media (máx legal 90%)

// Ciudades para comparativa
const COMPARATIVA_CIUDADES: Array<{ nombre: string; tipo: number }> = [
  { nombre: 'Madrid', tipo: 0.00456 },
  { nombre: 'Barcelona', tipo: 0.0066 },
  { nombre: 'Valencia', tipo: 0.008 },
  { nombre: 'Sevilla', tipo: 0.0076 },
  { nombre: 'Zaragoza', tipo: 0.0073 },
];

function formatEur(valor: number): string {
  return valor.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + '€';
}

export function compute(i: Inputs): Outputs {
  const valorCatastral = Math.max(0, i.valor_catastral || 0);

  // Determinar tipo impositivo
  let tipoAplicado: number;

  if (i.municipio === 'personalizado') {
    const tipoInput = (i.tipo_personalizado || 0) / 100;
    if (i.tipo_inmueble === 'rustico') {
      tipoAplicado = Math.min(
        Math.max(tipoInput, TIPO_MINIMO_RUSTICO),
        TIPO_MAXIMO_RUSTICO
      );
    } else {
      tipoAplicado = Math.min(
        Math.max(tipoInput, TIPO_MINIMO_URBANO),
        TIPO_MAXIMO_URBANO
      );
    }
  } else {
    const tipoMunicipio = TIPOS_MUNICIPIOS_URBANO[i.municipio];
    if (tipoMunicipio !== undefined) {
      tipoAplicado = tipoMunicipio;
    } else {
      // Fallback al mínimo legal según tipo de inmueble
      tipoAplicado =
        i.tipo_inmueble === 'rustico' ? TIPO_MINIMO_RUSTICO : TIPO_MINIMO_URBANO;
    }
  }

  // Cuota íntegra
  const cuotaIntegra = valorCatastral * tipoAplicado;

  // Calcular descuento familia numerosa
  // Solo aplica en vivienda habitual urbana
  let descuentoFamiliaNumerosa = 0;
  if (
    i.familia_numerosa &&
    i.es_vivienda_habitual &&
    i.tipo_inmueble === 'urbano'
  ) {
    const pctBonificacion =
      i.categoria_familia_numerosa === 'especial'
        ? BONIF_FAMILIA_ESPECIAL
        : BONIF_FAMILIA_GENERAL;
    descuentoFamiliaNumerosa = cuotaIntegra * pctBonificacion;
  }

  // Cuota final
  const cuotaFinal = Math.max(0, cuotaIntegra - descuentoFamiliaNumerosa);

  // Cuota mensual equivalente
  const cuotaMensual = cuotaFinal / 12;

  // Comparativa con 5 grandes ciudades
  const lineasComparativa = COMPARATIVA_CIUDADES.map((ciudad) => {
    const cuota = valorCatastral * ciudad.tipo;
    const pct = (ciudad.tipo * 100).toFixed(3).replace('.', ',');
    return `${ciudad.nombre} (${pct}%): ${formatEur(cuota)}/año`;
  });
  const comparativaTexto =
    'Con un valor catastral de ' +
    formatEur(valorCatastral) +
    ' pagarías:\n' +
    lineasComparativa.join('\n') +
    '\n\nNota: Importes sin bonificaciones. Tipos orientativos 2026.';

  return {
    cuota_integra: Math.round(cuotaIntegra * 100) / 100,
    descuento_familia_numerosa: Math.round(descuentoFamiliaNumerosa * 100) / 100,
    cuota_final: Math.round(cuotaFinal * 100) / 100,
    cuota_mensual: Math.round(cuotaMensual * 100) / 100,
    comparativa: comparativaTexto,
    tipo_aplicado: Math.round(tipoAplicado * 100000) / 1000, // devuelve % con 3 decimales
  };
}
