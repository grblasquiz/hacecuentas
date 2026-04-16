/**
 * Calculadora de Sueldo Liquido Chile 2026
 * Deducciones: AFP, Salud (Fonasa/Isapre), Seguro Cesantia, Impuesto Unico
 * Fuente: SII Chile, Superintendencia de Pensiones
 */

export interface SueldoNetoChileInputs {
  sueldoBruto: number;
  afp: string;
  saludIsapre: boolean;
  cotizacionIsapre: number;
}

export interface SueldoNetoChileOutputs {
  sueldoLiquido: number;
  afpMonto: number;
  saludMonto: number;
  cesantiaMonto: number;
  impuesto: number;
  totalDescuentos: number;
  formula: string;
  explicacion: string;
}

// Tasas AFP Chile 2026 (cotizacion obligatoria + SIS/comision)
// Cotizacion obligatoria: 10% + comision variable por AFP
interface AfpInfo {
  nombre: string;
  cotizacionObligatoria: number; // 10% fijo
  comision: number; // porcentaje sobre renta imponible
  sis: number; // Seguro de Invalidez y Sobrevivencia (~1.49%)
}

const AFP_TASAS: Record<string, AfpInfo> = {
  capital: { nombre: 'Capital', cotizacionObligatoria: 10, comision: 1.44, sis: 1.49 },
  cuprum: { nombre: 'Cuprum', cotizacionObligatoria: 10, comision: 1.44, sis: 1.49 },
  habitat: { nombre: 'Habitat', cotizacionObligatoria: 10, comision: 1.27, sis: 1.49 },
  modelo: { nombre: 'Modelo', cotizacionObligatoria: 10, comision: 0.58, sis: 1.49 },
  planvital: { nombre: 'PlanVital', cotizacionObligatoria: 10, comision: 1.16, sis: 1.49 },
  provida: { nombre: 'ProVida', cotizacionObligatoria: 10, comision: 1.45, sis: 1.49 },
  uno: { nombre: 'Uno', cotizacionObligatoria: 10, comision: 0.49, sis: 1.49 },
};

// Impuesto Unico de Segunda Categoria 2026 (en UTM mensuales)
// UTM estimada 2026: ~$66,500 CLP
const UTM_2026 = 66_500;

interface ImpuestoBracket {
  desdeUtm: number;
  hastaUtm: number;
  factor: number;
  rebajaUtm: number;
}

const IMPUESTO_UNICO_BRACKETS: ImpuestoBracket[] = [
  { desdeUtm: 0, hastaUtm: 13.5, factor: 0, rebajaUtm: 0 },
  { desdeUtm: 13.5, hastaUtm: 30, factor: 0.04, rebajaUtm: 0.54 },
  { desdeUtm: 30, hastaUtm: 50, factor: 0.08, rebajaUtm: 1.74 },
  { desdeUtm: 50, hastaUtm: 70, factor: 0.135, rebajaUtm: 3.49 },
  { desdeUtm: 70, hastaUtm: 90, factor: 0.23, rebajaUtm: 10.14 },
  { desdeUtm: 90, hastaUtm: 120, factor: 0.304, rebajaUtm: 16.78 },
  { desdeUtm: 120, hastaUtm: 310, factor: 0.35, rebajaUtm: 22.30 },
  { desdeUtm: 310, hastaUtm: Infinity, factor: 0.40, rebajaUtm: 37.80 },
];

function calcularImpuestoUnico(baseImponible: number): number {
  const utm = baseImponible / UTM_2026;

  if (utm <= 13.5) return 0;

  let bracket = IMPUESTO_UNICO_BRACKETS[0];
  for (const b of IMPUESTO_UNICO_BRACKETS) {
    if (utm > b.desdeUtm && utm <= b.hastaUtm) {
      bracket = b;
      break;
    }
    if (utm > b.hastaUtm) {
      bracket = b;
    }
  }

  const impuestoUtm = utm * bracket.factor - bracket.rebajaUtm;
  return Math.max(0, impuestoUtm * UTM_2026);
}

export function sueldoNetoChile(inputs: SueldoNetoChileInputs): SueldoNetoChileOutputs {
  const bruto = Number(inputs.sueldoBruto);
  const afpKey = String(inputs.afp || 'habitat').toLowerCase().trim();
  const saludIsapre = inputs.saludIsapre === true || inputs.saludIsapre === 'true' as any;
  const cotizacionIsapre = Number(inputs.cotizacionIsapre) || 7;

  if (!bruto || bruto <= 0) {
    throw new Error('Ingresa tu sueldo bruto');
  }

  // Tope imponible 2026: ~81.6 UF = ~$2,900,000 CLP (estimado)
  const topeImponible = 2_900_000;
  const baseImponible = Math.min(bruto, topeImponible);

  // AFP: cotizacion obligatoria (10%) + comision
  const afpInfo = AFP_TASAS[afpKey] || AFP_TASAS.habitat;
  const afpTotalRate = (afpInfo.cotizacionObligatoria + afpInfo.comision) / 100;
  // SIS lo paga el empleador, no se descuenta del trabajador
  const afpMonto = Math.round(baseImponible * afpTotalRate);

  // Salud: 7% Fonasa o % Isapre
  const saludRate = saludIsapre ? (cotizacionIsapre / 100) : 0.07;
  const saludMonto = Math.round(baseImponible * saludRate);

  // Seguro de Cesantia: 0.6% trabajador (contrato indefinido)
  const cesantiaRate = 0.006;
  const cesantiaMonto = Math.round(baseImponible * cesantiaRate);

  // Base para impuesto unico = bruto - AFP - Salud
  const baseImpuesto = bruto - afpMonto - saludMonto;

  // Impuesto Unico de Segunda Categoria
  const impuesto = Math.round(calcularImpuestoUnico(baseImpuesto));

  const totalDescuentos = afpMonto + saludMonto + cesantiaMonto + impuesto;
  const sueldoLiquido = bruto - totalDescuentos;

  const afpPct = (afpInfo.cotizacionObligatoria + afpInfo.comision).toFixed(2);
  const saludPct = saludIsapre ? cotizacionIsapre.toFixed(1) : '7.0';
  const saludTipo = saludIsapre ? 'Isapre' : 'Fonasa';

  const formula = `Sueldo líquido = $${bruto.toLocaleString('es-CL')} − AFP ${afpInfo.nombre} $${afpMonto.toLocaleString('es-CL')} − ${saludTipo} $${saludMonto.toLocaleString('es-CL')} − Cesantía $${cesantiaMonto.toLocaleString('es-CL')}${impuesto > 0 ? ` − Impuesto $${impuesto.toLocaleString('es-CL')}` : ''} = $${sueldoLiquido.toLocaleString('es-CL')}`;

  const explicacion = `De tu sueldo bruto de $${bruto.toLocaleString('es-CL')} CLP, se descuentan: AFP ${afpInfo.nombre} ${afpPct}% ($${afpMonto.toLocaleString('es-CL')}), ${saludTipo} ${saludPct}% ($${saludMonto.toLocaleString('es-CL')}), Seguro de Cesantía 0.6% ($${cesantiaMonto.toLocaleString('es-CL')})${impuesto > 0 ? ` e Impuesto Único $${impuesto.toLocaleString('es-CL')}` : ''}. Total descuentos: $${totalDescuentos.toLocaleString('es-CL')}. Tu sueldo líquido es $${sueldoLiquido.toLocaleString('es-CL')} CLP.`;

  return {
    sueldoLiquido: Math.round(sueldoLiquido),
    afpMonto,
    saludMonto,
    cesantiaMonto,
    impuesto,
    totalDescuentos,
    formula,
    explicacion,
  };
}
