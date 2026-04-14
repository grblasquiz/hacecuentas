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
}

export interface ViajeDividirOutputs {
  totalGastado: number;
  parteJusta: number;
  personasActivas: number;
  liquidacion: string; // detalle por persona
}

export function viajeDividir(inputs: ViajeDividirInputs): ViajeDividirOutputs {
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
    throw new Error('Ingresá los gastos de al menos 2 personas');
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
        return `Persona ${b.idx}: puso $${Math.round(b.gasto).toLocaleString('es-AR')} → queda parejo`;
      }
      if (b.balance > 0) {
        return `Persona ${b.idx}: puso $${Math.round(b.gasto).toLocaleString('es-AR')} → LE DEBEN $${Math.round(b.balance).toLocaleString('es-AR')}`;
      }
      return `Persona ${b.idx}: puso $${Math.round(b.gasto).toLocaleString('es-AR')} → TIENE QUE PAGAR $${Math.abs(Math.round(b.balance)).toLocaleString('es-AR')}`;
    });

  return {
    totalGastado: Math.round(totalGastado),
    parteJusta: Math.round(parteJusta),
    personasActivas,
    liquidacion: lineas.join('\n'),
  };
}
