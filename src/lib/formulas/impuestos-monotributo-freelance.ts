/** Impuestos monotributo Argentina — categoría y cuota según facturación (escala ARCA 2026). */
import { TOPES, CATEGORIAS, cuota, fmtARS, type Cat, type Actividad } from '../data/monotributo-2026';
export interface Inputs { facturacionAnual: number; categoriaActividad: string; }
export interface Outputs { categoria: string; cuotaMensual: number; cuotaAnual: number; excedido: string; _insight?: any; }
export function impuestosMonotributoFreelance(i: Inputs): Outputs {
  const fact = Number(i.facturacionAnual);
  const act: Actividad = String(i.categoriaActividad || 'servicios') === 'servicios' ? 'servicios' : 'bienes';
  if (fact < 0) throw new Error('Facturación inválida');
  // En 2026 servicios y venta de bienes comparten los topes A-K; difiere la cuota.
  let cat: Cat | null = null;
  for (const c of CATEGORIAS) { if (fact <= TOPES[c]) { cat = c; break; } }
  if (!cat) {
    return {
      categoria: 'Excede', cuotaMensual: 0, cuotaAnual: 0, excedido: 'Sí, pasar a RI',
      _insight: {
        title: 'Te pasaste del Monotributo',
        text: `Con **${fmtARS(fact)}** anuales superás el tope de la categoría K (${fmtARS(TOPES.K)}). Tenés que pasar a **Responsable Inscripto** (IVA + Ganancias): la carga deja de ser una cuota fija y pasa a depender de tu rentabilidad.`,
        tone: 'warn' as const, icon: '⚠️',
      },
    };
  }
  const cuotaMens = cuota(cat, act);
  return {
    categoria: cat,
    cuotaMensual: Math.round(cuotaMens),
    cuotaAnual: Math.round(cuotaMens * 12),
    excedido: 'No',
    _insight: {
      title: `Categoría ${cat} de Monotributo`,
      text: `Facturando **${fmtARS(fact)}/año** (${act === 'bienes' ? 'venta de bienes' : 'servicios'}) te ubicás en la categoría **${cat}**: pagás **${fmtARS(cuotaMens)}/mes** (**${fmtARS(cuotaMens * 12)}** al año), un monto fijo que ya incluye impuesto, jubilación y obra social.`,
      tone: 'good' as const, icon: '🧾',
    },
  };
}
