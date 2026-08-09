import { computeSensitivity } from './hubs/sensitivity';

type OutputConfig = {
  id: string;
  label?: string;
  primary?: boolean;
  /**
   * Formato por output (Nivel 1). Antes el adapter aplicaba UN formato global
   * a todas las filas: minutos y USD salían como $ARS. Si el config lo declara,
   * pisa el formato global para esa fila; si no, todo sigue como antes.
   */
  format?: 'ars' | 'plain' | 'unit';
  unit?: string;
  decimals?: number;
};

type CalculatorConfig = {
  fields: string[];
  outputs: OutputConfig[];
  title: string;
};

type FormulaMap = Record<string, (values: Record<string, unknown>) => Record<string, any>>;

export type GeneratedHubAdapterOptions = {
  locale?: string;
  format?: string;
};

const META_KEYS = new Set(['_insight', '_chart', '_table']);

/**
 * Extrae el valor numérico de outputs que las fórmulas históricas devuelven ya
 * formateados ("S/ 88.600", "$1,234.56", "14.81 / 20", "52 %").
 */
export function numericValue(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;

  const token = value.trim().match(/[-+]?\d[\d.,]*/)?.[0];
  if (!token) return null;

  const negative = token.startsWith('-');
  let normalized = token.replace(/^[+-]/, '');
  const comma = normalized.lastIndexOf(',');
  const dot = normalized.lastIndexOf('.');

  if (comma >= 0 && dot >= 0) {
    const decimal = comma > dot ? ',' : '.';
    const thousands = decimal === ',' ? /\./g : /,/g;
    normalized = normalized.replace(thousands, '').replace(decimal, '.');
  } else {
    const separator = comma >= 0 ? ',' : dot >= 0 ? '.' : '';
    if (separator) {
      const parts = normalized.split(separator);
      const groupedThousands =
        parts.length > 2 ||
        (parts.length === 2 && parts[1].length === 3 &&
          /[$€£¥₲₡₹]|S\/|R\$|RD\$|Gs|\b(?:USD|ARS|COP|CLP|PEN|MXN|UYU|BRL|EUR|BOB|PYG|DOP|VES|GTQ|CRC|HNL|NIO|PAB)\b/i.test(value));
      normalized = groupedThousands
        ? parts.join('')
        : parts.slice(0, -1).join('') + '.' + parts.at(-1);
    }
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? (negative ? -parsed : parsed) : null;
}

function plainText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) return value.map(plainText).filter(Boolean).join(' · ');
  if (!value || typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;
  const title = plainText(record.title);
  const body = plainText(record.text) || plainText(record.description) || plainText(record.message);
  return title && body ? `${title}: ${body}` : body || title;
}

function stripPresentationMarkdown(value: string): string {
  return value
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function outputLabel(config: CalculatorConfig, key: string): string {
  return config.outputs.find((output) => output.id === key)?.label || key.replace(/_/g, ' ');
}

/**
 * Veredicto genérico a partir del `_insight` de la fórmula (Nivel 1).
 * Conservador a propósito: sólo cuando el insight ARRANCA con una recomendación
 * inequívoca. Ante la duda, sin verdict y el hub queda exactamente como hoy.
 */
const VERDICT_RX =
  /^(te conviene|no te conviene|conviene|no conviene|recomendamos|no recomendamos|recomendado|no recomendado|mejor\s|evit[áa]|s[íi],|no,)/i;

function deriveVerdict(insight: string): { title: string; copy?: string; tone: 'ok' | 'warn' } | undefined {
  const text = stripPresentationMarkdown(insight || '');
  if (!text || !VERDICT_RX.test(text)) return undefined;
  const match = text.match(/^(.{10,160}?[.!?])\s+(\S[\s\S]*)$/);
  const title = match ? match[1].trim() : text.length <= 160 ? text : undefined;
  if (!title) return undefined;
  const copy = match ? match[2].trim() : undefined;
  const tone: 'ok' | 'warn' = /^(no\b|evit)/i.test(text) ? 'warn' : 'ok';
  return copy ? { title, copy, tone } : { title, tone };
}

function displayValue(value: unknown, numeric: number, locale: string): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return numeric.toLocaleString(locale, { maximumFractionDigits: 2 });
}

function isDisplayable(value: unknown): boolean {
  return (typeof value === 'string' && value.trim().length > 0) ||
    (typeof value === 'number' && Number.isFinite(value));
}

function chartFromFormula(chart: any, fallback: Array<{ label: string; value: number; tone: string }>) {
  const source = chart?.slices || chart?.segments || chart?.series || chart?.data;
  if (!Array.isArray(source)) return fallback;

  const mapped = source
    .map((item: any, index: number) => {
      const value = numericValue(item?.value ?? item?.y ?? item?.amount);
      if (value === null) return null;
      return {
        label: plainText(item?.label ?? item?.name ?? item?.nombre) || `Resultado ${index + 1}`,
        value: Math.abs(value),
        tone: item?.tone || (index === 0 ? 'main' : index === 1 ? 'good' : 'prop'),
      };
    })
    .filter(Boolean);

  return mapped.length ? mapped : fallback;
}

export function adaptGeneratedHubResult(
  allValues: Record<string, unknown>,
  selected: { id?: string } | null | undefined,
  configs: Record<string, CalculatorConfig>,
  formulaMap: FormulaMap,
  options: GeneratedHubAdapterOptions = {},
) {
  const id = selected?.id || Object.keys(configs)[0];
  const config = configs[id];
  const locale = options.locale || 'es';
  const format = options.format || 'unit';

  if (!config || typeof formulaMap[id] !== 'function') {
    return { total: '—', sub: 'Esta calculadora no está disponible.', rows: [], chart: [], format: 'plain' };
  }

  const values: Record<string, unknown> = {};
  for (const key of config.fields) values[key] = allValues[`${id}__${key}`];
  // Las fórmulas multi-idioma leen i.__lang ('es' | 'en' | 'pt'); sin esto los
  // hubs pt/en renderizaban los textos en español.
  if (!('__lang' in values)) values.__lang = locale.toLowerCase().startsWith('pt') ? 'pt' : locale.toLowerCase().startsWith('en') ? 'en' : 'es';

  let output: Record<string, any>;
  try {
    output = formulaMap[id](values) || {};
  } catch (error: any) {
    return {
      total: '—',
      sub: plainText(error?.message) || 'Revisa los datos ingresados.',
      rows: [],
      chart: [],
      format: 'plain',
    };
  }

  const configuredKeys = config.outputs.map((item) => item.id);
  const remainingKeys = Object.keys(output).filter((key) => !META_KEYS.has(key) && !configuredKeys.includes(key));
  const keys = [...configuredKeys, ...remainingKeys];
  const numericOutputs = keys
    .map((key) => ({ key, raw: output[key], numeric: numericValue(output[key]) }))
    .filter((item): item is { key: string; raw: unknown; numeric: number } => item.numeric !== null);

  const primaryKey =
    config.outputs.find((item) => item.primary && isDisplayable(output[item.id]))?.id ||
    config.outputs.find((item) => isDisplayable(output[item.id]))?.id ||
    numericOutputs[0]?.key;
  const primaryRaw = primaryKey ? output[primaryKey] : undefined;
  const primaryNumeric = numericValue(primaryRaw);

  if (!primaryKey || !isDisplayable(primaryRaw)) {
    const explanatory =
      plainText(output._insight) ||
      plainText(output.detalle) ||
      plainText(output.resumen) ||
      config.title;
    return {
      total: '—',
      sub: stripPresentationMarkdown(explanatory),
      rows: [],
      chart: [],
      format: 'plain',
    };
  }

  // Formato POR FILA: respeta lo que declare cada output y cae al global.
  const rows = numericOutputs.slice(0, 12).map((item) => {
    const outputConfig = config.outputs.find((o) => o.id === item.key);
    return {
      k: outputLabel(config, item.key),
      v: item.numeric,
      format: outputConfig?.format || format,
      ...(outputConfig?.unit ? { unit: outputConfig.unit } : {}),
      ...(outputConfig?.decimals != null ? { decimals: outputConfig.decimals } : {}),
    };
  });
  const fallbackChart = numericOutputs.slice(0, 6).map((item, index) => ({
    label: outputLabel(config, item.key),
    value: Math.abs(item.numeric),
    tone: index === 0 ? 'main' : index === 1 ? 'good' : 'prop',
  }));
  const explanation =
    plainText(output._insight) ||
    plainText(output.detalle) ||
    plainText(output.resumen) ||
    config.title;

  // Verdict genérico desde el _insight (sólo si arranca con recomendación clara).
  const verdict = deriveVerdict(plainText(output._insight));

  // Sensibilidad ±10% del primer campo numérico del caso. 2 ejecuciones extra
  // envueltas en try/catch adentro del helper: si la fórmula tira, sin bloque.
  let sensitivity: Array<{ label: string; value: string }> = [];
  const driverKey = config.fields.find((key) => {
    const v = Number(values[key]);
    return Number.isFinite(v) && v !== 0;
  });
  if (driverKey && primaryKey) {
    sensitivity = computeSensitivity(
      (perturbed) => formulaMap[id](perturbed),
      values,
      driverKey,
      {
        driverLabel: driverKey.replace(/_/g, ' '),
        extract: (result) => numericValue(result?.[primaryKey]),
        format: (n) => n.toLocaleString(locale, { maximumFractionDigits: 2 }),
        locale,
      },
    );
  }

  return {
    total: primaryNumeric === null
      ? String(primaryRaw).trim()
      : displayValue(primaryRaw, primaryNumeric, locale),
    sub: stripPresentationMarkdown(explanation),
    rows,
    chart: chartFromFormula(output._chart, fallbackChart),
    format,
    ...(verdict ? { verdict } : {}),
    ...(sensitivity.length ? { sensitivity } : {}),
  };
}
