import { aplicarEscalaMensual, MNI_MENSUAL_BASE, INCREMENTO_HIJO_MENSUAL, INCREMENTO_CONYUGE_MENSUAL } from './_ganancias-escala';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sueldoGastronomicoUthgraMozoCocinero(i: Inputs): Outputs {
  const antig = Number(i.antiguedad) || 0;
  const cargas = Number(i.cargas) || 0;
  const conyuge = Number(i.conyuge) || 0;
  // Básico Mozo de Primera (Cat D tramo 1) junio 2026 según acuerdo UTHGRA-FEHGRA
  // CCT 389/04 homologado abril 2026. Fuente: calcularsueldo.com.ar/paritarias/14416
  const basico = 990_000;
  const plusAntig = basico * 0.01 * antig;
  const bruto = basico + plusAntig;
  const jubilacion = bruto * 0.11;
  const obraSocial = bruto * 0.03;
  const pami = bruto * 0.03;
  const baseGanancias = Math.max(0, bruto - jubilacion - obraSocial - pami - MNI_MENSUAL_BASE - cargas * INCREMENTO_HIJO_MENSUAL - conyuge * INCREMENTO_CONYUGE_MENSUAL);
  const ganancias = aplicarEscalaMensual(baseGanancias).impuesto;
  const neto = bruto - jubilacion - obraSocial - pami - ganancias;
  const sac = bruto / 12;
  return {
    basico: '$' + basico.toLocaleString('es-AR'),
    bruto: '$' + bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    neto: '$' + neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    sac: '$' + sac.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    resumen: `Básico: $${basico.toLocaleString('es-AR')}. Con antigüedad ${antig} años: neto ~$${neto.toFixed(0)}.`,
  };
}
