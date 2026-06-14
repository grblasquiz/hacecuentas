export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Salario Mínimo Vital y Móvil vigente. ⚠️ ACTUALIZAR mensualmente (Consejo del Salario).
// Junio 2026: $367.800 (Res. CNEPSMVM). La prestación por desempleo se topea contra el SMVM:
//   - mínimo = 50% del SMVM
//   - máximo = 100% del SMVM
const SMVM = 367_800; // jun-2026
const TOPE_MINIMO = SMVM * 0.50; // $183.900
const TOPE_MAXIMO = SMVM * 1.00; // $367.800

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
  if (topeMaxAplica) topeNota = ` El monto quedó limitado por el **tope máximo** ($${Math.round(TOPE_MAXIMO).toLocaleString('es-AR')}, 100% del SMVM), no por tu sueldo.`;
  else if (topeMinAplica) topeNota = ` Se aplicó el **piso mínimo** ($${Math.round(TOPE_MINIMO).toLocaleString('es-AR')}, 50% del SMVM) porque el 75% de tu sueldo quedaba por debajo.`;

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
