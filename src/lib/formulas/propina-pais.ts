/** Propina acostumbrada por país */
export interface PropinaPaisInputs {
  pais?: string;
  montoCuenta: number;
}
export interface PropinaPaisOutputs {
  propinaRecomendada: number;
  porcentaje: number;
  costumbre: string;
  detalle: string;
}

interface PaisConfig {
  nombre: string;
  porcentaje: number;
  costumbre: string;
}

const PAISES: Record<string, PaisConfig> = {
  argentina: {
    nombre: 'Argentina',
    porcentaje: 10,
    costumbre: 'Esperada en restaurantes con servicio de mesa. Se deja en efectivo. En bares y mostrador no se espera. Taxis: se redondea.',
  },
  brasil: {
    nombre: 'Brasil',
    porcentaje: 10,
    costumbre: 'Generalmente incluida en la cuenta como "serviço" (10%). Es voluntaria pero se acostumbra pagarla. Extra en efectivo por buen servicio.',
  },
  chile: {
    nombre: 'Chile',
    porcentaje: 10,
    costumbre: 'Se espera 10% en restaurantes. Algunos incluyen "propina sugerida" en la cuenta. Se puede pagar con tarjeta o efectivo.',
  },
  uruguay: {
    nombre: 'Uruguay',
    porcentaje: 10,
    costumbre: 'Similar a Argentina: 10% en restaurantes con servicio de mesa. Se deja en efectivo. En taxis se redondea.',
  },
  mexico: {
    nombre: 'México',
    porcentaje: 12,
    costumbre: 'Se espera 10-15% en restaurantes. En zonas turísticas el estándar sube a 15%. Propina no incluida en la cuenta. Efectivo preferido.',
  },
  usa: {
    nombre: 'Estados Unidos',
    porcentaje: 18,
    costumbre: 'Prácticamente obligatoria: 18-20% en restaurantes. Los meseros dependen de las propinas. Menos del 15% es ofensivo. Se puede agregar en la tarjeta.',
  },
  espana: {
    nombre: 'España',
    porcentaje: 7,
    costumbre: 'Opcional. Se dejan las monedas del cambio o 5-10% por buen servicio. En bares de tapas se deja poco o nada. El servicio está incluido en el precio.',
  },
  italia: {
    nombre: 'Italia',
    porcentaje: 7,
    costumbre: 'Opcional. Muchos restaurantes cobran "coperto" (€1-3 por cubierto), que no es propina. Un extra de 5-10% es un gesto apreciado pero no esperado.',
  },
  francia: {
    nombre: 'Francia',
    porcentaje: 5,
    costumbre: 'El servicio está incluido en el precio ("service compris"). Dejar 5-10% extra es un gesto de agradecimiento pero no obligatorio. Se dejan monedas sobre la mesa.',
  },
  japon: {
    nombre: 'Japón',
    porcentaje: 0,
    costumbre: 'NO se deja propina. Puede considerarse ofensivo. El servicio excelente es parte de la cultura japonesa. Si dejás dinero, pueden devolvértelo.',
  },
  australia: {
    nombre: 'Australia',
    porcentaje: 5,
    costumbre: 'No se espera pero es apreciada. Podés redondear la cuenta o dejar 5-10% en restaurantes finos. Los salarios de servicio son altos en Australia.',
  },
  colombia: {
    nombre: 'Colombia',
    porcentaje: 10,
    costumbre: 'Los restaurantes suelen preguntar "¿desea incluir la propina voluntaria?" (10%). Es voluntaria pero se acostumbra aceptar. Se puede pagar con tarjeta.',
  },
  peru: {
    nombre: 'Perú',
    porcentaje: 10,
    costumbre: 'Se espera 10% en restaurantes turísticos y de clase media-alta. En locales populares y menús económicos no se espera. Efectivo preferido.',
  },
};

export function propinaPais(inputs: PropinaPaisInputs): PropinaPaisOutputs {
  const paisKey = String(inputs.pais || 'argentina');
  const monto = Number(inputs.montoCuenta);

  if (!PAISES[paisKey]) throw new Error('País no válido');
  if (monto < 0) throw new Error('El monto no puede ser negativo');

  const p = PAISES[paisKey];
  const propina = Number(((monto * p.porcentaje) / 100).toFixed(0));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    propinaRecomendada: propina,
    porcentaje: p.porcentaje,
    costumbre: p.costumbre,
    detalle: `${p.nombre}: propina recomendada ${p.porcentaje}% → ${fmt.format(propina)} sobre una cuenta de ${fmt.format(monto)}. ${p.costumbre}`,
  };
}
