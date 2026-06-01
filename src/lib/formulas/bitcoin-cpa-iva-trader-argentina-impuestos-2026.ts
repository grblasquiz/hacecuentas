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
  _chart?: any;
  _insight?: any;
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

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Ganancias (15%)', value: Math.round(impuestoGanancias) },
      { label: 'IVA estimado', value: Math.round(ivaEstimado) },
      { label: 'Bienes Personales', value: Math.round(bienesPersonales) },
      { label: 'Percepción AFIP (a cuenta)', value: Math.round(percepcionAFIP) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(cargaFiscalTotal).toLocaleString('es-AR'),
    centerLabel: 'Carga fiscal total',
    ariaLabel: 'Composición de la carga fiscal del trader: Ganancias, IVA, Bienes Personales y percepción AFIP',
  };

  const insight = (() => {
    if (utilidadNeta <= 0) {
      return {
        title: 'Operación sin Ganancias a pagar',
        text: `La operación cerró con quebranto o resultado neutro, así que **no pagás Ganancias**.${percepcionAFIP > 0 ? ` Igual te retuvieron **$${Math.round(percepcionAFIP).toLocaleString('es-AR')}** de percepción AFIP, que es pago a cuenta y recuperás en la DDJJ.` : ''}`,
        tone: 'good' as 'good' | 'warn' | 'neutral',
        icon: '🪙',
      };
    }
    const cargaReal = cargaFiscalTotal - percepcionAFIP;
    return {
      title: `Tasa efectiva del ${tasaEfectiva.toFixed(1)}%`,
      text: `Sobre tu ganancia bruta, los impuestos definitivos suman **$${Math.round(cargaReal).toLocaleString('es-AR')}** (Ganancias${ivaEstimado > 0 ? ' + IVA' : ''}${bienesPersonales > 0 ? ' + Bienes Personales' : ''}).${percepcionAFIP > 0 ? ` La percepción del 99% (**$${Math.round(percepcionAFIP).toLocaleString('es-AR')}**) infla la cifra pero es pago a cuenta: la recuperás en la DDJJ.` : ''}`,
      tone: (tasaEfectiva > 30 ? 'warn' : 'neutral') as 'good' | 'warn' | 'neutral',
      icon: '🪙',
    };
  })();

  return {
    utilidadNeta,
    impuestoGanancias,
    ivaEstimado,
    bienesPersonales,
    percepcionAFIP,
    cargaFiscalTotal,
    tasaEfectiva,
    resumen,
    _chart: chart,
    _insight: insight,
  };
}
