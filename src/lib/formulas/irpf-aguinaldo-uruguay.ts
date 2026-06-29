/**
 * IRPF sobre el AGUINALDO (Sueldo Anual Complementario) — Uruguay 2026.
 *
 * El aguinaldo NO tiene una escala propia: a efectos del IRPF, se grava como un
 * INGRESO ADICIONAL del mes en que se cobra. La retención sobre el aguinaldo es,
 * por lo tanto, el IRPF MARGINAL: lo que sube el impuesto al sumar el aguinaldo al
 * nominal del mes.
 *
 *   IRPF aguinaldo = impuesto(nominal + aguinaldo) − impuesto(nominal)
 *
 * usando la escala progresiva por franjas en BPC (impuesto primario, sin crédito por
 * deducciones, para aislar el efecto marginal del aguinaldo).
 *
 * Aportes a BPS sobre el aguinaldo: montepío 15% + FONASA (3% base) + FRL 0,125%
 * = 18,125% (caso base, sin cónyuge/hijos a cargo). El aguinaldo aporta a BPS igual
 * que el sueldo.
 *
 * Base legal: DGI (IRPF Cat. II), BPS. Escala y BPC en src/lib/data/uruguay-2026.ts.
 */
import {
  URUGUAY_2026,
  fmtUYU,
  impuestoPorFranjasBpc,
} from '../data/uruguay-2026';

export interface IrpfAguinaldoInputs {
  /** Monto nominal del aguinaldo (medio sueldo del semestre, en pesos). */
  aguinaldoNominal?: number | string;
  /** Salario nominal del mes en que se cobra el aguinaldo (en pesos). */
  nominalMensual?: number | string;
}

export interface IrpfAguinaldoOutputs {
  aportesBps: number;
  irpfAguinaldo: number;
  aguinaldoLiquido: number;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function irpfAguinaldoUruguay(i: IrpfAguinaldoInputs): IrpfAguinaldoOutputs {
  const aguinaldoNominal = Math.max(0, Number(i.aguinaldoNominal) || 0);
  const nominalMensual = Math.max(0, Number(i.nominalMensual) || 0);

  // Aportes BPS sobre el aguinaldo (caso base): montepío + FONASA 3% + FRL 0,125%.
  const tasaAportes =
    URUGUAY_2026.bps.montepio + // 15%
    URUGUAY_2026.bps.fonasa.hasta25.soloTrabajador + // 3%
    0.00125; // FRL 0,125% (el sello del data file usa 0,1%; sobre aguinaldo se aplica 0,125%)
  const aportesBps = aguinaldoNominal * tasaAportes;

  // IRPF marginal del aguinaldo = impuesto(mes + aguinaldo) − impuesto(mes).
  const impMes = impuestoPorFranjasBpc(nominalMensual, URUGUAY_2026.irpf.franjas);
  const impConAguinaldo = impuestoPorFranjasBpc(
    nominalMensual + aguinaldoNominal,
    URUGUAY_2026.irpf.franjas,
  );
  const irpfAguinaldo = Math.max(0, impConAguinaldo - impMes);

  const aguinaldoLiquido = aguinaldoNominal - aportesBps - irpfAguinaldo;

  const detalle =
    `Aguinaldo nominal ${fmtUYU(aguinaldoNominal)} − aportes BPS ${fmtUYU(aportesBps)} (18,125%) ` +
    `− IRPF marginal ${fmtUYU(irpfAguinaldo)} = ${fmtUYU(aguinaldoLiquido)} líquido.`;

  return {
    aportesBps: Math.round(aportesBps),
    irpfAguinaldo: Math.round(irpfAguinaldo),
    aguinaldoLiquido: Math.round(aguinaldoLiquido),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🎁',
      text:
        aguinaldoNominal > 0
          ? `De un aguinaldo nominal de **${fmtUYU(aguinaldoNominal)}** cobrás en mano **${fmtUYU(aguinaldoLiquido)}**: se descuentan **${fmtUYU(aportesBps)}** de aportes BPS (18,125%) y **${fmtUYU(irpfAguinaldo)}** de IRPF. El IRPF del aguinaldo es marginal: sube tu impuesto del mes de ${fmtUYU(impMes)} a ${fmtUYU(impConAguinaldo)}.`
          : `Ingresá el monto del aguinaldo y tu sueldo nominal del mes para estimar cuánto cobrás en mano.`,
      tone: 'info' as const,
    },
    _table: {
      title: 'Del aguinaldo nominal al líquido — Uruguay 2026',
      headers: ['Concepto', 'Tasa / base', 'Monto ($U)'],
      rows: [
        ['Aguinaldo nominal', '100%', fmtUYU(aguinaldoNominal)],
        ['Montepío (jubilatorio)', '15%', fmtUYU(aguinaldoNominal * URUGUAY_2026.bps.montepio)],
        ['FONASA', '3%', fmtUYU(aguinaldoNominal * URUGUAY_2026.bps.fonasa.hasta25.soloTrabajador)],
        ['FRL', '0,125%', fmtUYU(aguinaldoNominal * 0.00125)],
        ['IRPF (marginal del mes)', 'escala', fmtUYU(irpfAguinaldo)],
        ['Aguinaldo líquido', '', fmtUYU(aguinaldoLiquido)],
      ],
      note: 'El IRPF del aguinaldo se calcula como impuesto(nominal + aguinaldo) − impuesto(nominal): el aguinaldo se grava como ingreso adicional del mes, sin escala propia. Aportes BPS del caso base (sin cónyuge/hijos a cargo): montepío 15% + FONASA 3% + FRL 0,125% = 18,125%. El IRPF efectivo puede variar con tus deducciones (hijos, alquiler).',
    },
  };
}
