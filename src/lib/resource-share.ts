import { COLOMBIA_2026 } from './data/colombia-2026';
const cop = (n: number) => '$' + n.toLocaleString('es-CO');
// Public editorial text only: never read the current URL, calculator state or inputs.
export const SHARE_RESOURCES = {
  'salario-colombia-2026': {
    path: '/co/datos-salario-minimo-colombia-2026',
    heading: 'Comparte el salario mínimo con su fuente',
    summary: `Colombia 2026: salario mínimo mensual ${cop(COLOMBIA_2026.smlmv)} COP. Auxilio de transporte: ${cop(COLOMBIA_2026.auxilioTransporte)} si corresponde; total antes de descuentos ${cop(COLOMBIA_2026.smlmv + COLOMBIA_2026.auxilioTransporte)}. Fuentes: decretos 0159/2026 y 1470/2025. Consulta requisitos y descuentos en Hacé Cuentas.`,
    note: 'Envía el dato público y el enlace a las normas. No incluye lo que ingreses en la calculadora.',
  },
  'ganancias-2026': {
    path: '/blog/escala-ganancias-2026-argentina-tabla-completa-explicada',
    heading: 'Compartí la tabla de Ganancias con quien la necesita',
    summary: 'Ganancias 2026 en Argentina: tablas de ambos semestres, fuentes de ARCA y calculadora de tramo. La alícuota marginal se aplica al excedente del tramo, no a todo el sueldo. Consultá la explicación en Hacé Cuentas.',
    note: 'Compartís la guía pública. No se incluyen tu sueldo, base imponible ni resultados personales.',
  },
} as const;
export type ResourceKey = keyof typeof SHARE_RESOURCES;
export function resourceShare(key: ResourceKey, channel: 'whatsapp' | 'copy') {
  const resource = SHARE_RESOURCES[key];
  const url = new URL(resource.path, 'https://hacecuentas.com');
  url.searchParams.set('utm_source', channel === 'whatsapp' ? 'whatsapp' : 'shared_resource');
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_campaign', 'public_resources_20261116');
  url.searchParams.set('utm_content', key);
  const text = resource.summary + '\n' + url.href;
  return { url: url.href, text, whatsapp: 'https://wa.me/?text=' + encodeURIComponent(text) };
}
export async function copyResourceText(text: string, clipboard?: { writeText: (text: string) => Promise<void> }): Promise<boolean> {
  if (!clipboard) return false;
  try { await clipboard.writeText(text); return true; } catch { return false; }
}
