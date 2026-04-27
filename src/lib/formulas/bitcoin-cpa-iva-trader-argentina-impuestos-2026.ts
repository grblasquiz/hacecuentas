export interface Inputs {
  precioVenta: number;
  precioCompra: number;
  gastos: number;
  condicionIVA: string;
  tenenciaAl31: number;
  alicuotaBP: string;
  compraTarjeta: number;
}

export interface Outputs {
  utilidadNeta: number;
  impuestoGanancias: number;
  ivaEstimado: number;
  bienesPersonales: number;
  percepcionAFIP: number;
  cargaFiscalTotal: number;
  tasaEfectiva: number;
  resumen: string;
}

export function compute(i: Inputs): Outputs {
  // Sanitizar inputs
  const precioVenta = Math.max(0, Number(i.precioVenta) || 0);
  const precioCompra = Math.max(0, Number(i.precioCompra) || 0);
  const gastos = Math.max(0, Number(i.gastos) || 0);
  const condicionIVA = String(i.condicionIVA || "monotributo");
  const tenenciaAl31 = Math.max(0, Number(i.tenenciaAl31) || 0);
  const alicuotaBPRaw = parseFloat(String(i.alicuotaBP)) || 0.0075;
  const compraTarjeta = Math.max(0, Number(i.compraTarjeta) || 0);

  // --- Ganancias 4ta categoria ---
  // Ley 27.430 reformada por Ley 27.743 — alicuota 15% sobre utilidad neta
  const TASA_GANANCIAS = 0.15;
  const utilidadNeta = precioVenta - precioCompra - gastos;
  const impuestoGanancias = utilidadNeta > 0 ? utilidadNeta * TASA_GANANCIAS : 0;

  // --- IVA ---
  // Solo aplica estimacion para Responsable Inscripto (RI) sobre margen de servicios
  // Monotributista: IVA incluido en cuota, no se discrimina por operacion
  // Exento/Consumidor Final: no aplica
  const TASA_IVA = 0.21;
  let ivaEstimado = 0;
  if (condicionIVA === "ri" && utilidadNeta > 0) {
    ivaEstimado = utilidadNeta * TASA_IVA;
  }

  // --- Bienes Personales ---
  // Ley 23.966 art. 22 inc. k — criptoactivos al valor de mercado al 31/12
  // Alicuotas vigentes 2026 (tramos en ARS, actualizados por RG AFIP)
  const bienesPersonales = tenenciaAl31 > 0 ? tenenciaAl31 * alicuotaBPRaw : 0;

  // --- Percepcion AFIP 99% ---
  // RG AFIP 4815/2020 y modificatorias
  // Aplica sobre compras cripto con tarjeta o transferencia en exchanges habilitados
  // Es pago a cuenta de Ganancias o Bienes Personales (se recupera en DDJJ)
  const TASA_PERCEPCION = 0.99;
  const percepcionAFIP = compraTarjeta > 0 ? compraTarjeta * TASA_PERCEPCION : 0;

  // --- Carga fiscal total estimada ---
  // Nota: percepcion es pago a cuenta, se incluye para mostrar el impacto de liquidez
  const cargaFiscalTotal = impuestoGanancias + ivaEstimado + bienesPersonales + percepcionAFIP;

  // --- Tasa efectiva sobre utilidad bruta (venta - compra, sin descontar gastos) ---
  const utilidadBruta = precioVenta - precioCompra;
  const tasaEfectiva = utilidadBruta > 0 ? (cargaFiscalTotal / utilidadBruta) * 100 : 0;

  // --- Resumen textual ---
  const condicionLabel =
    condicionIVA === "ri"
      ? "Responsable Inscripto"
      : condicionIVA === "monotributo"
      ? "Monotributista"
      : "Exento/Consumidor Final";

  const lines: string[] = [];

  if (utilidadNeta <= 0) {
    lines.push("Operacion con quebranto o resultado neutro: no hay Ganancias a pagar.");
  } else {
    lines.push(
      `Utilidad neta gravada: $${utilidadNeta.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`
    );
    lines.push(
      `Ganancias 4ta cat. (15%): $${impuestoGanancias.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`
    );
  }

  if (ivaEstimado > 0) {
    lines.push(
      `IVA estimado RI (21% sobre margen): $${ivaEstimado.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`
    );
  } else if (condicionIVA === "monotributo") {
    lines.push("IVA: incluido en cuota monotributo, no aplica por operacion.");
  }

  if (bienesPersonales > 0) {
    lines.push(
      `Bienes Personales (${(alicuotaBPRaw * 100).toFixed(2)}% sobre $${tenenciaAl31.toLocaleString("es-AR")}): $${bienesPersonales.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`
    );
  }

  if (percepcionAFIP > 0) {
    lines.push(
      `Percepcion AFIP 99% (pago a cuenta): $${percepcionAFIP.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARS`
    );
  }

  lines.push(`Condicion IVA: ${condicionLabel}`);
  lines.push(
    `Tasa efectiva sobre utilidad bruta: ${tasaEfectiva.toFixed(2)}%`
  );
  lines.push(
    "ATENCION: La percepcion del 99% es pago a cuenta y se recupera en la DDJJ anual. Consulta a un contador matriculado antes de presentar."
  );

  const resumen = lines.join(" | ");

  return {
    utilidadNeta,
    impuestoGanancias,
    ivaEstimado,
    bienesPersonales,
    percepcionAFIP,
    cargaFiscalTotal,
    tasaEfectiva,
    resumen,
  };
}
