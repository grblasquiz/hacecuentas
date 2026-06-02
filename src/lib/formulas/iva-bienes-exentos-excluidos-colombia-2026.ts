export interface Inputs {
  tipo_bien: 'alimento_basico' | 'libro_periodico' | 'medicamento' | 'salud' | 'educacion' | 'transporte_publico' | 'utiles_escolares' | 'otro_exento' | 'otro_excluido';
  valor_base: number;
  es_exento: boolean;
  iva_pagado_insumos: number;
}

export interface Outputs {
  categoria_bien: string;
  tasa_iva: number;
  iva_causado: number;
  iva_descontable: number;
  iva_neto_a_pagar: number;
  valor_total_cliente: number;
  tratamiento_fiscal: string;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN 2026 Colombia
  const IVA_TASA_EXENTO = 0; // Bienes exentos: 0% IVA
  const IVA_TASA_EXCLUIDO = 0; // Servicios excluidos: 0% IVA
  const IVA_TASA_GRAVADO = 0.19; // Tasa estándar para referencia

  // Clasificación automática según tipo
  const bienesExentos = ['alimento_basico', 'libro_periodico', 'medicamento', 'utiles_escolares', 'otro_exento'];
  const bienesExcluidos = ['salud', 'educacion', 'transporte_publico', 'otro_excluido'];

  const esExento = bienesExentos.includes(i.tipo_bien);
  const esExcluido = bienesExcluidos.includes(i.tipo_bien);

  // Validación
  if (!Number.isFinite(i.valor_base) || i.valor_base < 0) {
    i.valor_base = 0;
  }
  if (!Number.isFinite(i.iva_pagado_insumos) || i.iva_pagado_insumos < 0) {
    i.iva_pagado_insumos = 0;
  }

  // Cálculo IVA causado
  let iva_causado = 0; // 0% para exentos y excluidos

  // Cálculo IVA descontable (solo exentos)
  let iva_descontable = 0;
  if (esExento) {
    iva_descontable = i.iva_pagado_insumos; // Puede descontar IVA pagado en insumos
  }
  // Si es excluido, no hay descuenta permitida

  // IVA neto a pagar
  let iva_neto_a_pagar = iva_causado - iva_descontable;
  if (iva_neto_a_pagar < 0) {
    iva_neto_a_pagar = 0; // No paga, tiene crédito (reporta como descubierto)
  }

  // Valor total para el cliente (base + IVA causado, que es $0)
  const valor_total_cliente = i.valor_base + iva_causado;

  // Descripción de categoría
  const mapCategorias: { [key: string]: string } = {
    alimento_basico: 'Alimento básico',
    libro_periodico: 'Libro o periódico',
    medicamento: 'Medicamento de uso humano',
    salud: 'Servicio de salud',
    educacion: 'Servicio de educación',
    transporte_publico: 'Transporte público',
    utiles_escolares: 'Útil o uniforme escolar',
    otro_exento: 'Otro bien exento',
    otro_excluido: 'Otro servicio excluido'
  };

  const categoria_bien = mapCategorias[i.tipo_bien] || 'Sin clasificar';

  // Tratamiento fiscal explicado
  let tratamiento_fiscal = '';
  if (esExento) {
    tratamiento_fiscal = `Bien exento: IVA 0%. Permite descuentas. IVA pagado en insumos ($${i.iva_pagado_insumos.toLocaleString('es-CO', { maximumFractionDigits: 0 })}) es recuperable. Flujo: neto negativo si hay descuentas.`;
  } else if (esExcluido) {
    tratamiento_fiscal = `Servicio excluido: IVA 0%. No permite descuentas de IVA pagado en insumos. Costo fiscal completo asumido por prestador.`;
  } else {
    tratamiento_fiscal = 'Categoría no reconocida. Verificar con DIAN.';
  }

  const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO', { maximumFractionDigits: 0 });

  let _insight: any;
  if (esExento) {
    const recupera = iva_descontable > 0;
    _insight = {
      title: 'Cómo tributa este bien',
      text: recupera
        ? `Como bien **exento**, le cobrás **0% de IVA** al cliente y además recuperás **${cop(iva_descontable)}** del IVA que pagaste en insumos: ese saldo a favor lo pedís como devolución a la DIAN.`
        : `Como bien **exento**, cobrás **0% de IVA** y tenés derecho a descontar el IVA de tus insumos. Cargá el IVA pagado en compras para ver cuánto podés recuperar de la DIAN.`,
      tone: 'good',
      icon: '🧾',
    };
  } else if (esExcluido) {
    _insight = {
      title: 'Cómo tributa este servicio',
      text: `Como servicio **excluido**, no cobrás IVA, pero **tampoco podés descontar** el IVA de tus insumos${i.iva_pagado_insumos > 0 ? ` (${cop(i.iva_pagado_insumos)})` : ''}: ese costo lo asumís vos y conviene trasladarlo al precio.`,
      tone: 'warn',
      icon: '🧾',
    };
  } else {
    _insight = {
      title: 'Categoría sin clasificar',
      text: 'No pudimos clasificar el bien como exento ni excluido. Verificá el tratamiento con la DIAN antes de facturar.',
      tone: 'neutral',
      icon: '🧾',
    };
  }

  return {
    categoria_bien,
    tasa_iva: 0, // Ambos casos 0%
    iva_causado: Math.round(iva_causado),
    iva_descontable: Math.round(iva_descontable),
    iva_neto_a_pagar: Math.round(iva_neto_a_pagar),
    valor_total_cliente: Math.round(valor_total_cliente),
    tratamiento_fiscal,
    _insight
  };
}
