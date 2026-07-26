/**
 * Presupuesto de fiesta / noche mexicana del 15 de septiembre — México 2026.
 * Costo por invitado desglosado: comida (pozole y antojitos), bebidas, dulces típicos
 * y decoración tricolor. Referencias ANPEC / Profeco de temporada de fiestas patrias
 * (última medición completa: reunión de 10 personas ≈ $7,000 con todo; olla de pozole
 * para 10 ≈ $2,000 con guarniciones; bebidas $2,800-3,000), vigentes a julio 2026.
 */
import { fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  invitados: number;      // número de invitados
  menu?: string;          // 'pozole' | 'pozoleAntojitos' | 'taquiza'
  bebidas?: string;       // 'sinAlcohol' | 'conCerveza' | 'conTequila'
  incluyeDulces?: string; // 'si' | 'no'
  decoracion?: string;    // 'no' | 'basica' | 'completa'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

// Costos por persona (MXN, promedios ANPEC/Profeco de temporada, vigentes a julio 2026)
const COMIDA: Record<string, number> = {
  pozole: 90,           // pozole con sus guarniciones y tostadas
  pozoleAntojitos: 200, // pozole + antojitos (tinga, pambazos, tostadas de pata)
  taquiza: 250,         // taquiza / buffet mexicano completo
};
const BEBIDAS: Record<string, number> = {
  sinAlcohol: 55,   // aguas frescas y refrescos
  conCerveza: 140,  // + cerveza
  conTequila: 290,  // + tequila/mezcal (ANPEC: bebidas $2,800-3,000 para 10 personas)
};
const DULCES_PP = 40; // dulces típicos y postre por persona
// Decoración: costo fijo por fiesta (banderas, papel picado, luces tricolores)
const DECO: Record<string, number> = { no: 0, basica: 300, completa: 700 };

const MENU_LABEL: Record<string, string> = {
  pozole: 'pozole clásico',
  pozoleAntojitos: 'pozole + antojitos',
  taquiza: 'taquiza completa',
};

export function compute(i: Inputs): Outputs {
  const invitados = Math.max(1, Math.min(200, Math.round(num(i.invitados, 10))));
  const menu = String(i.menu || 'pozoleAntojitos');
  const beb = String(i.bebidas || 'conCerveza');
  const conDulces = String(i.incluyeDulces || 'si') === 'si';
  const deco = String(i.decoracion || 'basica');

  const comidaPP = COMIDA[menu] ?? COMIDA.pozoleAntojitos;
  const bebidasPP = BEBIDAS[beb] ?? BEBIDAS.conCerveza;
  const dulcesPP = conDulces ? DULCES_PP : 0;
  const decoTotal = DECO[deco] ?? DECO.basica;

  const comidaTotal = comidaPP * invitados;
  const bebidasTotal = bebidasPP * invitados;
  const dulcesTotal = dulcesPP * invitados;
  const total = comidaTotal + bebidasTotal + dulcesTotal + decoTotal;
  const porInvitado = total / invitados;

  const _insight = {
    title: 'Tu presupuesto para la noche mexicana',
    text: `Para **${invitados} ${invitados === 1 ? 'invitado' : 'invitados'}** con **${MENU_LABEL[menu] || menu}**, presupuestá **${fmtMXN(total)}** (~${fmtMXN(porInvitado)} por persona). Referencia ANPEC: una reunión típica de 10 personas con todo (pozole, antojitos, bebidas, dulces y decoración) ronda los **$7,000**, y las bebidas suelen ser el rubro más pesado. Tip: comprar maíz pozolero, carne y verdura en mercado en vez de supermercado baja la cuenta 15-25%. Precios vigentes a julio 2026.`,
    tone: total > 10000 ? 'warn' : 'good',
    icon: '🇲🇽',
  };

  const bars = [
    { label: 'Comida', value: comidaTotal },
    { label: 'Bebidas', value: bebidasTotal },
  ];
  if (dulcesTotal > 0) bars.push({ label: 'Dulces típicos', value: dulcesTotal });
  if (decoTotal > 0) bars.push({ label: 'Decoración', value: decoTotal });
  const _chart = {
    type: 'bars',
    bars,
    ariaLabel: `Desglose de la fiesta: comida ${fmtMXN(comidaTotal)}, bebidas ${fmtMXN(bebidasTotal)}, dulces ${fmtMXN(dulcesTotal)}, decoración ${fmtMXN(decoTotal)}.`,
  };

  return {
    total: fmtMXN(total),
    porInvitado: fmtMXN(porInvitado),
    comida: fmtMXN(comidaTotal),
    bebidas: fmtMXN(bebidasTotal),
    dulces: conDulces ? fmtMXN(dulcesTotal) : 'No incluidos',
    decoracion: decoTotal > 0 ? fmtMXN(decoTotal) : 'Sin decoración',
    detalle: `${invitados} ${invitados === 1 ? 'invitado' : 'invitados'} · ${MENU_LABEL[menu] || menu} · bebidas ${beb === 'sinAlcohol' ? 'sin alcohol' : beb === 'conCerveza' ? 'con cerveza' : 'con cerveza y tequila'}${conDulces ? ' · dulces típicos' : ''} · Grito: martes 15-sep-2026, 23:00 CDMX.`,
    _insight,
    _chart,
  };
}
