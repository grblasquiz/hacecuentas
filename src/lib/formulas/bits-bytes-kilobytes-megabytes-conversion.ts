export interface Inputs {
  value: number;
  from_unit: string;
  system: string;
}

export interface Outputs {
  bits: number;
  bytes: number;
  kilobytes: number;
  kibibytes: number;
  megabytes: number;
  mebibytes: number;
  gigabytes: number;
  gibibytes: number;
  terabytes: number;
  tebibytes: number;
  explanation_text: string;
}

export function compute(i: Inputs): Outputs {
  const value = Number(i.value) || 0;
  const from_unit = String(i.from_unit || 'byte');
  const system = String(i.system || 'decimal');

  if (value < 0) {
    return {
      bits: 0,
      bytes: 0,
      kilobytes: 0,
      kibibytes: 0,
      megabytes: 0,
      mebibytes: 0,
      gigabytes: 0,
      gibibytes: 0,
      terabytes: 0,
      tebibytes: 0,
      explanation_text: 'Ingresa un valor positivo.'
    };
  }

  // Conversión a bytes (unidad base)
  let bytes = 0;
  const DECIMAL_KB = 1000;
  const DECIMAL_MB = DECIMAL_KB * DECIMAL_KB;
  const DECIMAL_GB = DECIMAL_KB * DECIMAL_MB;
  const DECIMAL_TB = DECIMAL_KB * DECIMAL_GB;

  const BINARY_KIB = 1024;
  const BINARY_MIB = BINARY_KIB * BINARY_KIB;
  const BINARY_GIB = BINARY_KIB * BINARY_MIB;
  const BINARY_TIB = BINARY_KIB * BINARY_GIB;

  const BIT_TO_BYTE = 1 / 8;

  switch (from_unit) {
    case 'bit':
      bytes = value * BIT_TO_BYTE;
      break;
    case 'byte':
      bytes = value;
      break;
    case 'kb_decimal':
      bytes = value * DECIMAL_KB;
      break;
    case 'kib_binary':
      bytes = value * BINARY_KIB;
      break;
    case 'mb_decimal':
      bytes = value * DECIMAL_MB;
      break;
    case 'mib_binary':
      bytes = value * BINARY_MIB;
      break;
    case 'gb_decimal':
      bytes = value * DECIMAL_GB;
      break;
    case 'gib_binary':
      bytes = value * BINARY_GIB;
      break;
    case 'tb_decimal':
      bytes = value * DECIMAL_TB;
      break;
    case 'tib_binary':
      bytes = value * BINARY_TIB;
      break;
    default:
      bytes = value;
  }

  const bits = bytes * 8;
  const kilobytes = bytes / DECIMAL_KB;
  const kibibytes = bytes / BINARY_KIB;
  const megabytes = bytes / DECIMAL_MB;
  const mebibytes = bytes / BINARY_MIB;
  const gigabytes = bytes / DECIMAL_GB;
  const gibibytes = bytes / BINARY_GIB;
  const terabytes = bytes / DECIMAL_TB;
  const tebibytes = bytes / BINARY_TIB;

  const systemLabel = system === 'binary' ? 'binario (KiB, MiB, GiB, TiB)' : 'decimal (KB, MB, GB, TB)';
  const explanation_text = `Conversión desde ${from_unit}. Mostrado en sistema ${systemLabel}.`;

  return {
    bits: Math.round(bits * 1000000) / 1000000,
    bytes: Math.round(bytes * 1000000) / 1000000,
    kilobytes: Math.round(kilobytes * 1000000) / 1000000,
    kibibytes: Math.round(kibibytes * 1000000) / 1000000,
    megabytes: Math.round(megabytes * 1000000) / 1000000,
    mebibytes: Math.round(mebibytes * 1000000) / 1000000,
    gigabytes: Math.round(gigabytes * 1000000) / 1000000,
    gibibytes: Math.round(gibibytes * 1000000) / 1000000,
    terabytes: Math.round(terabytes * 1000000) / 1000000,
    tebibytes: Math.round(tebibytes * 1000000) / 1000000,
    explanation_text
  };
}
