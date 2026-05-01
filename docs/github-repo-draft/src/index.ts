/**
 * calculadoras-argentinas — Open-source AR fiscal/labor/financial formulas
 *
 * Live calculators: https://hacecuentas.com
 * Source: https://github.com/grblasquiz/calculadoras-argentinas
 */

// ─── Sueldo & Liquidación ───────────────────────────────────────────────────
export { aguinaldoSAC } from './sueldo/aguinaldo-sac';
export { indemnizacionDespido } from './sueldo/indemnizacion-despido';
// TODO: export { netoDeskeBruto } from './sueldo/neto-desde-bruto';
// TODO: export { vacacionesDiasLey } from './sueldo/vacaciones-dias-ley';
// TODO: export { horasExtra } from './sueldo/horas-extra';

// ─── Impuestos ──────────────────────────────────────────────────────────────
// TODO: export { gananciasEmpleados4taCategoria } from './impuestos/ganancias-4ta-categoria';
// TODO: export { monotributoCategoria } from './impuestos/monotributo-categoria';
// TODO: export { bienesPersonales } from './impuestos/bienes-personales';
// TODO: export { iibbCABA } from './impuestos/iibb-caba';
// TODO: export { iva } from './impuestos/iva';
// TODO: export { retencionRG830 } from './impuestos/retencion-rg-830';

// ─── ANSES & Beneficios ─────────────────────────────────────────────────────
// TODO: export { jubilacionPBUPC } from './anses/jubilacion-pbu-pc';
// TODO: export { auhMonto } from './anses/auh-monto';
// TODO: export { becaProgresar } from './anses/beca-progresar';

// ─── Finanzas ───────────────────────────────────────────────────────────────
export { cuotaPrestamo } from './finanzas/cuota-prestamo-frances';
// TODO: export { plazoFijoTEATEM } from './finanzas/plazo-fijo-tea-tem';
// TODO: export { inflacionPoderCompra } from './finanzas/inflacion-poder-compra';
// TODO: export { uvaVsPesosVsDolar } from './finanzas/uva-vs-pesos-vs-dolar';

// ─── Inversiones ────────────────────────────────────────────────────────────
// TODO: export { bonosSoberanosTIR } from './inversiones/bonos-soberanos-tir';
// TODO: export { cedearRatioConversion } from './inversiones/cedear-ratio-conversion';

// ─── Tipos comunes ──────────────────────────────────────────────────────────
export type {
  AguinaldoSACInput,
  AguinaldoSACResult,
} from './sueldo/aguinaldo-sac';

export type {
  IndemnizacionDespidoInput,
  IndemnizacionDespidoResult,
} from './sueldo/indemnizacion-despido';

export type {
  CuotaPrestamoInput,
  CuotaPrestamoResult,
} from './finanzas/cuota-prestamo-frances';
