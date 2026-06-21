/**
 * Cupo de gasolina subsidiada en Venezuela: litros y ahorro mensual.
 *
 * El Sistema Patria asigna un cupo mensual de gasolina a precio subsidiado
 * (~USD 0,10/L): 120 litros para automóvil, 60 para moto. Lo que se consume
 * dentro del cupo ahorra la diferencia frente al precio internacional
 * (~USD 0,50/L). Lo que excede el cupo se paga a precio internacional.
 *
 * Cupos y precios: NO se hardcodean — se leen de src/lib/data/venezuela-2026.ts.
 *   Fuentes: CNN Español, Bloomberg Línea, Reporte Confidencial.
 */
import { VENEZUELA_2026, usdToVes, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  tipoVehiculo?: string;   // 'auto' | 'moto'
  litrosConsumo?: number;  // litros consumidos al mes
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export function calculadoraCupoGasolinaSubsidiadaVenezuela(i: Inputs): Outputs {
  const c = VENEZUELA_2026.combustible;
  const tipo = String(i.tipoVehiculo || 'auto') === 'moto' ? 'moto' : 'auto';
  const cupo = tipo === 'moto' ? c.cupoMensualLitrosMoto : c.cupoMensualLitrosAuto;
  const nombreVehiculo = tipo === 'moto' ? 'moto' : 'automóvil';

  const litrosConsumo = Math.max(0, Number(i.litrosConsumo) || 0);

  // Litros dentro del cupo (subsidiado) y excedente (internacional).
  const litrosSubsidiados = Math.min(litrosConsumo, cupo);
  const litrosExcedente = Math.max(0, litrosConsumo - cupo);
  const cupoRestante = Math.max(0, cupo - litrosConsumo);

  const dif = c.precioInternacionalUsdLitro - c.precioSubsidiadoUsdLitro; // ahorro por litro
  const ahorroUsd = litrosSubsidiados * dif;
  const ahorroVesBcv = usdToVes(ahorroUsd, 'bcv');

  // Costo real del mes: subsidiado dentro del cupo + internacional sobre el cupo.
  const costoMesUsd =
    litrosSubsidiados * c.precioSubsidiadoUsdLitro +
    litrosExcedente * c.precioInternacionalUsdLitro;

  const narrativa =
    `Tu ${nombreVehiculo} tiene un cupo subsidiado de ${cupo} litros/mes. ` +
    (litrosConsumo === 0
      ? `Usando todo el cupo a precio subsidiado ahorrarías ${fmtUSD(cupo * dif)} respecto al precio internacional.`
      : litrosExcedente > 0
        ? `Consumís ${litrosConsumo.toLocaleString('de-DE')} L: ${litrosSubsidiados} L entran en el cupo (subsidiados) y ${litrosExcedente} L se pagan a precio internacional. ` +
          `El subsidio te ahorra ${fmtUSD(ahorroUsd)} (${fmtVES(ahorroVesBcv)}) al mes, y el mes te cuesta ${fmtUSD(costoMesUsd)} en total.`
        : `Consumís ${litrosConsumo.toLocaleString('de-DE')} L, todo dentro del cupo. ` +
          `El subsidio te ahorra ${fmtUSD(ahorroUsd)} (${fmtVES(ahorroVesBcv)}) al mes frente al precio internacional, y te quedan ${cupoRestante} L de cupo.`);

  return {
    // Titular: ahorro mensual del subsidio.
    ahorroMensual: `${fmtUSD(ahorroUsd)} · ${fmtVES(ahorroVesBcv)} / mes`,
    cupoMensual: `${cupo} litros (${nombreVehiculo})`,
    litrosSubsidiados: `${litrosSubsidiados} L`,
    litrosExcedente: `${litrosExcedente} L`,
    cupoRestante: `${cupoRestante} L`,
    costoMes: `${fmtUSD(costoMesUsd)} · ${fmtVES(usdToVes(costoMesUsd, 'bcv'))}`,
    ahorroDolares: Number(ahorroUsd.toFixed(2)),
    ahorroBolivares: Number(ahorroVesBcv.toFixed(2)),
    _insight: {
      type: 'highlight',
      icon: '⛽',
      text: narrativa,
    },
    _table: {
      title: 'Cupo de gasolina subsidiada y ahorro',
      headers: ['Vehículo', 'Cupo subsidiado (L/mes)', 'Ahorro máximo del cupo (USD)', 'Ahorro máximo (Bs.)'],
      rows: [
        ['Automóvil', String(c.cupoMensualLitrosAuto), fmtUSD(c.cupoMensualLitrosAuto * dif), fmtVES(usdToVes(c.cupoMensualLitrosAuto * dif, 'bcv'))],
        ['Moto', String(c.cupoMensualLitrosMoto), fmtUSD(c.cupoMensualLitrosMoto * dif), fmtVES(usdToVes(c.cupoMensualLitrosMoto * dif, 'bcv'))],
      ],
      note: 'El cupo subsidiado se asigna vía Sistema Patria (Carnet de la Patria) a ~USD 0,10/L. El ahorro por litro frente al precio internacional (~USD 0,50/L) es de ~USD 0,40. El excedente sobre el cupo se paga a precio internacional en divisas. Conversión a bolívares a la tasa BCV.',
    },
  };
}
