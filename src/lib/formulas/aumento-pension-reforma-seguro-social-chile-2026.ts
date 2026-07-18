/** Beneficio por Años Cotizados — reforma previsional chilena (Seguro Social).
 *  0,1 UF por cada 12 meses cotizados, con tope de 2,5 UF (25 años / 300 meses).
 *  Requisitos: 65+ años y mínimo 120 meses cotizados (mujeres) / 240 (hombres).
 *  Pago desde enero 2026, automático, se suma a la pensión.
 *  Fuente: ChileAtiende ficha 130450 (ver data/chile-2026.ts). */
import clLive from '../../data/live/chile.json';
import { fmtCLP, BENEFICIO_ANIOS_COTIZADOS_2026 } from '../data/chile-2026.ts';

export interface Inputs {
  sexo: string;           // 'mujer' | 'hombre'
  edad: number;
  mesesCotizados: number; // total de meses cotizados en la vida laboral
  pensionActual: number;  // pensión mensual actual en CLP (0 si aún no te pensionás)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const uf = (clLive as any)?.uf?.valor ?? 40844.79;
  const B = BENEFICIO_ANIOS_COTIZADOS_2026;

  const mujer = i.sexo === 'mujer';
  const edad = Math.round(Number(i.edad) || 0);
  const meses = Math.max(0, Math.round(Number(i.mesesCotizados) || 0));
  const pension = Number(i.pensionActual) || 0;

  if (edad <= 0) throw new Error('Ingresá tu edad');
  if (meses <= 0) throw new Error('Ingresá tus meses cotizados (los ves en el certificado de cotizaciones de tu AFP)');

  const mesesMin = mujer ? B.mesesMinMujer : B.mesesMinHombre;
  const cumpleEdad = edad >= B.edadMinima;
  const cumpleMeses = meses >= mesesMin;
  const cumple = cumpleEdad && cumpleMeses;

  const aniosComputados = Math.min(Math.floor(meses / 12), B.aniosTope);
  const beneficioUf = Math.min(aniosComputados * B.ufPorAnioCotizado, B.topeUf);
  const beneficioClp = cumple ? beneficioUf * uf : 0;
  const pensionNueva = pension + beneficioClp;
  const aumentoPct = pension > 0 && cumple ? (beneficioClp / pension) * 100 : 0;

  const motivos: string[] = [];
  if (!cumpleEdad) motivos.push(`tener ${B.edadMinima} años o más (tenés ${edad})`);
  if (!cumpleMeses) motivos.push(`al menos ${mesesMin} meses cotizados como ${mujer ? 'mujer' : 'hombre'} (tenés ${meses})`);

  const _insight = {
    title: cumple ? 'Tu aumento por años cotizados' : 'Aún no cumplís los requisitos',
    text: cumple
      ? `Con **${aniosComputados} años cotizados** computables, el Beneficio por Años Cotizados te suma **${beneficioUf.toLocaleString('es-CL', { maximumFractionDigits: 1 })} UF ≈ ${fmtCLP(beneficioClp)}** al mes${pension > 0 ? `: tu pensión pasaría de **${fmtCLP(pension)}** a **${fmtCLP(pensionNueva)}** (+${aumentoPct.toLocaleString('es-CL', { maximumFractionDigits: 1 })}%)` : ''}. Se paga de forma automática desde enero de 2026, sin postulación.`
      : `Para recibir este beneficio de la reforma te falta: ${motivos.join(' y ')}. El monto que te correspondería con tus cotizaciones actuales sería ${beneficioUf.toLocaleString('es-CL', { maximumFractionDigits: 1 })} UF ≈ ${fmtCLP(beneficioUf * uf)} al mes.`,
    tone: cumple ? 'positive' : 'warning',
    icon: '👵',
  };
  const _chart = pension > 0 ? {
    type: 'bar',
    segments: [
      { label: 'Pensión actual', value: Math.round(pension) },
      { label: 'Beneficio años cotizados', value: Math.round(beneficioClp) },
    ],
    ariaLabel: `Pensión actual ${fmtCLP(pension)} más beneficio ${fmtCLP(beneficioClp)} = ${fmtCLP(pensionNueva)}.`,
  } : undefined;

  return {
    beneficioMensual: cumple ? `${beneficioUf.toLocaleString('es-CL', { maximumFractionDigits: 1 })} UF ≈ ${fmtCLP(beneficioClp)}` : '$0 — no cumplís los requisitos todavía',
    aniosComputados: `${aniosComputados} de ${B.aniosTope} máximos`,
    pensionConBeneficio: cumple && pension > 0 ? fmtCLP(pensionNueva) : (cumple ? 'Ingresá tu pensión actual para verlo' : '—'),
    aumentoPorcentual: cumple && pension > 0 ? `+${aumentoPct.toLocaleString('es-CL', { maximumFractionDigits: 1 })}%` : '—',
    cumpleRequisitos: cumple ? 'Sí' : `No: falta ${motivos.join(' y ')}`,
    detalle: `Fórmula: 0,1 UF por cada 12 meses cotizados, tope ${B.topeUf.toLocaleString('es-CL')} UF (${B.aniosTope} años). ${meses} meses → ${aniosComputados} años computables → ${beneficioUf.toLocaleString('es-CL', { maximumFractionDigits: 1 })} UF. Con UF = ${fmtCLP(uf)}: ${fmtCLP(beneficioUf * uf)} mensuales. Requisitos: ${B.edadMinima}+ años y ${mujer ? `${B.mesesMinMujer} meses cotizados (mujeres; sube gradualmente desde 2028 hasta 180 meses en 2036)` : `${B.mesesMinHombre} meses cotizados (hombres)`}. El monto exacto lo determina el IPS/AFP con tu historial oficial de cotizaciones.`,
    _insight,
    _chart,
  };
}
