/**
 * Presupuesto de útiles escolares y regreso a clases — República Dominicana 2026-2027.
 * El año escolar 2026-2027 inicia el 24 de agosto de 2026 (MINERD).
 * Precios de referencia jul-2026: guía de precios de útiles (Hoy, 21-jul-2026) y
 * costos de regreso a clases (Diario Libre, 22-jul-2026). Son ESTIMADOS editables.
 */
import { fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  hijos: number;             // cantidad de hijos que van a la escuela
  nivel: string;             // 'inicial' | 'primaria' | 'secundaria'
  tipo: string;              // 'publico' | 'privado'
  gama: string;              // 'economica' | 'media' | 'alta'
  inscripcion?: number;      // RD$ por hijo (solo privado; 0 si no aplica)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Presupuesto base de ÚTILES por nivel (gama media, RD$): mochila + lonchera +
// cartuchera + cuadernos/cátedras + escritura y varios. Guía Hoy jul-2026.
const UTILES_BASE: Record<string, number> = { inicial: 3500, primaria: 4500, secundaria: 5500 };
// Presupuesto base de UNIFORMES por nivel (gama media, RD$): 3 poloches/t-shirts +
// 2 pantalones/faldas + calzado escolar.
const UNIFORMES_BASE: Record<string, number> = { inicial: 3500, primaria: 4000, secundaria: 4500 };
// Libros de texto (solo colegios privados; en el sector público los cubre el MINERD).
const LIBROS_PRIVADO: Record<string, number> = { inicial: 2000, primaria: 4000, secundaria: 6000 };
// Factor por gama de precios (rangos de la guía: p.ej. mochilas RD$450–2.850).
const FACTOR_GAMA: Record<string, number> = { economica: 0.6, media: 1, alta: 1.8 };
// En el sector público, el INABIE entrega gratis un kit (mochila, cuadernos, lápices,
// colores y uniforme oficial): las familias solo complementan.
const FACTOR_KIT_INABIE = 0.5;

export function compute(i: Inputs): Outputs {
  const hijos = Math.max(1, Math.min(12, Math.floor(Number(i.hijos) || 1)));
  const nivel = String(i.nivel || 'primaria');
  const tipo = String(i.tipo || 'publico');
  const gama = String(i.gama || 'media');
  const fg = FACTOR_GAMA[gama] ?? 1;
  const esPrivado = tipo === 'privado';

  let utiles = (UTILES_BASE[nivel] ?? UTILES_BASE.primaria) * fg;
  let uniformes = (UNIFORMES_BASE[nivel] ?? UNIFORMES_BASE.primaria) * fg;
  if (!esPrivado) {
    utiles *= FACTOR_KIT_INABIE;
    uniformes *= FACTOR_KIT_INABIE;
  }
  const libros = esPrivado ? (LIBROS_PRIVADO[nivel] ?? LIBROS_PRIVADO.primaria) : 0;
  const inscripcion = esPrivado ? Math.max(0, Number(i.inscripcion) || 0) : 0;

  const porHijo = utiles + uniformes + libros + inscripcion;
  const total = porHijo * hijos;

  const r = (n: number) => Math.round(n);

  const _insight = {
    title: `Presupuesto de regreso a clases: ${fmtDOP(r(total))}`,
    text: esPrivado
      ? `Para **${hijos} ${hijos === 1 ? 'hijo' : 'hijos'}** en colegio privado (nivel ${nivel}, gama ${gama}) el presupuesto estimado es **${fmtDOP(r(total))}** (${fmtDOP(r(porHijo))} por hijo: útiles ${fmtDOP(r(utiles))}, uniformes ${fmtDOP(r(uniformes))}, libros ${fmtDOP(r(libros))}${inscripcion > 0 ? `, inscripción ${fmtDOP(r(inscripcion))}` : ''}). Las clases arrancan el **24 de agosto de 2026**.`
      : `Para **${hijos} ${hijos === 1 ? 'hijo' : 'hijos'}** en escuela pública (nivel ${nivel}, gama ${gama}) el presupuesto estimado es **${fmtDOP(r(total))}** (${fmtDOP(r(porHijo))} por hijo). El INABIE entrega gratis mochila, cuadernos y uniforme oficial, así que solo presupuestás lo que falta. Las clases arrancan el **24 de agosto de 2026**.`,
    tone: 'info',
    icon: '🎒',
  };

  const bars = [
    { label: 'Útiles', value: r(utiles * hijos), color: '#2563eb', colorDark: '#3b82f6' },
    { label: 'Uniformes', value: r(uniformes * hijos), color: '#16a34a', colorDark: '#22c55e' },
  ];
  if (libros > 0) bars.push({ label: 'Libros', value: r(libros * hijos), color: '#d97706', colorDark: '#f59e0b' });
  if (inscripcion > 0) bars.push({ label: 'Inscripción', value: r(inscripcion * hijos), color: '#9333ea', colorDark: '#a855f7' });
  const _chart = {
    type: 'bars',
    bars,
    format: 'currency',
    ariaLabel: `Presupuesto escolar total ${fmtDOP(r(total))}: útiles, uniformes${libros > 0 ? ', libros' : ''}${inscripcion > 0 ? ' e inscripción' : ''}.`,
  };

  return {
    totalFamilia: fmtDOP(r(total)),
    totalPorHijo: fmtDOP(r(porHijo)),
    utilesPorHijo: fmtDOP(r(utiles)),
    uniformesPorHijo: fmtDOP(r(uniformes)),
    librosPorHijo: esPrivado ? fmtDOP(r(libros)) : 'Los cubre el MINERD',
    detalle: `${hijos} ${hijos === 1 ? 'hijo' : 'hijos'} · nivel ${nivel} · ${esPrivado ? 'colegio privado' : 'escuela pública (kit INABIE gratis)'} · gama ${gama}. Inicio de clases: 24-ago-2026.`,
    _insight,
    _chart,
  };
}
