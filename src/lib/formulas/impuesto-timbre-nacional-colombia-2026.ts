import { COLOMBIA_2026 } from '../data/colombia-2026';
export interface Inputs {
  tipo_documento: 'escritura_publica' | 'acto_contrato_mercantil' | 'poder_mandato' | 'contrato_privado' | 'documento_jurisdiccional' | 'acta_notarial' | 'otro_documento_publico';
  valor_documento: number;
  exento_timbre: boolean;
}

export interface Outputs {
  aplica_timbre: string;
  uvt_2026: number;
  valor_minimo_uvt: number;
  tarifa_aplicable: number;
  impuesto_timbre: number;
  retenedor: string;
  valor_total_documento: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // UVT 2026 según DIAN Resolución
  const UVT_2026 = COLOMBIA_2026.uvt; // UVT 2026 = $52.374 (Resolución DIAN 000238/2025)
  
  // Umbral mínimo: 6,000 UVT (DIAN)
  const UMBRAL_UVT = 6000;
  const VALOR_MINIMO = UMBRAL_UVT * UVT_2026;
  
  // Tarifas por tipo documento (Código de Comercio - Libro V)
  const TARIFAS: Record<string, number> = {
    'escritura_publica': 0.015,      // 1.5% - Escrituras públicas
    'acto_contrato_mercantil': 0.03, // 3% - Actos/contratos mercantiles
    'poder_mandato': 0.015,          // 1.5% - Poderes y mandatos
    'contrato_privado': 0.015,       // 1.5% - Contratos privados no mercantiles
    'documento_jurisdiccional': 0.0, // 0% - Exento (sentencias, autos)
    'acta_notarial': 0.015,          // 1.5% - Actas notariales
    'otro_documento_publico': 0.015  // 1.5% - Otros documentos públicos
  };
  
  // Responsables de retención por tipo
  const RETENEDORES: Record<string, string> = {
    'escritura_publica': 'Notario público',
    'acto_contrato_mercantil': 'Entidad interviniente o notario',
    'poder_mandato': 'Notario público',
    'contrato_privado': 'Notario si interviene, de lo contrario obligado tributario',
    'documento_jurisdiccional': 'Juzgado (generalmente exento)',
    'acta_notarial': 'Notario público',
    'otro_documento_publico': 'Entidad pública competente'
  };
  
  // Obtener tarifa aplicable
  const tarifa = TARIFAS[i.tipo_documento] ?? 0.015;
  const retenedor = RETENEDORES[i.tipo_documento] ?? 'No determinado';
  
  // Calcular UVT del documento
  const uvt_documento = i.valor_documento / UVT_2026;
  
  // Validar aplicación de timbre
  let aplica_timbre = true;
  let impuesto_timbre = 0;
  let aplica_mensaje = '';
  
  if (i.exento_timbre) {
    aplica_timbre = false;
    aplica_mensaje = 'No aplica: documento exento por ley';
  } else if (i.valor_documento < VALOR_MINIMO) {
    aplica_timbre = false;
    aplica_mensaje = `No aplica: valor por debajo de 6,000 UVT ($${VALOR_MINIMO.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })})`;
  } else if (tarifa === 0) {
    aplica_timbre = false;
    aplica_mensaje = 'No aplica: documento jurisdiccional (exento)';
  } else {
    aplica_timbre = true;
    impuesto_timbre = i.valor_documento * tarifa;
    aplica_mensaje = `Sí aplica. Tarifa: ${(tarifa * 100).toFixed(1)}%`;
  }
  
  // Valor total del documento (incluye timbre)
  const valor_total = i.valor_documento + impuesto_timbre;

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const timbre_red = Math.round(impuesto_timbre);

  let _insight: any;
  let _chart: any;

  if (aplica_timbre) {
    _insight = {
      title: 'El documento causa timbre',
      text: `Este documento paga **${fmtCOP(timbre_red)}** de impuesto de timbre `
        + `(tarifa **${(tarifa * 100).toFixed(1)}%** sobre ${fmtCOP(i.valor_documento)}). `
        + `El costo total queda en **${fmtCOP(valor_total)}** y lo retiene: ${retenedor}.`,
      tone: 'warn',
      icon: '🖋️'
    };
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Valor del documento', value: Math.round(i.valor_documento) },
        { label: 'Impuesto de timbre', value: timbre_red }
      ],
      prefix: '$',
      centerValue: fmtCOP(valor_total),
      centerLabel: 'Costo total',
      ariaLabel: `Costo total de ${fmtCOP(valor_total)}: ${fmtCOP(i.valor_documento)} de valor del documento más ${fmtCOP(timbre_red)} de impuesto de timbre.`
    };
  } else {
    _insight = {
      title: 'No causa impuesto de timbre',
      text: i.exento_timbre
        ? `Este documento está **exento por ley**, así que no pagás impuesto de timbre. El costo queda en **${fmtCOP(i.valor_documento)}**.`
        : tarifa === 0
          ? `Los documentos jurisdiccionales están **exentos** de timbre. No hay impuesto: el costo es **${fmtCOP(i.valor_documento)}**.`
          : `Tu documento (${fmtCOP(i.valor_documento)}) está **por debajo del umbral de 6.000 UVT** (${fmtCOP(VALOR_MINIMO)}), así que **no causa timbre**.`,
      tone: 'good',
      icon: '✅'
    };
  }

  return {
    aplica_timbre: aplica_mensaje,
    uvt_2026: UVT_2026,
    valor_minimo_uvt: VALOR_MINIMO,
    tarifa_aplicable: tarifa * 100,
    impuesto_timbre: timbre_red,
    retenedor: retenedor,
    valor_total_documento: Math.round(valor_total),
    _insight,
    ...(_chart ? { _chart } : {})
  };
}
