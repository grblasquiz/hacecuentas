/** Subsidio de Arriendo MINVU — llamado 2026 (postulación 07-jul a 07-ago-2026).
 *  Verifica requisitos del llamado y estima montos: 170 UF totales, tope mensual
 *  4,2 UF (4,9 UF en regiones especiales), arriendo máximo 11/13 UF, ahorro 4 UF,
 *  ingreso familiar 7–25 UF (+8 UF por integrante desde el 4°), RSH ≤ 70%.
 *  Fuente: minvu.gob.cl (ver data/chile-2026.ts → SUBSIDIO_ARRIENDO_2026). */
import clLive from '../../data/live/chile.json';
import { fmtCLP, SUBSIDIO_ARRIENDO_2026 } from '../data/chile-2026.ts';

export interface Inputs {
  rshTramo: string;        // '40' | '50' | '60' | '70' | '80' | '90' (tramo RSH)
  ingresoFamiliar: number; // CLP mensuales del grupo familiar
  integrantes: number;     // integrantes del grupo familiar
  ahorro: number;          // CLP en cuenta de ahorro para la vivienda
  arriendoMensual: number; // CLP del arriendo a pagar
  zona: string;            // 'general' | 'especial'
  grupoFamiliar: string;   // 'con_familia' | 'solo_60mas' | 'solo_menor60'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const uf = (clLive as any)?.uf?.valor ?? 40844.79;
  const S = SUBSIDIO_ARRIENDO_2026;

  const rsh = Number(i.rshTramo) || 100;
  const ingreso = Number(i.ingresoFamiliar) || 0;
  const integrantes = Math.max(1, Math.round(Number(i.integrantes) || 1));
  const ahorro = Number(i.ahorro) || 0;
  const arriendo = Number(i.arriendoMensual) || 0;
  const especial = i.zona === 'especial';

  if (ingreso <= 0) throw new Error('Ingresá el ingreso mensual del grupo familiar');
  if (arriendo <= 0) throw new Error('Ingresá el valor del arriendo mensual');

  const topeMensualUf = especial ? S.topeMensualUfZonaEspecial : S.topeMensualUf;
  const arriendoMaxUf = especial ? S.arriendoMaxUfZonaEspecial : S.arriendoMaxUf;
  const ingresoMaxUf = S.ingresoMaxUf + S.ufExtraPorIntegranteDesde4to * Math.max(0, integrantes - 3);

  const ingresoMinClp = S.ingresoMinUf * uf;
  const ingresoMaxClp = ingresoMaxUf * uf;
  const ahorroMinClp = S.ahorroMinimoUf * uf;
  const arriendoMaxClp = arriendoMaxUf * uf;

  const checks: { ok: boolean; label: string }[] = [
    { ok: rsh <= S.rshTramoMax, label: `RSH hasta el tramo del ${S.rshTramoMax}% (indicaste ${rsh}%)` },
    { ok: ingreso >= ingresoMinClp && ingreso <= ingresoMaxClp, label: `Ingreso familiar entre ${S.ingresoMinUf} y ${ingresoMaxUf} UF (${fmtCLP(ingresoMinClp)}–${fmtCLP(ingresoMaxClp)})` },
    { ok: ahorro >= ahorroMinClp, label: `Ahorro mínimo de ${S.ahorroMinimoUf} UF (${fmtCLP(ahorroMinClp)}) en cuenta de ahorro para la vivienda` },
    { ok: arriendo <= arriendoMaxClp, label: `Arriendo de hasta ${arriendoMaxUf} UF (${fmtCLP(arriendoMaxClp)})` },
    { ok: i.grupoFamiliar !== 'solo_menor60', label: 'Postular con cónyuge/conviviente o hijo/a (o solo/a si tenés 60 años o más)' },
  ];
  const fallidos = checks.filter(c => !c.ok);
  const cumple = fallidos.length === 0;

  const subsidioTotalClp = S.totalUf * uf;
  const topeMensualClp = topeMensualUf * uf;
  const mesesTope = S.totalUf / topeMensualUf; // meses usando siempre el tope mensual
  const aporteEstimado = Math.min(topeMensualClp, arriendo);
  const pctArriendo = (aporteEstimado / arriendo) * 100;

  const _insight = {
    title: cumple ? 'Cumplís los requisitos del llamado 2026' : 'Todavía no cumplís todos los requisitos',
    text: cumple
      ? `Con tus datos cumplís los requisitos del llamado (abierto del 07-07 al 07-08-2026). El subsidio entrega hasta **${S.totalUf} UF ≈ ${fmtCLP(subsidioTotalClp)}** en total, con tope mensual de **${topeMensualUf.toLocaleString('es-CL')} UF ≈ ${fmtCLP(topeMensualClp)}**: cubriría **${pctArriendo.toLocaleString('es-CL', { maximumFractionDigits: 0 })}%** de tu arriendo de ${fmtCLP(arriendo)}.`
      : `Con tus datos no pasás ${fallidos.length === 1 ? 'este requisito' : `estos ${fallidos.length} requisitos`}: ${fallidos.map(f => f.label).join(' · ')}. Revisá si podés corregirlo antes del cierre del 7 de agosto de 2026.`,
    tone: cumple ? 'positive' : 'warning',
    icon: '🏠',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Aporte del subsidio', value: Math.round(aporteEstimado) },
      { label: 'Pagás vos', value: Math.round(Math.max(0, arriendo - aporteEstimado)) },
    ],
    ariaLabel: `De un arriendo de ${fmtCLP(arriendo)}, el subsidio aporta ${fmtCLP(aporteEstimado)} y pagás ${fmtCLP(Math.max(0, arriendo - aporteEstimado))}.`,
  };

  return {
    veredicto: cumple ? 'Cumplís los requisitos del llamado 2026' : `No cumplís ${fallidos.length} de ${checks.length} requisitos`,
    subsidioTotal: `${S.totalUf} UF ≈ ${fmtCLP(subsidioTotalClp)}`,
    aporteMensualMaximo: `${topeMensualUf.toLocaleString('es-CL')} UF ≈ ${fmtCLP(topeMensualClp)}`,
    aporteSobreTuArriendo: `${fmtCLP(aporteEstimado)} (${pctArriendo.toLocaleString('es-CL', { maximumFractionDigits: 0 })}% de tu arriendo)`,
    arriendoMaximoPermitido: `${arriendoMaxUf} UF ≈ ${fmtCLP(arriendoMaxClp)}`,
    duracionAlTope: `≈ ${Math.floor(mesesTope)} meses usando el tope mensual completo`,
    requisitos: checks.map(c => `${c.ok ? '✓' : '✗'} ${c.label}`).join(' · '),
    detalle: `Valores con UF = ${fmtCLP(uf)}. Subsidio total ${S.totalUf} UF; tope mensual ${topeMensualUf.toLocaleString('es-CL')} UF (zona ${especial ? 'especial' : 'general'}); ingreso permitido ${S.ingresoMinUf}–${ingresoMaxUf} UF para ${integrantes} integrante${integrantes > 1 ? 's' : ''}; ahorro mínimo ${S.ahorroMinimoUf} UF; arriendo máximo ${arriendoMaxUf} UF. Postulación del 07-07-2026 al 07-08-2026 en minvu.cl con ClaveÚnica o en oficinas Serviu. Resultado orientativo: la selección la define el MINVU según puntaje y cupos.`,
    _insight,
    _chart,
  };
}
