/** Categoría ideal de monotributo Argentina 2026
 *  Tabla de categorías según facturación, superficie, etc.
 *  Topes y cuotas: fuente única src/lib/data/monotributo-2026.ts (ARCA).
 *  Reforma 2026: servicios y venta de bienes comparten la escala completa A–K;
 *  difiere la cuota (servicios paga más en las categorías altas).
 */

import { CATEGORIAS as CATS_2026, TOPES, PARAMS_FISICOS, componentes, type Cat } from '../data/monotributo-2026';

export interface Inputs {
  facturacionAnual: number;
  actividad: string;
  superficieAfectada: number;
  energiaAnual: number;
  alquilerAnual: number;
}

export interface Outputs {
  categoriaIdeal: string;
  cuotaMensual: number;
  facturacionMaxima: number;
  margenDisponible: number;
  componenteImpositivo: number;
  componenteJubilatorio: number;
  componenteObraSocial: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

interface Categoria {
  letra: Cat;
  tope: number;
  superficie: number;
  energia: number;
  alquiler: number;
}

// Parámetros físicos orientativos del régimen (superficie m², energía kWh/año,
// alquileres devengados $/año): fuente única PARAMS_FISICOS en
// src/lib/data/monotributo-2026.ts. Topes de facturación: fuente única ARCA 2026.

const CATEGORIAS: Categoria[] = CATS_2026.map((letra) => ({
  letra,
  tope: Math.round(TOPES[letra]),
  ...PARAMS_FISICOS[letra],
}));

export function monotributoCategoriaIdeal(i: Inputs): Outputs {
  const facturacion = Number(i.facturacionAnual);
  const actividad = String(i.actividad || 'servicios');
  const superficie = Number(i.superficieAfectada) || 0;
  const energia = Number(i.energiaAnual) || 0;
  const alquiler = Number(i.alquilerAnual) || 0;

  if (!facturacion || facturacion <= 0) throw new Error('Ingresá tu facturación anual estimada');

  const esServicios = actividad === 'servicios';

  let categoriaIdeal: Categoria | null = null;
  for (const cat of CATEGORIAS) {
    // Reforma 2026: el tope es el mismo para servicios y venta de bienes.
    const tope = cat.tope;

    if (facturacion <= tope) {
      // Verificar otros parámetros
      if (superficie > 0 && superficie > cat.superficie) continue;
      if (energia > 0 && energia > cat.energia) continue;
      if (alquiler > 0 && alquiler > cat.alquiler) continue;

      categoriaIdeal = cat;
      break;
    }
  }

  if (!categoriaIdeal) {
    throw new Error(`Con $${facturacion.toLocaleString()} de facturación anual, excedés el tope del monotributo. Debés inscribirte como Responsable Inscripto.`);
  }

  // Cuota mensual desde la fuente única (difiere por actividad en categorías altas).
  const comp = componentes(categoriaIdeal.letra, esServicios ? 'servicios' : 'bienes');
  const impositivo = comp.integrado;
  const jubilatorio = comp.sipa;
  const obraSocialMonto = comp.obraSocial;
  const cuotaMensual = Math.round(comp.total);
  const facMax = categoriaIdeal.tope;
  const margenDisponible = facMax - facturacion;

  const formula = `Categoría ${categoriaIdeal.letra}: cuota = $${impositivo.toLocaleString()} + $${jubilatorio.toLocaleString()} + $${Math.round(obraSocialMonto).toLocaleString()} = $${cuotaMensual.toLocaleString()}/mes`;
  const explicacion = `Con facturación anual de $${facturacion.toLocaleString()} (${actividad}), tu categoría ideal es **${categoriaIdeal.letra}**. Cuota mensual total: $${cuotaMensual.toLocaleString()} (impositivo $${impositivo.toLocaleString()} + jubilatorio $${jubilatorio.toLocaleString()} + obra social $${Math.round(obraSocialMonto).toLocaleString()}). Tope de la categoría: $${facMax.toLocaleString()}. Margen: $${margenDisponible.toLocaleString()} (${((margenDisponible / facMax) * 100).toFixed(1)}%). Escala ARCA 2026 (desde 02/2026, igual tope para servicios y venta).`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Impositivo', value: impositivo },
      { label: 'Jubilatorio', value: jubilatorio },
      { label: 'Obra social', value: Math.round(obraSocialMonto) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(cuotaMensual).toLocaleString('es-AR'),
    centerLabel: 'Cuota/mes',
    ariaLabel: 'Composición de la cuota mensual: impositivo, jubilatorio y obra social',
  };

  const margenPctNum = (margenDisponible / facMax) * 100;
  const cerca = margenPctNum < 10;
  const _insight = {
    title: cerca ? 'Estás cerca del tope' : 'Tu categoría ideal',
    text: cerca
      ? `Te corresponde la categoría **${categoriaIdeal.letra}** ($${Math.round(cuotaMensual).toLocaleString('es-AR')}/mes), pero solo te queda **$${Math.round(margenDisponible).toLocaleString('es-AR')}** de margen (${margenPctNum.toFixed(1)}% del tope). Si seguís facturando vas a tener que recategorizar a la categoría siguiente.`
      : `Con $${facturacion.toLocaleString('es-AR')} de facturación anual te corresponde la categoría **${categoriaIdeal.letra}**, con una cuota de **$${Math.round(cuotaMensual).toLocaleString('es-AR')}/mes**. Te quedan **$${Math.round(margenDisponible).toLocaleString('es-AR')}** de margen antes de saltar de categoría.`,
    tone: cerca ? 'warn' : 'good',
    icon: cerca ? '⚠️' : '✅',
  };

  return {
    categoriaIdeal: categoriaIdeal.letra,
    cuotaMensual,
    facturacionMaxima: facMax,
    margenDisponible,
    componenteImpositivo: impositivo,
    componenteJubilatorio: jubilatorio,
    componenteObraSocial: Math.round(obraSocialMonto),
    formula,
    explicacion,
    _chart: chart,
    _insight,
  };
}
