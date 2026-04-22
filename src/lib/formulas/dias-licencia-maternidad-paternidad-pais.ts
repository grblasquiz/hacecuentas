/**
 * Licencia maternidad/paternidad remunerada por país (días, 2026).
 *
 * Fuentes por país:
 *   AR: LCT art. 177 (mat 90) + art. 158 inc. a (pat 2)
 *   ES: RDL 9/2025 — 19 semanas cada progenitor (133 días)
 *   MX: LFT art. 170 (mat 84) + art. 132 fr. XXVII Bis (pat 5)
 *   CO: Ley 2114/2021 + CST art. 236
 *   CL: Código del Trabajo art. 195 + Ley 20.545 (6 sem pre + 12 post + 12 parental)
 *   UY: Ley 19.161 + Ley 20.312/2025 (vigente desde 01/01/2026)
 *   BR: CLT art. 392 + Lei 15.371/2026 (paternidad escalonada 2026→2029)
 *   PE: Ley 26.644 + Ley 30.807
 *   EC: Código del Trabajo art. 152-153
 *   VE: LOTTT art. 336 y 339
 *   PY: Ley 5508/2015 (modif. Ley 7534/2025)
 *   BO: DS 1212 + Ley 1516/2023
 *   US: FMLA — 12 semanas NO remuneradas a nivel federal. "Remunerada": 0.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

interface LicenciaPais {
  nombre: string;
  mat: number;       // días remunerados por maternidad
  pat: number;       // días remunerados por paternidad
  fuente: string;
  nota?: string;
}

const LICENCIAS: Record<string, LicenciaPais> = {
  ar: {
    nombre: 'Argentina',
    mat: 90,
    pat: 2,
    fuente: 'LCT art. 177 y 158 inc. a',
  },
  es: {
    nombre: 'España',
    mat: 133,
    pat: 133,
    fuente: 'RDL 9/2025 (19 semanas por progenitor)',
    nota: 'Familia monoparental: 32 semanas (224 días).',
  },
  mx: {
    nombre: 'México',
    mat: 84,
    pat: 5,
    fuente: 'LFT art. 170 + 132 fr. XXVII Bis',
  },
  co: {
    nombre: 'Colombia',
    mat: 126,
    pat: 14,
    fuente: 'Ley 2114/2021 + CST art. 236',
  },
  cl: {
    nombre: 'Chile',
    mat: 210,
    pat: 5,
    fuente: 'Código del Trabajo art. 195 + Ley 20.545',
    nota: '6 sem prenatal + 12 postnatal + 12 parental (traspasable al padre).',
  },
  uy: {
    nombre: 'Uruguay',
    mat: 98,
    pat: 20,
    fuente: 'Ley 19.161 + Ley 20.312/2025 (desde 01/01/2026)',
  },
  br: {
    nombre: 'Brasil',
    mat: 120,
    pat: 5,
    fuente: 'CLT art. 392 + Lei 15.371/2026',
    nota: 'Paternidad escalonada: 5 días (2026) → 10 (2027) → 15 (2028) → 20 (2029).',
  },
  pe: {
    nombre: 'Perú',
    mat: 98,
    pat: 10,
    fuente: 'Ley 26.644 + Ley 30.807',
  },
  ec: {
    nombre: 'Ecuador',
    mat: 84,
    pat: 10,
    fuente: 'Código del Trabajo art. 152-153',
  },
  ve: {
    nombre: 'Venezuela',
    mat: 182,
    pat: 14,
    fuente: 'LOTTT art. 336 y 339',
  },
  py: {
    nombre: 'Paraguay',
    mat: 126,
    pat: 14,
    fuente: 'Ley 5508/2015 (modif. Ley 7534/2025)',
  },
  bo: {
    nombre: 'Bolivia',
    mat: 90,
    pat: 3,
    fuente: 'DS 1212 + Ley 1516/2023',
  },
  us: {
    nombre: 'Estados Unidos',
    mat: 0,
    pat: 0,
    fuente: 'FMLA (federal)',
    nota: 'Sin licencia paga a nivel federal. FMLA garantiza 12 semanas SIN GOCE. Algunos estados (CA, NY, NJ, MA) tienen licencia paga propia.',
  },
};

export function diasLicenciaMaternidadPaternidadPais(i: Inputs): Outputs {
  const p = String(i.pais || 'ar').toLowerCase();
  const t = String(i.tipo || 'mat').toLowerCase();

  const cfg = LICENCIAS[p];
  if (!cfg) throw new Error('País no disponible');
  if (t !== 'mat' && t !== 'pat') throw new Error('Tipo debe ser "mat" o "pat"');

  const dias = t === 'mat' ? cfg.mat : cfg.pat;
  const tipoLabel = t === 'mat' ? 'Maternidad' : 'Paternidad';

  const remunerada = dias > 0 ? 'Sí' : 'No (o sólo no remunerada)';
  const semanas = (dias / 7).toFixed(1);

  let resumen = `${cfg.nombre} — ${tipoLabel}: ${dias} días remunerados`;
  if (dias > 0) resumen += ` (≈ ${semanas} semanas)`;
  resumen += `. Base legal: ${cfg.fuente}.`;
  if (cfg.nota) resumen += ` ${cfg.nota}`;

  return {
    dias: `${dias} días`,
    semanas,
    remunerada,
    fuente: cfg.fuente,
    resumen,
  };
}
