/** Retiro programado vs renta vitalicia — Chile (modalidades de pensión, DL 3.500).
 *  Estimación SIMPLIFICADA con matemática de anualidades: la pensión de retiro
 *  programado se aproxima como anualidad mensual del saldo sobre la expectativa
 *  de años, a la tasa indicada. La oferta de renta vitalicia sale del certificado
 *  SCOMP del usuario (fija en UF, de por vida, sin herencia del saldo).
 *  NO reemplaza el cálculo oficial con tablas de mortalidad y vector de tasas.
 *  Fuentes: spensiones.cl (modalidades) y CMF Educa (rentas vitalicias). */
import clLive from '../../data/live/chile.json';
import { fmtCLP } from '../data/chile-2026.ts';

export interface Inputs {
  saldo: number;            // saldo total en la cuenta individual AFP (CLP)
  expectativaAnios: number; // años esperados de pago (expectativa de vida al pensionarse)
  tasaAnual: number;        // % anual (tasa de interés técnica / retorno esperado)
  ofertaRvUf?: number;      // oferta de renta vitalicia del SCOMP, en UF mensuales (opcional)
  aniosHerencia: number;    // a cuántos años mirar el saldo heredable del retiro programado
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const uf = (clLive as any)?.uf?.valor ?? 40844.79;
  const saldo = Number(i.saldo) || 0;
  const anios = Number(i.expectativaAnios) || 0;
  const tasa = Number(i.tasaAnual) || 0;
  const ofertaUf = Number(i.ofertaRvUf) || 0;
  const aniosHer = Math.max(1, Math.round(Number(i.aniosHerencia) || 10));

  if (saldo <= 0) throw new Error('Ingresá el saldo de tu cuenta AFP (lo ves en tu cartola)');
  if (anios <= 0 || anios > 60) throw new Error('Ingresá los años esperados de pago (por ejemplo 20 a 25)');
  if (tasa <= 0 || tasa > 15) throw new Error('Ingresá una tasa anual razonable (por ejemplo 3 a 4%)');

  const im = tasa / 100 / 12;
  const n = Math.round(anios * 12);

  // Anualidad mensual: pensión = saldo × i / (1 − (1+i)^−n)
  const pensionRp = saldo * im / (1 - Math.pow(1 + im, -n));
  const pensionRpUf = pensionRp / uf;

  // Saldo remanente (heredable) a los aniosHer años pagando esa pensión constante.
  const m = Math.min(n, aniosHer * 12);
  const factor = Math.pow(1 + im, m);
  const saldoRemanente = Math.max(0, saldo * factor - pensionRp * (factor - 1) / im);

  const rvClp = ofertaUf > 0 ? ofertaUf * uf : 0;
  const difInicial = ofertaUf > 0 ? pensionRp - rvClp : 0;

  const _insight = {
    title: 'Pensión inicial estimada por modalidad',
    text: ofertaUf > 0
      ? `Con un saldo de **${fmtCLP(saldo)}**, el retiro programado partiría en torno a **${fmtCLP(pensionRp)}** al mes (≈ ${pensionRpUf.toLocaleString('es-CL', { maximumFractionDigits: 2 })} UF), contra **${fmtCLP(rvClp)}** de tu oferta de renta vitalicia (${ofertaUf.toLocaleString('es-CL', { maximumFractionDigits: 2 })} UF). ${difInicial >= 0 ? `El retiro programado parte **${fmtCLP(Math.abs(difInicial))} más alto**, pero se recalcula cada año y tiende a bajar; la renta vitalicia queda fija en UF de por vida.` : `La renta vitalicia parte **${fmtCLP(Math.abs(difInicial))} más alta** y además es fija en UF de por vida.`} Si fallecés a los ${aniosHer} años, el retiro programado dejaría un saldo heredable estimado de **${fmtCLP(saldoRemanente)}**; en renta vitalicia el saldo pasa a la aseguradora (tus beneficiarios reciben pensión de sobrevivencia, no herencia del fondo).`
      : `Con un saldo de **${fmtCLP(saldo)}**, el retiro programado partiría en torno a **${fmtCLP(pensionRp)}** al mes (≈ ${pensionRpUf.toLocaleString('es-CL', { maximumFractionDigits: 2 })} UF). Para compararlo contra una renta vitalicia real, ingresá la oferta en UF de tu certificado SCOMP. A los ${aniosHer} años, el saldo heredable estimado sería **${fmtCLP(saldoRemanente)}**.`,
    tone: 'neutral',
    icon: '⚖️',
  };
  const _chart = ofertaUf > 0 ? {
    type: 'bar',
    segments: [
      { label: 'Retiro programado (inicial)', value: Math.round(pensionRp) },
      { label: 'Renta vitalicia (fija)', value: Math.round(rvClp) },
    ],
    ariaLabel: `Pensión inicial: retiro programado ${fmtCLP(pensionRp)}, renta vitalicia ${fmtCLP(rvClp)}.`,
  } : undefined;

  return {
    pensionRetiroProgramado: `${fmtCLP(pensionRp)} (≈ ${pensionRpUf.toLocaleString('es-CL', { maximumFractionDigits: 2 })} UF) — inicial, se recalcula cada año`,
    pensionRentaVitalicia: ofertaUf > 0
      ? `${fmtCLP(rvClp)} (${ofertaUf.toLocaleString('es-CL', { maximumFractionDigits: 2 })} UF) — fija en UF de por vida`
      : 'Ingresá la oferta en UF de tu certificado SCOMP',
    diferenciaInicial: ofertaUf > 0
      ? `${difInicial >= 0 ? 'Retiro programado' : 'Renta vitalicia'} parte ${fmtCLP(Math.abs(difInicial))} más alta`
      : '—',
    herenciaRetiroProgramado: `≈ ${fmtCLP(saldoRemanente)} si fallecés a los ${aniosHer} años (saldo remanente estimado)`,
    herenciaRentaVitalicia: '$0 del fondo — el saldo pasa a la aseguradora; tus beneficiarios legales reciben pensión de sobrevivencia',
    detalle: `Retiro programado estimado como anualidad: ${fmtCLP(saldo)} × i ÷ (1 − (1+i)^−${n}) con i = ${tasa.toLocaleString('es-CL')}%/12 = ${fmtCLP(pensionRp)}/mes. Saldo a ${aniosHer} años pagando esa pensión: ${fmtCLP(saldoRemanente)}. UF = ${fmtCLP(uf)}. El cálculo oficial usa tablas de mortalidad y el vector de tasas de la Superintendencia de Pensiones, y el retiro programado REAL se recalcula cada año (tiende a decrecer con la edad). La renta vitalicia es irrevocable: no podés volver a cambiar de modalidad. Compará siempre con tu certificado de ofertas SCOMP antes de decidir.`,
    _insight,
    _chart,
  };
}
