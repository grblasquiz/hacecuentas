export interface Inputs {
  a: number;
  b: number;
  c: number;
  scale_mode: string;
  scale_value: number;
}

export interface Outputs {
  simplified: string;
  decimal_value: number;
  percentages: string;
  scaled_ratio: string;
  equivalent_ratios: string;
  gcd_used: number;
}

// Euclidean algorithm — works on positive integers
function gcd(x: number, y: number): number {
  x = Math.abs(Math.round(x));
  y = Math.abs(Math.round(y));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function gcd3(x: number, y: number, z: number): number {
  return gcd(gcd(x, y), z);
}

// Convert decimal inputs to integers by detecting max decimal places
function toIntegers(parts: number[]): { ints: number[]; multiplier: number } {
  let maxDecimals = 0;
  for (const p of parts) {
    const s = p.toString();
    const dot = s.indexOf('.');
    if (dot !== -1) {
      const decimals = s.length - dot - 1;
      if (decimals > maxDecimals) maxDecimals = decimals;
    }
  }
  const multiplier = Math.pow(10, maxDecimals);
  const ints = parts.map((p) => Math.round(p * multiplier));
  return { ints, multiplier };
}

function formatNum(n: number): string {
  // Show up to 4 decimal places, strip trailing zeros
  const s = n.toFixed(4);
  return parseFloat(s).toString();
}

export function compute(i: Inputs): Outputs {
  const rawA = Number(i.a) || 0;
  const rawB = Number(i.b) || 0;
  const rawC = Number(i.c) || 0;
  const scaleMode = i.scale_mode || 'none';
  const scaleValue = Number(i.scale_value) || 0;

  const isThreePart = rawC > 0;

  // Validation
  if (rawA <= 0 || rawB <= 0) {
    return {
      simplified: 'Enter positive values for Part A and Part B.',
      decimal_value: 0,
      percentages: '—',
      scaled_ratio: '—',
      equivalent_ratios: '—',
      gcd_used: 0,
    };
  }
  if (isThreePart && rawC < 0) {
    return {
      simplified: 'Part C must be 0 (unused) or a positive number.',
      decimal_value: 0,
      percentages: '—',
      scaled_ratio: '—',
      equivalent_ratios: '—',
      gcd_used: 0,
    };
  }

  // Convert to integers for GCD
  const parts = isThreePart ? [rawA, rawB, rawC] : [rawA, rawB];
  const { ints } = toIntegers(parts);

  const intA = ints[0];
  const intB = ints[1];
  const intC = isThreePart ? ints[2] : 0;

  const divisor = isThreePart ? gcd3(intA, intB, intC) : gcd(intA, intB);

  const sA = intA / divisor;
  const sB = intB / divisor;
  const sC = isThreePart ? intC / divisor : 0;

  // Simplified ratio string
  const simplified = isThreePart
    ? `${formatNum(sA)} : ${formatNum(sB)} : ${formatNum(sC)}`
    : `${formatNum(sA)} : ${formatNum(sB)}`;

  // Decimal value (A / B) — meaningful for 2-part only
  const decimal_value = isThreePart ? 0 : rawA / rawB;

  // Percentage breakdown
  const total = isThreePart ? rawA + rawB + rawC : rawA + rawB;
  const pctA = (rawA / total) * 100;
  const pctB = (rawB / total) * 100;
  const pctC = isThreePart ? (rawC / total) * 100 : 0;

  const percentages = isThreePart
    ? `A: ${pctA.toFixed(1)}%  |  B: ${pctB.toFixed(1)}%  |  C: ${pctC.toFixed(1)}%`
    : `A: ${pctA.toFixed(1)}%  |  B: ${pctB.toFixed(1)}%`;

  // Scaling
  let scaled_ratio = 'No scaling applied.';
  if (scaleMode !== 'none' && scaleValue > 0) {
    if (scaleMode === 'total') {
      // Scale so that sum of parts = scaleValue
      const scaledA = (rawA / total) * scaleValue;
      const scaledB = (rawB / total) * scaleValue;
      if (isThreePart) {
        const scaledC = (rawC / total) * scaleValue;
        scaled_ratio = `${formatNum(parseFloat(scaledA.toFixed(4)))} : ${formatNum(parseFloat(scaledB.toFixed(4)))} : ${formatNum(parseFloat(scaledC.toFixed(4)))}  (total = ${scaleValue})`;
      } else {
        scaled_ratio = `${formatNum(parseFloat(scaledA.toFixed(4)))} : ${formatNum(parseFloat(scaledB.toFixed(4)))}  (total = ${scaleValue})`;
      }
    } else if (scaleMode === 'first') {
      // Scale so that Part A = scaleValue
      const multiplier = scaleValue / rawA;
      const scaledB = rawB * multiplier;
      if (isThreePart) {
        const scaledC = rawC * multiplier;
        scaled_ratio = `${formatNum(scaleValue)} : ${formatNum(parseFloat(scaledB.toFixed(4)))} : ${formatNum(parseFloat(scaledC.toFixed(4)))}  (A = ${scaleValue})`;
      } else {
        scaled_ratio = `${formatNum(scaleValue)} : ${formatNum(parseFloat(scaledB.toFixed(4)))}  (A = ${scaleValue})`;
      }
    }
  } else if (scaleMode !== 'none' && scaleValue <= 0) {
    scaled_ratio = 'Enter a positive target value to scale.';
  }

  // Equivalent ratios ×2, ×3, ×5, ×10
  const factors = [2, 3, 5, 10];
  const equivParts: string[] = factors.map((f) => {
    const eA = formatNum(sA * f);
    const eB = formatNum(sB * f);
    if (isThreePart) {
      const eC = formatNum(sC * f);
      return `×${f}: ${eA}:${eB}:${eC}`;
    }
    return `×${f}: ${eA}:${eB}`;
  });
  const equivalent_ratios = equivParts.join('  |  ');

  return {
    simplified,
    decimal_value,
    percentages,
    scaled_ratio,
    equivalent_ratios,
    gcd_used: divisor,
  };
}
