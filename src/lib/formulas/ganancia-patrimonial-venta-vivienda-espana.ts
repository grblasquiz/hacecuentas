export interface Inputs {
  precio_venta: number;
  gastos_venta: number;
  precio_compra: number;
  gastos_compra: number;
  mejoras: number;
  amortizacion_deducida: number;
  tipo_exencion: 'ninguna' | 'reinversion_total' | 'reinversion_parcial' | 'mayores_65_habitual' | 'mayores_65_renta_vitalicia';
  importe_reinvertido: number;
  otras_ganancias_ahorro: number;
}

export interface Outputs {
  valor_transmision: number;
  valor_adquisicion: number;
  ganancia_bruta: number;
  ganancia_exenta: number;
  ganancia_tributable: number;
  cuota_irpf: number;
  tipo_efectivo: number;
  detalle_tramos: string;
}

// Tramos base del ahorro IRPF 2026 (art. 66 LIRPF + escala autonómica general)
// Fuente: AEAT — Ley 35/2006 modificada; vigencia 2026
const TRAMOS_AHORRO: Array<{ limite: number; tipo: number }> = [
  { limite: 6000,    tipo: 0.19 }, // 0 – 6.000 €: 19%
  { limite: 50000,   tipo: 0.21 }, // 6.000,01 – 50.000 €: 21%
  { limite: 200000,  tipo: 0.23 }, // 50.000,01 – 200.000 €: 23%
  { limite: 300000,  tipo: 0.27 }, // 200.000,01 – 300.000 €: 27%
  { limite: Infinity, tipo: 0.28 }, // Más de 300.000 €: 28%
];

// Límite exención renta vitalicia mayores 65 (art. 38.3 LIRPF)
// Fuente: BOE-A-2006-20764
const LIMITE_RENTA_VITALICIA = 240000;

function calcularCuotaAhorro(base: number, basePrevia: number): { cuota: number; desglose: string } {
  // Calcula la cuota sobre `base` euros sabiendo que ya hay `basePrevia` euros acumulados
  // en la base del ahorro (otras ganancias). Aplica los tramos marginales correctamente.
  if (base <= 0) return { cuota: 0, desglose: 'Sin ganancia tributable' };

  let cuotaTotal = 0;
  let cuotaPrevia = 0;
  const lineas: string[] = [];

  // Calculamos la cuota sobre (basePrevia + base) y restamos la cuota sobre basePrevia
  for (const fn of [basePrevia, basePrevia + base]) {
    let acumulado = 0;
    let cuota = 0;
    let limite_anterior = 0;

    for (const tramo of TRAMOS_AHORRO) {
      if (acumulado >= fn) break;
      const limite_superior = tramo.limite === Infinity ? fn : Math.min(tramo.limite, fn);
      const base_tramo = Math.max(0, limite_superior - Math.max(limite_anterior, acumulado));
      cuota += base_tramo * tramo.tipo;
      acumulado = limite_superior;
      limite_anterior = tramo.limite === Infinity ? fn : tramo.limite;
      if (acumulado >= fn) break;
    }

    if (fn === basePrevia) {
      cuotaPrevia = cuota;
    } else {
      cuotaTotal = cuota;
    }
  }

  const cuotaNeta = Math.max(0, cuotaTotal - cuotaPrevia);

  // Desglose legible
  let restante = base;
  let acumuladoDesde = basePrevia;
  let limite_anterior2 = 0;

  for (const tramo of TRAMOS_AHORRO) {
    if (restante <= 0) break;
    const inicioTramo = limite_anterior2;
    const finTramo = tramo.limite === Infinity ? Infinity : tramo.limite;

    if (acumuladoDesde >= finTramo) {
      limite_anterior2 = finTramo;
      continue;
    }

    const inicioEfectivo = Math.max(acumuladoDesde, inicioTramo);
    const disponible = tramo.limite === Infinity ? restante : Math.max(0, finTramo - inicioEfectivo);
    const enEsteTramo = Math.min(restante, disponible);

    if (enEsteTramo > 0) {
      const cuotaTramo = enEsteTramo * tramo.tipo;
      const tipoPorc = (tramo.tipo * 100).toFixed(0);
      const rangoDesc = tramo.limite === Infinity
        ? `> 300.000 €`
        : inicioTramo === 0
          ? `0 – 6.000 €`
          : `${inicioTramo.toLocaleString('es-ES')} – ${finTramo.toLocaleString('es-ES')} €`;
      lineas.push(
        `${rangoDesc} al ${tipoPorc}%: ${enEsteTramo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € → ${cuotaTramo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
      );
      restante -= enEsteTramo;
      acumuladoDesde = inicioEfectivo + enEsteTramo;
    }

    limite_anterior2 = tramo.limite === Infinity ? acumuladoDesde : finTramo;
  }

  return { cuota: cuotaNeta, desglose: lineas.join('\n') };
}

export function compute(i: Inputs): Outputs {
  // Valores por defecto seguros
  const precioVenta = Math.max(0, i.precio_venta || 0);
  const gastosVenta = Math.max(0, i.gastos_venta || 0);
  const precioCompra = Math.max(0, i.precio_compra || 0);
  const gastosCompra = Math.max(0, i.gastos_compra || 0);
  const mejoras = Math.max(0, i.mejoras || 0);
  const amortizacion = Math.max(0, i.amortizacion_deducida || 0);
  const importeReinvertido = Math.max(0, i.importe_reinvertido || 0);
  const otrasGanancias = Math.max(0, i.otras_ganancias_ahorro || 0);
  const tipoExencion = i.tipo_exencion || 'ninguna';

  // --- Valor de transmisión (art. 35.2 LIRPF) ---
  const valor_transmision = Math.max(0, precioVenta - gastosVenta);

  // --- Valor de adquisición (art. 35.1 LIRPF) ---
  // Precio + gastos compra + mejoras − amortización deducida
  const valor_adquisicion = Math.max(0, precioCompra + gastosCompra + mejoras - amortizacion);

  // --- Ganancia bruta ---
  const ganancia_bruta = valor_transmision - valor_adquisicion;

  // Si hay pérdida, no hay cuota
  if (ganancia_bruta <= 0) {
    return {
      valor_transmision,
      valor_adquisicion,
      ganancia_bruta,
      ganancia_exenta: 0,
      ganancia_tributable: 0,
      cuota_irpf: 0,
      tipo_efectivo: 0,
      detalle_tramos: 'Pérdida patrimonial: no tributa. Puedes compensarla con ganancias del ahorro de este ejercicio o los 4 siguientes.'
    };
  }

  // --- Cálculo de la parte exenta ---
  let ganancia_exenta = 0;

  if (tipoExencion === 'mayores_65_habitual') {
    // Exención total, sin límite (art. 33.4.b LIRPF)
    ganancia_exenta = ganancia_bruta;

  } else if (tipoExencion === 'reinversion_total') {
    // Se presupone reinversión >= valor de transmisión → exención total
    ganancia_exenta = ganancia_bruta;

  } else if (tipoExencion === 'reinversion_parcial') {
    // Exención proporcional (art. 38.1 LIRPF)
    // ganancia_exenta = ganancia_bruta × (reinvertido / valor_transmision)
    if (valor_transmision > 0) {
      const ratio = Math.min(1, importeReinvertido / valor_transmision);
      ganancia_exenta = ganancia_bruta * ratio;
    } else {
      ganancia_exenta = 0;
    }

  } else if (tipoExencion === 'mayores_65_renta_vitalicia') {
    // Exención hasta 240.000 € reinvertidos en renta vitalicia (art. 38.3 LIRPF)
    // Si reinversión >= ganancia_bruta (y <= 240.000), exención total de la ganancia
    // Si reinversión parcial: ganancia_exenta = ganancia_bruta × (reinvertido_efectivo / valor_transmision)
    // El importe reinvertido no puede superar 240.000 €
    const reinvertidoEfectivo = Math.min(importeReinvertido, LIMITE_RENTA_VITALICIA);
    if (valor_transmision > 0) {
      const ratio = Math.min(1, reinvertidoEfectivo / valor_transmision);
      ganancia_exenta = ganancia_bruta * ratio;
    } else {
      ganancia_exenta = 0;
    }

  } else {
    ganancia_exenta = 0;
  }

  // Redondeo para evitar decimales fantasma
  ganancia_exenta = Math.min(ganancia_exenta, ganancia_bruta);

  const ganancia_tributable = Math.max(0, ganancia_bruta - ganancia_exenta);

  // --- Cuota IRPF ---
  const { cuota: cuota_irpf, desglose } = calcularCuotaAhorro(ganancia_tributable, otrasGanancias);

  // --- Tipo efectivo sobre ganancia bruta ---
  const tipo_efectivo = ganancia_bruta > 0 ? (cuota_irpf / ganancia_bruta) * 100 : 0;

  // --- Mensaje de desglose ---
  let detalle_tramos: string;
  if (ganancia_tributable <= 0) {
    detalle_tramos = tipoExencion !== 'ninguna'
      ? 'Ganancia totalmente exenta: cuota 0 €.'
      : 'Sin ganancia tributable.';
  } else {
    detalle_tramos = desglose || 'Sin desglose disponible.';
  }

  return {
    valor_transmision,
    valor_adquisicion,
    ganancia_bruta,
    ganancia_exenta,
    ganancia_tributable,
    cuota_irpf,
    tipo_efectivo,
    detalle_tramos
  };
}
