/** Test de primalidad y factorización en primos */
export interface Inputs {
  numero: number;
}
export interface Outputs {
  esPrimo: boolean;
  resultado: string;
  factorizacion: string;
  factores: string;
  divisores: string;
  cantidadDivisores: number;
  primoAnterior: number | string;
  primoSiguiente: number;
  _insight?: any;
}

function esPrimo(n: number): boolean {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function factorizar(n: number): number[] {
  const factores: number[] = [];
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) {
      factores.push(p);
      x = x / p;
    }
  }
  if (x > 1) factores.push(x);
  return factores;
}

function divisoresDe(n: number): number[] {
  const div: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      div.push(i);
      if (i !== n / i) div.push(n / i);
    }
  }
  return div.sort((a, b) => a - b);
}

function siguientePrimo(n: number): number {
  let x = n + 1;
  while (!esPrimo(x)) x++;
  return x;
}

function anteriorPrimo(n: number): number | string {
  let x = n - 1;
  while (x >= 2) {
    if (esPrimo(x)) return x;
    x--;
  }
  return 'no existe (ningún primo < 2)';
}

export function numerosPrimos(i: Inputs): Outputs {
  const n = Math.floor(Number(i.numero));
  if (!n || n < 1) throw new Error('Ingresá un entero positivo');
  if (n > 1e9) throw new Error('Número demasiado grande, máximo 1.000.000.000');

  const primo = esPrimo(n);
  const factores = factorizar(n);

  // Agrupar factores: 12 = 2 × 2 × 3 → 2² × 3
  const conteo = new Map<number, number>();
  factores.forEach(f => conteo.set(f, (conteo.get(f) || 0) + 1));
  const factorizacion = n === 1
    ? '1 (no se factoriza)'
    : Array.from(conteo.entries())
        .map(([p, e]) => e === 1 ? `${p}` : `${p}^${e}`)
        .join(' × ');

  const div = divisoresDe(n);
  // Divisores: si son muchos, mostrar primeros + ...
  const divStr = div.length <= 30 ? div.join(', ') : div.slice(0, 15).join(', ') + ', ..., ' + div.slice(-3).join(', ');

  const sig = siguientePrimo(n);
  const ant = anteriorPrimo(n);
  let insText: string;
  if (n === 1) {
    insText = `El **1** no es primo ni compuesto: por convención no cuenta como primo. El primo más chico es el **2**.`;
  } else if (primo) {
    insText = `**${n.toLocaleString('es-AR')} es primo**: solo es divisible por 1 y por sí mismo. El primo anterior es **${typeof ant === 'number' ? ant.toLocaleString('es-AR') : ant}** y el siguiente es **${sig.toLocaleString('es-AR')}**.`;
  } else {
    insText = `**${n.toLocaleString('es-AR')} es compuesto**: se descompone como **${factorizacion}** y tiene **${div.length} divisores** en total. El primo más cercano por encima es **${sig.toLocaleString('es-AR')}**.`;
  }
  const _insight = {
    title: primo ? 'Número primo' : n === 1 ? 'Caso especial' : 'Número compuesto',
    text: insText,
    tone: (primo ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: '🔢',
  };

  return {
    esPrimo: primo,
    resultado: primo
      ? `${n} es PRIMO ✓`
      : n === 1
        ? '1 no es primo ni compuesto (por convención)'
        : `${n} es COMPUESTO`,
    factorizacion,
    factores: factores.join(' × ') || String(n),
    divisores: divStr,
    cantidadDivisores: div.length,
    primoAnterior: ant,
    primoSiguiente: sig,
    _insight,
  };
}
