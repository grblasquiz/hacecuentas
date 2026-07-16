/**
 * ICE — Impuesto a los Consumos Especiales (Ecuador) 2026.
 * Dos tipos de tarifa:
 *  - AD-VALOREM (% sobre la base imponible): perfumes 20% · videojuegos 35% · TV pagada 15% ·
 *    casinos/salas de juego 35% · armas de fuego deportivas 30% · vehículos 5-35% según precio.
 *  - ESPECÍFICA (monto por unidad física): cigarrillos $0,16/unidad ·
 *    cerveza industrial $13,62/litro de alcohol puro · cerveza artesanal $1,56/litro ·
 *    bebidas alcohólicas $10,41/litro de alcohol puro · bebidas azucaradas $0,18 por 100 g de azúcar.
 * Fuente: SRI, Resolución de tarifas ICE vigente 2026 (sri.gob.ec). Verificado 2026-07-16.
 * IVA 15% se aplica DESPUÉS del ICE (no se calcula aquí; este cálculo es solo el ICE).
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  categoria?: string;  // clave del bien/servicio
  valorBase?: number;  // base imponible ($) para ad-valorem; precio del vehículo
  cantidad?: number;   // unidades / litros de alcohol puro / gramos de azúcar (tarifa específica)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

type Tarifa =
  | { tipo: 'ad'; label: string; rate: number; unidadBase: string }
  | { tipo: 'esp'; label: string; rate: number; unidadCant: string; por?: number }
  | { tipo: 'vehiculo'; label: string };

const CATS: Record<string, Tarifa> = {
  perfumes:            { tipo: 'ad', label: 'Perfumes y aguas de tocador', rate: 0.20, unidadBase: 'precio ex fábrica/ex aduana' },
  videojuegos:         { tipo: 'ad', label: 'Videojuegos', rate: 0.35, unidadBase: 'precio' },
  tv_pagada:           { tipo: 'ad', label: 'Servicios de televisión pagada', rate: 0.15, unidadBase: 'valor del servicio' },
  casinos:             { tipo: 'ad', label: 'Servicios de casinos y salas de juego', rate: 0.35, unidadBase: 'valor' },
  armas:               { tipo: 'ad', label: 'Armas de fuego deportivas', rate: 0.30, unidadBase: 'precio' },
  cigarrillos:         { tipo: 'esp', label: 'Cigarrillos', rate: 0.16, unidadCant: 'unidades (cigarrillos)' },
  cerveza_industrial:  { tipo: 'esp', label: 'Cerveza industrial', rate: 13.62, unidadCant: 'litros de alcohol puro' },
  cerveza_artesanal:   { tipo: 'esp', label: 'Cerveza artesanal', rate: 1.56, unidadCant: 'litros de alcohol puro' },
  bebidas_alcoholicas: { tipo: 'esp', label: 'Bebidas alcohólicas (licores)', rate: 10.41, unidadCant: 'litros de alcohol puro' },
  bebidas_azucaradas:  { tipo: 'esp', label: 'Bebidas azucaradas (>25 g azúcar/L)', rate: 0.18, unidadCant: 'gramos de azúcar', por: 100 },
  vehiculo:            { tipo: 'vehiculo', label: 'Vehículo motorizado' },
};

/** Tarifa ad-valorem del ICE de vehículos según su precio de venta (PVP). */
function tarifaVehiculo(precio: number): number {
  if (precio <= 20000) return 0.05;
  if (precio <= 30000) return 0.10;
  if (precio <= 40000) return 0.15;
  if (precio <= 50000) return 0.20;
  if (precio <= 60000) return 0.25;
  if (precio <= 70000) return 0.30;
  return 0.35;
}

export function compute(i: Inputs): Outputs {
  const key = String(i.categoria || 'perfumes');
  const cat = CATS[key] || CATS.perfumes;
  const base = Math.max(0, Number(i.valorBase) || 0);
  const cant = Math.max(0, Number(i.cantidad) || 0);

  let ice = 0;
  let tarifaLabel = '';
  let detalleCalc = '';

  if (cat.tipo === 'ad') {
    if (base <= 0) throw new Error('Ingresá la base imponible ($) del bien o servicio');
    ice = base * cat.rate;
    tarifaLabel = `${Math.round(cat.rate * 100)}% ad-valorem`;
    detalleCalc = `${fmtUSDec(base)} × ${Math.round(cat.rate * 100)}%`;
  } else if (cat.tipo === 'vehiculo') {
    if (base <= 0) throw new Error('Ingresá el precio del vehículo ($)');
    const rate = tarifaVehiculo(base);
    ice = base * rate;
    tarifaLabel = `${Math.round(rate * 100)}% ad-valorem (por precio)`;
    detalleCalc = `${fmtUSDec(base)} × ${Math.round(rate * 100)}%`;
  } else {
    if (cant <= 0) throw new Error(`Ingresá la cantidad (${cat.unidadCant})`);
    const por = cat.por ?? 1;
    ice = (cant / por) * cat.rate;
    tarifaLabel = `${fmtUSDec(cat.rate)} por ${por > 1 ? por + ' ' : ''}${cat.unidadCant}`;
    detalleCalc = `${cant} ${cat.unidadCant} × ${fmtUSDec(cat.rate)}${por > 1 ? ' / ' + por : ''}`;
  }

  const _insight = {
    title: `ICE — ${cat.label}`,
    text: `El ICE de **${cat.label}** se calcula con tarifa **${tarifaLabel}**: ${detalleCalc} = **${fmtUSDec(ice)}**. Sobre el ICE se aplica después el IVA 15%.`,
    tone: 'neutral',
    icon: '🍺',
  };

  const _table = {
    title: 'Tarifas del ICE 2026 (principales)',
    headers: ['Bien / servicio', 'Tarifa'],
    align: ['left', 'right'] as ('left' | 'right' | 'center')[],
    rows: [
      ['Perfumes y aguas de tocador', '20% ad-valorem'],
      ['Videojuegos', '35% ad-valorem'],
      ['Televisión pagada', '15% ad-valorem'],
      ['Casinos y salas de juego', '35% ad-valorem'],
      ['Cigarrillos', '$0,16 por unidad'],
      ['Cerveza industrial', '$13,62 / litro de alcohol puro'],
      ['Cerveza artesanal', '$1,56 / litro de alcohol puro'],
      ['Bebidas alcohólicas', '$10,41 / litro de alcohol puro'],
      ['Bebidas azucaradas (>25 g/L)', '$0,18 por 100 g de azúcar'],
      ['Vehículos', '5% a 35% según precio'],
    ],
    note: 'Fuente: SRI, Resolución de tarifas ICE 2026. La base ad-valorem es el precio ex fábrica o ex aduana. En bebidas alcohólicas y cerveza el ICE específico se aplica sobre los litros de alcohol puro (grado × volumen).',
  };

  return {
    ice: fmtUSDec(ice),
    tipoTarifa: cat.tipo === 'esp' ? 'Específica' : 'Ad-valorem',
    tarifaAplicada: tarifaLabel,
    detalle: `${cat.label}: ${detalleCalc} = ICE ${fmtUSDec(ice)} (antes de IVA).`,
    _insight,
    _table,
  };
}
