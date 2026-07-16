/**
 * Arbitrios municipales Perú — estimador de limpieza pública, parques y jardines y
 * serenazgo. Los arbitrios se fijan por ORDENANZA de cada municipalidad distrital
 * (no hay una tasa nacional): dependen del uso del predio, la zona, el área y la
 * ubicación, y deben distribuirse según el costo real del servicio (criterio del
 * Tribunal Constitucional, EXP. 0053-2004-AI/TC).
 *
 * Este estimador usa tarifas REFERENCIALES por distrito (S/ por m² al año, uso casa
 * habitación) para dar un orden de magnitud. El monto exacto surge de tu recibo o
 * de la ordenanza vigente de tu municipalidad. Base legal: arts. 68-70 del TUO de
 * la Ley de Tributación Municipal (D.S. 156-2004-EF).
 */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  distrito?: string;   // distrito (tarifa referencial)
  areaM2: number;      // área del predio (m²)
  uso?: string;        // 'casa' | 'comercio'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Tarifa referencial anual de arbitrios por m² (uso casa habitación), S//m²/año. */
const TARIFAS: Record<string, { nombre: string; solM2Anual: number }> = {
  miraflores:   { nombre: 'Miraflores', solM2Anual: 28 },
  santiago_surco: { nombre: 'Santiago de Surco', solM2Anual: 24 },
  san_isidro:   { nombre: 'San Isidro', solM2Anual: 30 },
  la_molina:    { nombre: 'La Molina', solM2Anual: 22 },
  sjl:          { nombre: 'San Juan de Lurigancho', solM2Anual: 12 },
  comas:        { nombre: 'Comas', solM2Anual: 10 },
  otro:         { nombre: 'Otro distrito (promedio Lima)', solM2Anual: 18 },
};

// Reparto referencial del arbitrio entre los tres servicios.
const MIX = { limpieza: 0.40, parques: 0.22, serenazgo: 0.38 };

export function compute(i: Inputs): Outputs {
  const area = Number(i.areaM2) || 0;
  if (area <= 0) throw new Error('Ingresá el área del predio en m²');
  const t = TARIFAS[String(i.distrito || 'otro')] || TARIFAS.otro;
  const comercio = String(i.uso || 'casa') === 'comercio';
  // El uso comercial suele pagar un factor mayor (referencial ×2,2).
  const factorUso = comercio ? 2.2 : 1;

  const anual = area * t.solM2Anual * factorUso;
  const mensual = anual / 12;
  const trimestral = anual / 4;

  const limpieza = anual * MIX.limpieza;
  const parques = anual * MIX.parques;
  const serenazgo = anual * MIX.serenazgo;

  const _insight = {
    title: 'Arbitrios anuales estimados',
    text: `Para un predio de **${area} m²** en **${t.nombre}**${comercio ? ' de uso comercial' : ''}, los arbitrios anuales estimados son **${fmtPEN(anual)}** (≈ **${fmtPEN(mensual)}/mes** o ${fmtPEN(trimestral)} por trimestre): limpieza pública ${fmtPEN(limpieza)}, parques y jardines ${fmtPEN(parques)} y serenazgo ${fmtPEN(serenazgo)}. Es una estimación referencial: el monto real lo fija la ordenanza de tu municipalidad distrital.`,
    tone: 'neutral',
    icon: '🧹',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Limpieza pública', value: Math.round(limpieza) },
      { label: 'Serenazgo', value: Math.round(serenazgo) },
      { label: 'Parques y jardines', value: Math.round(parques) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(anual),
    centerLabel: 'Arbitrios/año',
    ariaLabel: `Arbitrios anuales estimados de ${fmtPEN(anual)} repartidos en limpieza, serenazgo y parques.`,
  };

  return {
    anual: fmtPEN(anual),
    mensual: fmtPEN(mensual),
    limpieza: fmtPEN(limpieza),
    parques: fmtPEN(parques),
    serenazgo: fmtPEN(serenazgo),
    detalle: `${area} m² × ${fmtPEN(t.solM2Anual)}/m² al año${comercio ? ' × 2,2 (uso comercial)' : ''} = ${fmtPEN(anual)} en ${t.nombre} · limpieza ${fmtPEN(limpieza)} + parques ${fmtPEN(parques)} + serenazgo ${fmtPEN(serenazgo)}. Tarifa referencial; verificá la ordenanza de tu municipalidad.`,
    _insight,
    _chart,
  };
}
