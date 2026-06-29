import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  fecha: string;          // "enero-junio" | "julio-diciembre"
  horasSemanales: number; // jornada semanal del trabajador (referencia 44h)
}

export interface Outputs {
  smnMensual: number;
  jornalDiario: number;
  valorHora: number;
  proporcional: number;
  liquidoAprox: number;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// Constantes — fuente única: src/lib/data/uruguay-2026.ts (Decreto N° 319/025).
const SMN_ENERO = URUGUAY_2026.smn.mensualEnero;   // $24.572 (ene-jun 2026)
const SMN_JULIO = URUGUAY_2026.smn.mensualJulio;   // $25.383 (jul-dic 2026)
const DIV_JORNAL = URUGUAY_2026.smn.divisorJornal; // 25
const DIV_HORA = URUGUAY_2026.smn.divisorHora;     // 200
// Aportes personales para estimar líquido sobre el SMN (FONASA mínimo 3% + montepío 15% + FRL 0,1%).
const APORTES_LIQUIDO = URUGUAY_2026.bps.montepio + 0.03 + URUGUAY_2026.bps.frl; // 0,181

function smnDe(fecha: string): number {
  return fecha === 'julio-diciembre' ? SMN_JULIO : SMN_ENERO;
}

export function compute(i: Inputs): Outputs {
  const smnMensual = smnDe(i.fecha);
  const horas = Math.max(0, i.horasSemanales || URUGUAY_2026.laboral.jornadaSemanalHoras);
  const jornalDiario = smnMensual / DIV_JORNAL;
  const valorHora = smnMensual / DIV_HORA;
  const proporcional = smnMensual * (horas / URUGUAY_2026.laboral.jornadaSemanalHoras);
  const liquidoAprox = proporcional * (1 - APORTES_LIQUIDO);

  const r2 = (n: number) => Math.round(n * 100) / 100;

  const _insight = {
    title: `Salario mínimo nacional: ${fmtUYU(smnMensual)}`,
    text: `Para una jornada de **${horas}h** semanales el mínimo proporcional es **${fmtUYU(proporcional)}** nominal (~**${fmtUYU(liquidoAprox)}** líquido tras aportes BPS). El jornal mínimo es **${fmtUYU(jornalDiario)}** y la hora **${fmtUYU(valorHora)}**.`,
    tone: 'info' as const,
    icon: '💵',
  };

  const _chart = {
    type: 'bars',
    bars: [
      { label: 'Nominal proporcional', value: r2(proporcional), color: '#2563eb', colorDark: '#3b82f6' },
      { label: 'Líquido aprox.', value: r2(liquidoAprox), color: '#16a34a', colorDark: '#22c55e' },
    ],
    format: 'currency',
    ariaLabel: `Salario mínimo proporcional ${fmtUYU(proporcional)} y líquido aproximado ${fmtUYU(liquidoAprox)}`,
  };

  // Tabla: el mismo SMN expresado en sus distintas unidades (mes/día/hora) y por tramo.
  const fila = (label: string, mensual: number) => [
    label,
    fmtUYU(mensual),
    fmtUYU(mensual / DIV_JORNAL),
    fmtUYU(mensual / DIV_HORA),
  ];
  const _table = {
    title: 'Salario mínimo nacional 2026 por tramo y unidad',
    headers: ['Tramo', 'Mensual', 'Jornal (÷25)', 'Hora (÷200)'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: [
      fila('Enero – junio 2026', SMN_ENERO),
      fila('Julio – diciembre 2026', SMN_JULIO),
    ],
    note: 'Decreto N° 319/025 (MTSS). El jornal mínimo es SMN ÷ 25 y la hora SMN ÷ 200. El líquido aproximado descuenta aportes personales BPS (≈18,1%).',
  };

  return {
    smnMensual: r2(smnMensual),
    jornalDiario: r2(jornalDiario),
    valorHora: r2(valorHora),
    proporcional: r2(proporcional),
    liquidoAprox: r2(liquidoAprox),
    _insight,
    _chart,
    _table,
  };
}
