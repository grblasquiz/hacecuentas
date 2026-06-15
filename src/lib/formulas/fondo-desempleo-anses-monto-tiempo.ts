import { DESEMPLEO_PISO, DESEMPLEO_TECHO } from '../data/smvm-ar-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Topes de la prestación por desempleo (ANSES, Ley 24.013) — fuente única.
// jun-2026: piso $181.500 / techo $363.000. Los fija ANSES por resolución (≈50%/100%
// del SMVM, con rezago: el SMVM de junio ya es $367.800). ⚠️ ACTUALIZAR mensualmente.
const TOPE_MINIMO = DESEMPLEO_PISO; // $181.500
const TOPE_MAXIMO = DESEMPLEO_TECHO; // $363.000

export function fondoDesempleoAnsesMontoTiempo(i: Inputs): Outputs {
  const s = Number(i.sueldoPromedio) || 0;
  const m = Number(i.mesesTrabajados) || 0;

  // Monto base = 75% de la mejor remuneración neta mensual de los últimos 6 meses,
  // con piso (50% SMVM) y techo (100% SMVM).
  const montoBase = s * 0.75;
  const monto = s > 0 ? Math.min(Math.max(montoBase, TOPE_MINIMO), TOPE_MAXIMO) : 0;

  const dur = m < 12 ? 2 : m < 24 ? 4 : m < 36 ? 8 : 12;
  const topeMaxAplica = montoBase > TOPE_MAXIMO;
  const topeMinAplica = s > 0 && montoBase < TOPE_MINIMO;
  const totalAcobrar = monto * dur;
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

  let topeNota = ' Sumá meses de aporte para extender la duración del cobro.';
  if (topeMaxAplica) topeNota = ` El monto quedó limitado por el **tope máximo** ($${Math.round(TOPE_MAXIMO).toLocaleString('es-AR')}, tope ANSES vigente), no por tu sueldo.`;
  else if (topeMinAplica) topeNota = ` Se aplicó el **piso mínimo** ($${Math.round(TOPE_MINIMO).toLocaleString('es-AR')}, piso ANSES vigente) porque el 75% de tu sueldo quedaba por debajo.`;

  const _insight = {
    title: 'Tu prestación por desempleo',
    text: `Con **${m} meses** aportados cobrás **${fmt(monto)}/mes** durante **${dur} meses** (~**${fmt(totalAcobrar)}** en total).` + topeNota,
    tone: dur <= 2 ? 'warn' : 'neutral',
    icon: '🛟'
  };

  return {
    montoMensual: fmt(monto),
    duracion: `${dur} meses`,
    interpretacion: `Con ${m} meses aportados cobrás ${fmt(monto)}/mes durante ${dur} meses (75% de tu mejor sueldo, topeado entre ${fmt(TOPE_MINIMO)} y ${fmt(TOPE_MAXIMO)}).`,
    _insight
  };
}
