/**
 * Retención en honorarios profesionales (Ecuador).
 * IR: 10% persona natural / 5% sociedad (Res. NAC-DGERCGC26-00000009, vig. 1-mar-2026).
 * IVA: 15%. Retención de IVA: el % depende del agente y del servicio; aquí se modela el
 *      caso del 100% cuando el pagador es agente de retención de IVA (verificar tabla SRI).
 * Fuente: SRI (sri.gob.ec). Verificado 2026-06-29.
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  baseImponible: number;
  tipoPrestador?: string;   // 'natural' | 'sociedad'
  aplicaIva?: string;       // 'si' | 'no'
  agenteRetIva?: string;    // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; _table?: any; }

const IVA = ECUADOR_2026.iva; // 0.15

export function compute(i: Inputs): Outputs {
  const base = Number(i.baseImponible) || 0;
  const esNatural = (i.tipoPrestador ?? 'natural') !== 'sociedad';
  const gravaIva = (i.aplicaIva ?? 'si') === 'si';
  const retieneIva = (i.agenteRetIva ?? 'si') === 'si';

  if (base <= 0) throw new Error('Ingresá la base imponible del servicio');

  const pctIr = esNatural ? 0.10 : 0.05;

  const iva = gravaIva ? base * IVA : 0;
  const retIr = base * pctIr;
  // Retención de IVA: 100% del IVA solo si el pagador es agente de retención de IVA
  // y el servicio grava IVA. (El % real puede ser menor según el caso → ver tabla SRI.)
  const retIva = (retieneIva && gravaIva) ? iva * 1.0 : 0;
  const netoCobrar = base + iva - retIr - retIva;

  const _insight = {
    title: 'Tu cobro neto tras retenciones',
    text: `Sobre un honorario de **${fmtUSDec(base)}** (${esNatural ? 'persona natural, IR 10%' : 'sociedad, IR 5%'}), facturás ${fmtUSDec(iva)} de IVA y te retienen **${fmtUSDec(retIr)}** de Impuesto a la Renta${retIva > 0 ? ` y **${fmtUSDec(retIva)}** de IVA` : ''}. Cobrás neto **${fmtUSDec(netoCobrar)}**; las retenciones son crédito tributario que recuperás.`,
    tone: 'neutral',
    icon: '🧾',
  };

  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Neto a cobrar', value: Math.round(netoCobrar * 100) / 100 },
      { label: 'Retención IR', value: Math.round(retIr * 100) / 100 },
      { label: 'Retención IVA', value: Math.round(retIva * 100) / 100 },
    ],
    ariaLabel: `Neto ${fmtUSDec(netoCobrar)}, retención IR ${fmtUSDec(retIr)}, retención IVA ${fmtUSDec(retIva)}.`,
  };

  // Tabla: el mismo cálculo bajo escenarios habituales sobre la base ingresada.
  const escenarios: { label: string; natural: boolean; iva: boolean; retIva: boolean }[] = [
    { label: 'Persona natural (IR 10%)', natural: true, iva: true, retIva: true },
    { label: 'Sociedad (IR 5%)', natural: false, iva: true, retIva: true },
    { label: 'Persona natural, sin retención IVA', natural: true, iva: true, retIva: false },
    { label: 'Sociedad, sin retención IVA', natural: false, iva: true, retIva: false },
    { label: 'Persona natural, servicio sin IVA', natural: true, iva: false, retIva: false },
  ];
  const tableRows = escenarios.map((e) => {
    const ivaE = e.iva ? base * IVA : 0;
    const retIrE = base * (e.natural ? 0.10 : 0.05);
    const retIvaE = (e.retIva && e.iva) ? ivaE : 0;
    const neto = base + ivaE - retIrE - retIvaE;
    return [
      e.label,
      fmtUSDec(ivaE),
      `${fmtUSDec(retIrE)} (${e.natural ? '10' : '5'}%)`,
      fmtUSDec(retIvaE),
      fmtUSDec(neto),
    ];
  });
  const _table = {
    title: `Retención y neto a cobrar sobre base ${fmtUSDec(base)}`,
    headers: ['Escenario', 'IVA (15%)', 'Retención IR', 'Retención IVA', 'Neto a cobrar'],
    align: ['left', 'right', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tableRows,
    note: 'Retención IR: 10% natural / 5% sociedad (SRI). IVA 15%. El 100% de retención de IVA es solo uno de los porcentajes posibles: depende del agente y del servicio (verificá la tabla del SRI).',
  };

  return {
    netoCobrar: fmtUSDec(netoCobrar),
    iva: fmtUSDec(iva),
    retIr: fmtUSDec(retIr),
    retIva: fmtUSDec(retIva),
    detalle: `IVA ${fmtUSDec(iva)} (15%) · Retención IR ${fmtUSDec(retIr)} (${esNatural ? '10' : '5'}%) · Retención IVA ${fmtUSDec(retIva)} → neto ${fmtUSDec(netoCobrar)}.`,
    _insight,
    _chart,
    _table,
  };
}
