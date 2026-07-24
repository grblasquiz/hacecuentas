export type CalculatorLang = 'es' | 'en' | 'pt';

export interface GroupableField {
  id: string;
  group?: string;
  groupIcon?: string;
  default?: unknown;
  showWhen?: { field: string; in: string[] };
}

export interface FieldGroup<T extends GroupableField> {
  name?: string;
  icon?: string;
  fields: T[];
}

const NEUTRAL_SPANISH_PATH = /^\/(mx|es|cl|co|pe|ec|ve|py|uy|do)(\/|$)/;

export function isNeutralSpanishPath(lang: CalculatorLang, pathname: string): boolean {
  return lang === 'es' && NEUTRAL_SPANISH_PATH.test(pathname);
}

export function calculatorColumnCopy(lang: CalculatorLang, neutralSpanish: boolean) {
  return {
    input: lang === 'en' ? 'Enter your data' : lang === 'pt' ? 'Informe os dados' : neutralSpanish ? 'Ingresa tus datos' : 'Ingresá tus datos',
    result: lang === 'en' ? 'Your result' : lang === 'pt' ? 'Seu resultado' : 'Tu resultado',
    ready: lang === 'en' ? 'Ready' : lang === 'pt' ? 'Pronto' : 'Listo',
    idle: lang === 'en' ? 'Not calculated' : lang === 'pt' ? 'Sem cálculo' : 'Sin calcular',
    done: lang === 'en' ? 'Calculated' : lang === 'pt' ? 'Calculado' : 'Calculado',
    stale: lang === 'en' ? 'Recalculate →' : lang === 'pt' ? 'Recalcule →' : neutralSpanish ? 'Recalcula →' : 'Recalculá →',
  };
}

export function neutralizeSpanish(value: string): string {
  return value
    .replace(/verificá/gi, 'verifica')
    .replace(/consultá/gi, 'consulta')
    .replace(/usá/gi, 'usa')
    .replace(/revisá/gi, 'revisa');
}

export function groupCalculatorFields<T extends GroupableField>(fields: T[]): FieldGroup<T>[] {
  const groups: FieldGroup<T>[] = [];
  const byName = new Map<string, FieldGroup<T>>();
  for (const field of fields) {
    const key = field.group || '__default__';
    let group = byName.get(key);
    if (!group) {
      group = { name: field.group, icon: field.groupIcon, fields: [] };
      byName.set(key, group);
      groups.push(group);
    }
    group.fields.push(field);
  }
  return groups;
}

export function initialHiddenFieldIds<T extends GroupableField>(fields: T[]): Set<string> {
  const defaults = new Map(
    fields.map((field) => [
      field.id,
      field.default === undefined || field.default === null ? '' : String(field.default),
    ]),
  );
  const hidden = new Set<string>();
  for (const field of fields) {
    const condition = field.showWhen;
    if (!condition?.field || !Array.isArray(condition.in) || condition.in.length === 0) continue;
    if (!condition.in.includes(defaults.get(condition.field) ?? '')) hidden.add(field.id);
  }
  return hidden;
}
