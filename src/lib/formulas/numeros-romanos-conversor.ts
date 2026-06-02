/**
 * Conversor de Números Romanos ↔ Decimal
 */
export interface NumerosRomanosInputs { numeroDecimal: number; numeroRomano: string; }
export interface NumerosRomanosOutputs { resultado: string; decimal: number; romano: string; _insight?: any; }

function decimalARomano(num: number): string {
  if (num < 1 || num > 3999) return 'Fuera de rango (1-3999)';
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  let n = num;
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
  }
  return result;
}

function romanoADecimal(s: string): number {
  const map: Record<string, number> = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
  const str = s.toUpperCase().replace(/[^IVXLCDM]/g, '');
  if (!str) return 0;
  let total = 0;
  for (let i = 0; i < str.length; i++) {
    const current = map[str[i]] || 0;
    const next = i + 1 < str.length ? (map[str[i + 1]] || 0) : 0;
    if (current < next) total -= current;
    else total += current;
  }
  return total;
}

export function numerosRomanosConversor(inputs: NumerosRomanosInputs): NumerosRomanosOutputs {
  const numDec = Number(inputs.numeroDecimal);
  const numRom = (inputs.numeroRomano || '').trim();

  if (numDec && numDec > 0) {
    if (numDec < 1 || numDec > 3999) throw new Error('Ingresá un número entre 1 y 3999');
    const ent = Math.floor(numDec);
    const romano = decimalARomano(ent);
    return {
      resultado: `${ent} = ${romano}`,
      decimal: ent,
      romano,
      _insight: {
        title: 'De decimal a romano',
        text: `El número **${ent.toLocaleString('es-AR')}** se escribe **${romano}** en numeración romana, usando ${romano.length} símbolo${romano.length === 1 ? '' : 's'}.`,
        tone: 'neutral' as const,
        icon: '🏛️',
      },
    };
  }

  if (numRom) {
    const decimal = romanoADecimal(numRom);
    if (decimal === 0) throw new Error('Ingresá un número romano válido (ej: XIV, MMXXVI)');
    const rom = numRom.toUpperCase();
    return {
      resultado: `${rom} = ${decimal}`,
      decimal,
      romano: rom,
      _insight: {
        title: 'De romano a decimal',
        text: `El número romano **${rom}** equivale a **${decimal.toLocaleString('es-AR')}** en el sistema decimal.`,
        tone: 'neutral' as const,
        icon: '🏛️',
      },
    };
  }

  throw new Error('Ingresá un número decimal o romano para convertir');
}
