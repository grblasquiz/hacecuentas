/**
 * Calculadora de división de gastos en viaje
 *
 * Cada persona ingresa cuánto gastó. La calculadora:
 *   - Suma el total
 *   - Divide por la cantidad de personas → "lo justo"
 *   - Compara cuánto gastó cada uno vs lo justo
 *   - Devuelve quién tiene que poner plata y quién cobrar
 */

export interface ViajeDividirInputs {
  persona1: number;
  persona2: number;
  persona3: number;
  persona4: number;
  persona5: number;
  persona6: number;
  __lang?: string;
}

export interface ViajeDividirOutputs {
  totalGastado: number;
  parteJusta: number;
  personasActivas: number;
  liquidacion: string; // detalle por persona
  _chart?: any;
}

export function viajeDividir(inputs: ViajeDividirInputs): ViajeDividirOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      minPersons: 'Ingresá los gastos de al menos 2 personas',
      even:       'queda parejo',
      owed:       'LE DEBEN',
      owes:       'TIENE QUE PAGAR',
      put:        'puso',
      person:     'Persona',
      ariaLabel:  'Composición del gasto total por persona',
    },
    en: {
      minPersons: 'Enter expenses for at least 2 people',
      even:       'all even',
      owed:       'IS OWED',
      owes:       'NEEDS TO PAY',
      put:        'paid',
      person:     'Person',
      ariaLabel:  'Breakdown of total expenses by person',
    },
  } as const)[__lang];

  const gastos = [
    Number(inputs.persona1) || 0,
    Number(inputs.persona2) || 0,
    Number(inputs.persona3) || 0,
    Number(inputs.persona4) || 0,
    Number(inputs.persona5) || 0,
    Number(inputs.persona6) || 0,
  ];

  const personasActivas = gastos.filter((g) => g > 0).length;
  if (personasActivas < 2) {
    throw new Error(T.minPersons);
  }

  const totalGastado = gastos.reduce((a, b) => a + b, 0);
  const parteJusta = totalGastado / personasActivas;

  const balances = gastos.map((g, i) => ({
    idx: i + 1,
    gasto: g,
    balance: g - parteJusta, // positivo: le deben; negativo: tiene que pagar
  }));

  const lineas = balances
    .filter((b) => b.gasto > 0)
    .map((b) => {
      if (Math.abs(b.balance) < 1) {
        return `${T.person} ${b.idx}: ${T.put} $${Math.round(b.gasto).toLocaleString('es-AR')} → ${T.even}`;
      }
      if (b.balance > 0) {
        return `${T.person} ${b.idx}: ${T.put} $${Math.round(b.gasto).toLocaleString('es-AR')} → ${T.owed} $${Math.round(b.balance).toLocaleString('es-AR')}`;
      }
      return `${T.person} ${b.idx}: ${T.put} $${Math.round(b.gasto).toLocaleString('es-AR')} → ${T.owes} $${Math.abs(Math.round(b.balance)).toLocaleString('es-AR')}`;
    });

  const chart = {
    type: 'doughnut' as const,
    slices: balances
      .filter((b) => b.gasto > 0)
      .map((b) => ({ label: T.person + ' ' + b.idx, value: Math.round(b.gasto) })),
    prefix: '$',
    centerValue: '$' + Math.round(totalGastado).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: T.ariaLabel,
  };

  return {
    totalGastado: Math.round(totalGastado),
    parteJusta: Math.round(parteJusta),
    personasActivas,
    liquidacion: lineas.join('\n'),
    _chart: chart,
  };
}
