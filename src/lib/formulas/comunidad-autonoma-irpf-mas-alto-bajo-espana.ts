export interface Inputs {
  salario_bruto: number;
  situacion_familiar: 'soltero' | 'casado' | 'familia_numerosa';
}

export interface Outputs {
  base_liquidable: number;
  cuota_madrid: number;
  cuota_cataluna: number;
  cuota_andalucia: number;
  cuota_valencia: number;
  cuota_paisvasco: number;
  cuota_galicia: number;
  tipo_efectivo_madrid: number;
  tipo_efectivo_cataluna: number;
  tipo_efectivo_andalucia: number;
  tipo_efectivo_valencia: number;
  tipo_efectivo_paisvasco: number;
  tipo_efectivo_galicia: number;
  diferencia_max_min: number;
  ccaa_mas_barata: string;
  ccaa_mas_cara: string;
}

// ─── Tipos auxiliares ───────────────────────────────────────────────
type Tramo = [number, number]; // [hasta, tipo_porcentual]

// Aplica una escala de tramos progresivos a una base liquidable
// Cada entrada: [límite_superior_del_tramo, tipo_%]
// El último tramo tiene límite Infinity
function aplicarEscala(base: number, tramos: Tramo[]): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let baseRestante = base;
  let limiteAnterior = 0;
  for (const [hasta, tipo] of tramos) {
    if (baseRestante <= 0) break;
    const anchoTramo = hasta - limiteAnterior;
    const baseEnTramo = Math.min(baseRestante, anchoTramo);
    cuota += baseEnTramo * (tipo / 100);
    baseRestante -= baseEnTramo;
    limiteAnterior = hasta;
    if (hasta === Infinity) break;
  }
  return cuota;
}

export function compute(i: Inputs): Outputs {
  const salario = Math.max(0, i.salario_bruto ?? 0);

  // ── 1. Cotización SS trabajador 2026 (tipo 6,35%) ─────────────────
  // Fuente: Seguridad Social – Tipos de cotización 2026
  const TIPO_SS = 0.0635;
  const cotizacionSS = salario * TIPO_SS;

  // ── 2. Reducción por rendimientos del trabajo (art. 20 LIRPF 2026) ─
  // Fuente: AEAT – Ley 35/2006 art. 20 (modificación 2024 vigente 2026)
  const rendimientoNeto = salario - cotizacionSS;
  let reduccionTrabajo = 0;
  if (rendimientoNeto <= 14852) {
    reduccionTrabajo = 6498;
  } else if (rendimientoNeto <= 17673.52) {
    reduccionTrabajo = 6498 - 1.14286 * (rendimientoNeto - 14852);
  } else {
    reduccionTrabajo = 2000;
  }
  const rendimientosNetos = Math.max(0, rendimientoNeto - reduccionTrabajo);

  // ── 3. Mínimo personal y familiar ────────────────────────────────
  // Fuente: AEAT – arts. 57-61 LIRPF 2026
  const MINIMO_CONTRIBUYENTE = 5550; // soltero sin hijos
  const MINIMO_PRIMER_HIJO = 2400;
  const MINIMO_SEGUNDO_HIJO = 2700;

  let minimoPersonalFamiliar = MINIMO_CONTRIBUYENTE;
  if (i.situacion_familiar === 'familia_numerosa') {
    minimoPersonalFamiliar += MINIMO_PRIMER_HIJO + MINIMO_SEGUNDO_HIJO;
  }
  // 'casado' en tributación individual no añade mínimo adicional estándar

  // ── 4. Base liquidable ────────────────────────────────────────────
  const baseLiquidable = Math.max(0, rendimientosNetos - minimoPersonalFamiliar);

  // ── 5. Escala estatal 2026 (art. 63 LIRPF) ───────────────────────
  // Fuente: AEAT – Campaña Renta 2026
  const ESCALA_ESTATAL: Tramo[] = [
    [12450,   9.50],
    [20200,  12.00],
    [35200,  15.00],
    [60000,  18.50],
    [300000, 22.50],
    [Infinity, 24.50]
  ];

  const cuotaEstatal = aplicarEscala(baseLiquidable, ESCALA_ESTATAL);

  // ── 6. Escalas autonómicas 2026 ───────────────────────────────────

  // Madrid – Decreto Legislativo 1/2010 (modificado; mínimos tipos del RC)
  // Fuente: Comunidad de Madrid – Ley de acompañamiento presupuestario 2026
  const ESCALA_MADRID: Tramo[] = [
    [12450,   8.50],
    [20200,  10.70],
    [35200,  12.90],
    [60000,  14.53],
    [300000, 16.50],
    [Infinity, 17.00]
  ];

  // Cataluña – Ley 5/2012 y LPG Cataluña 2026
  // Fuente: Agència Tributaria de Catalunya
  const ESCALA_CATALUNA: Tramo[] = [
    [12450,  10.50],
    [17707,  12.00],
    [21000,  14.00],
    [33007,  15.00],
    [53407,  18.80],
    [90000,  21.50],
    [120000, 23.50],
    [175000, 24.50],
    [Infinity, 25.50]
  ];

  // Andalucía – Decreto Legislativo 1/2018 (reforma 2022, vigente 2026)
  // Fuente: Agencia Tributaria de Andalucía
  const ESCALA_ANDALUCIA: Tramo[] = [
    [12450,   9.50],
    [20200,  12.00],
    [35200,  15.00],
    [60000,  18.50],
    [Infinity, 22.50]
  ];

  // Comunitat Valenciana – Ley 13/1997 (modificada LPG CV 2026)
  // Fuente: Agència Tributària Valenciana
  const ESCALA_VALENCIA: Tramo[] = [
    [12450,  10.00],
    [17000,  12.00],
    [30000,  14.00],
    [50000,  17.50],
    [65000,  19.50],
    [80000,  20.50],
    [Infinity, 21.00]
  ];

  // País Vasco (régimen foral – referencia Bizkaia; Hacienda Foral 2026)
  // Fuente: Hacienda Foral de Bizkaia – Norma Foral 13/2013
  // Nota: en el PV no existe división estatal/autonómica; la escala es única.
  // Se modela como cuota única (no se suma cuota estatal)
  const ESCALA_PAISVASCO_FORAL: Tramo[] = [
    [12450,   7.00],
    [20200,   8.00],
    [35200,  10.00],
    [60000,  14.00],
    [Infinity, 20.00]
  ];

  // Galicia – Decreto Legislativo 1/2011 (LPG Xunta 2026)
  // Fuente: Axencia Tributaria de Galicia
  const ESCALA_GALICIA: Tramo[] = [
    [12450,   9.00],
    [20200,  11.65],
    [35200,  14.90],
    [60000,  18.40],
    [80000,  21.00],
    [Infinity, 22.50]
  ];

  // ── 7. Cálculo de cuotas totales ──────────────────────────────────
  // Régimen común: cuota total = cuota estatal + cuota autonómica propia
  const cuotaMadrid    = cuotaEstatal + aplicarEscala(baseLiquidable, ESCALA_MADRID);
  const cuotaCataluna  = cuotaEstatal + aplicarEscala(baseLiquidable, ESCALA_CATALUNA);
  const cuotaAndalucia = cuotaEstatal + aplicarEscala(baseLiquidable, ESCALA_ANDALUCIA);
  const cuotaValencia  = cuotaEstatal + aplicarEscala(baseLiquidable, ESCALA_VALENCIA);
  // Régimen foral País Vasco: escala única (no se suma tramo estatal)
  const cuotaPaisVasco = aplicarEscala(baseLiquidable, ESCALA_PAISVASCO_FORAL);
  const cuotaGalicia   = cuotaEstatal + aplicarEscala(baseLiquidable, ESCALA_GALICIA);

  // ── 8. Tipos efectivos sobre salario bruto ────────────────────────
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const tipoEfectivo = (cuota: number) =>
    salario > 0 ? round2((cuota / salario) * 100) : 0;

  // ── 9. CCAA más barata y más cara ────────────────────────────────
  const cuotas: Array<{ nombre: string; cuota: number }> = [
    { nombre: 'Madrid',            cuota: cuotaMadrid },
    { nombre: 'Cataluña',          cuota: cuotaCataluna },
    { nombre: 'Andalucía',         cuota: cuotaAndalucia },
    { nombre: 'C. Valenciana',     cuota: cuotaValencia },
    { nombre: 'País Vasco',        cuota: cuotaPaisVasco },
    { nombre: 'Galicia',           cuota: cuotaGalicia }
  ];

  const masBarata = cuotas.reduce((a, b) => a.cuota <= b.cuota ? a : b);
  const masCara   = cuotas.reduce((a, b) => a.cuota >= b.cuota ? a : b);
  const diferencia = round2(masCara.cuota - masBarata.cuota);

  return {
    base_liquidable:         round2(baseLiquidable),
    cuota_madrid:            round2(cuotaMadrid),
    cuota_cataluna:          round2(cuotaCataluna),
    cuota_andalucia:         round2(cuotaAndalucia),
    cuota_valencia:          round2(cuotaValencia),
    cuota_paisvasco:         round2(cuotaPaisVasco),
    cuota_galicia:           round2(cuotaGalicia),
    tipo_efectivo_madrid:    tipoEfectivo(cuotaMadrid),
    tipo_efectivo_cataluna:  tipoEfectivo(cuotaCataluna),
    tipo_efectivo_andalucia: tipoEfectivo(cuotaAndalucia),
    tipo_efectivo_valencia:  tipoEfectivo(cuotaValencia),
    tipo_efectivo_paisvasco: tipoEfectivo(cuotaPaisVasco),
    tipo_efectivo_galicia:   tipoEfectivo(cuotaGalicia),
    diferencia_max_min:      diferencia,
    ccaa_mas_barata:         masBarata.nombre,
    ccaa_mas_cara:           masCara.nombre
  };
}
