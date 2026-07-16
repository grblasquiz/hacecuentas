import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';
import { COLOMBIA_2026, fmtCOP } from '../data/colombia-2026.ts';

type Inputs = Record<string, any>;
type Outputs = Record<string, any>;

const n = (value: any, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const positive = (value: any, label: string) => {
  const parsed = n(value, NaN);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`Ingresa ${label}`);
  return parsed;
};
const pct = (value: number, digits = 1) => `${value.toFixed(digits).replace('.', ',')}%`;
const payment = (principal: number, annualRatePct: number, months: number) => {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  return r === 0 ? principal / months : principal * r * (1 + r) ** months / ((1 + r) ** months - 1);
};
const insight = (title: string, text: string, tone: 'good' | 'warn' | 'neutral', icon: string) => ({
  title, text, tone, icon,
});
const doughnut = (slices: Array<{ label: string; value: number }>, centerValue: string, centerLabel: string, prefix = '$ ') => ({
  type: 'doughnut',
  slices: slices.filter((slice) => Number.isFinite(slice.value) && slice.value > 0).map((slice) => ({ ...slice, value: Math.round(slice.value) })),
  centerValue,
  centerLabel,
  prefix,
  ariaLabel: `${centerLabel}: ${centerValue}. ${slices.map((slice) => `${slice.label}: ${Math.round(slice.value)}`).join(', ')}.`,
});

export const engines: Record<string, (i: Inputs) => Outputs> = {
  'paneles-solares-ahorro-cfe-mexico': (i) => {
    const consumo = positive(i.consumoKwhMes, 'tu consumo mensual en kWh');
    const recibo = positive(i.reciboMensual, 'el importe mensual del recibo CFE');
    const potencia = positive(i.potenciaSistemaKw, 'la potencia del sistema');
    const costo = positive(i.costoInstalacion, 'el costo instalado');
    const rendimiento = positive(i.generacionAnualPorKw, 'la generación anual estimada por kW');
    const cargoFijo = Math.max(0, n(i.cargoFijoMensual, 120));
    const generacion = potencia * rendimiento;
    const consumoAnual = consumo * 12;
    const energiaCompensable = Math.min(generacion, consumoAnual);
    const costoVariableAnual = Math.max(0, (recibo - cargoFijo) * 12);
    const ahorro = costoVariableAnual * Math.min(1, energiaCompensable / consumoAnual);
    const payback = ahorro > 0 ? costo / ahorro : 0;
    const cobertura = generacion / consumoAnual * 100;
    return {
      generacionAnual: `${Math.round(generacion).toLocaleString('es-MX')} kWh/año`,
      ahorroAnual: fmtMXN(ahorro),
      coberturaConsumo: pct(cobertura, 0),
      recuperacion: payback ? `${payback.toFixed(1).replace('.', ',')} años` : 'No recuperable con estos datos',
      _insight: insight('Ahorro solar estimado', `El sistema cubriría cerca del **${pct(cobertura, 0)}** de tu consumo anual y ahorraría **${fmtMXN(ahorro)} al año**. La inversión se recuperaría en aproximadamente **${payback.toFixed(1).replace('.', ',')} años**.`, payback <= 8 ? 'good' : payback <= 12 ? 'neutral' : 'warn', '☀️'),
      _chart: doughnut([{ label: 'Ahorro anual', value: ahorro }, { label: 'Pago CFE restante', value: Math.max(0, recibo * 12 - ahorro) }], fmtMXN(recibo * 12), 'Costo eléctrico anual'),
    };
  },

  'impuestos-importacion-compras-internet-mexico': (i) => {
    const compraUsd = positive(i.valorCompraUsd, 'el valor de la compra');
    const envioUsd = Math.max(0, n(i.envioSeguroUsd));
    const tipoCambio = positive(i.tipoCambio, 'el tipo de cambio');
    const tasaPreset = String(i.regimen || 'general-33.5');
    const tasa = tasaPreset === 'tmec-19' ? 19 : tasaPreset === 'personalizada' ? Math.max(0, n(i.tasaPersonalizada)) : 33.5;
    const manejo = Math.max(0, n(i.manejoCourierMxn));
    const base = (compraUsd + envioUsd) * tipoCambio;
    const impuesto = base * tasa / 100;
    const total = base + impuesto + manejo;
    return {
      valorAduana: fmtMXN(base),
      impuestosEstimados: `${fmtMXN(impuesto)} (${pct(tasa)})`,
      costoTotal: fmtMXN(total),
      sobrecosto: pct((total / (compraUsd * tipoCambio) - 1) * 100),
      _insight: insight('Costo puesto en México', `Una compra de **USD ${compraUsd.toLocaleString('es-MX')}** terminaría costando cerca de **${fmtMXN(total)}**, incluyendo **${fmtMXN(impuesto)}** de tasa global estimada y **${fmtMXN(manejo)}** de manejo.`, tasa >= 30 ? 'warn' : 'neutral', '📦'),
      _chart: doughnut([{ label: 'Compra y envío', value: base }, { label: 'Impuestos', value: impuesto }, { label: 'Manejo courier', value: manejo }], fmtMXN(total), 'Total importado'),
    };
  },

  'credito-fovissste-mexico-2026': (i) => {
    const valor = positive(i.valorVivienda, 'el valor de la vivienda');
    const subcuenta = Math.max(0, n(i.saldoSubcuenta));
    const credito = Math.max(0, Math.min(n(i.montoCredito, valor - subcuenta), valor - subcuenta));
    const tasa = positive(i.tasaAnual, 'la tasa anual');
    const meses = positive(i.plazoAnios, 'el plazo') * 12;
    const cuota = payment(credito, tasa, meses);
    const total = cuota * meses;
    const faltante = Math.max(0, valor - subcuenta - credito);
    return {
      montoFinanciado: fmtMXN(credito),
      cuotaMensual: fmtMXN(cuota),
      recursosPropios: fmtMXN(faltante),
      costoFinanciero: fmtMXN(Math.max(0, total - credito)),
      _insight: insight('Escenario FOVISSSTE', `Con **${fmtMXN(subcuenta)}** de subcuenta y un crédito de **${fmtMXN(credito)}**, la cuota estimada es **${fmtMXN(cuota)} al mes** durante ${Math.round(meses / 12)} años. Necesitarías **${fmtMXN(faltante)}** adicionales para completar el precio.`, faltante === 0 ? 'good' : 'warn', '🏠'),
      _chart: doughnut([{ label: 'Subcuenta', value: subcuenta }, { label: 'Crédito', value: credito }, { label: 'Recursos propios', value: faltante }], fmtMXN(valor), 'Valor de vivienda'),
    };
  },

  'gastos-escrituracion-isai-mexico-2026': (i) => {
    const valor = positive(i.valorInmueble, 'el valor del inmueble');
    const isai = valor * Math.max(0, n(i.tasaIsai, 3.5)) / 100;
    const notaria = valor * Math.max(0, n(i.tasaNotaria, 1.2)) / 100;
    const registro = valor * Math.max(0, n(i.tasaRegistro, 0.6)) / 100;
    const extras = Math.max(0, n(i.avaluoGestoria));
    const total = isai + notaria + registro + extras;
    return {
      isaiEstimado: fmtMXN(isai),
      escrituracionTotal: fmtMXN(total),
      porcentajePrecio: pct(total / valor * 100),
      dineroInicial: fmtMXN(valor + total),
      _insight: insight('Presupuesto de escrituración', `Además del precio, reserva aproximadamente **${fmtMXN(total)} (${pct(total / valor * 100)})** para ISAI, notaría, registro, avalúo y gestoría. Confirma las tasas con la notaría y tesorería local.`, 'neutral', '📝'),
      _chart: doughnut([{ label: 'ISAI', value: isai }, { label: 'Notaría', value: notaria }, { label: 'Registro', value: registro }, { label: 'Avalúo y gestoría', value: extras }], fmtMXN(total), 'Gastos de cierre'),
    };
  },

  'isan-auto-nuevo-mexico-2026': (i) => {
    const precio = positive(i.precioAutoSinIva, 'el precio del auto sin IVA');
    const tramos = [
      [383940.35, 0, 0.02, 0.01],
      [460728.35, 7678.67, 0.05, 383940.36],
      [537516.64, 11518.25, 0.10, 460728.36],
      [691092.34, 19197.04, 0.15, 537516.65],
      [Infinity, 42233.35, 0.17, 691092.35],
    ] as const;
    let impuesto = 0;
    const tramo = tramos.find(([limite]) => precio <= limite) || tramos[tramos.length - 1];
    impuesto = tramo[1] + Math.max(0, precio - tramo[3]) * tramo[2];
    if (precio > 1060189.93) impuesto = Math.max(0, impuesto - (precio - 1060189.93) * 0.07);
    let beneficio = 'Sin exención';
    if (precio <= 356934.05) { impuesto = 0; beneficio = 'Exento al 100%'; }
    else if (precio <= 452116.48) { impuesto *= 0.5; beneficio = 'Reducción del 50%'; }
    return {
      isanPagar: fmtMXN(impuesto),
      beneficioAplicado: beneficio,
      tasaEfectiva: pct(impuesto / precio * 100, 2),
      precioConIsan: fmtMXN(precio + impuesto),
      _insight: insight('ISAN 2026', `Para un precio sin IVA de **${fmtMXN(precio)}**, el ISAN estimado es **${fmtMXN(impuesto)}**. Resultado: **${beneficio}** según los umbrales publicados para 2026.`, impuesto === 0 ? 'good' : 'neutral', '🚗'),
    };
  },

  'credito-hipotecario-bancario-mexico-2026': (i) => {
    const valor = positive(i.valorVivienda, 'el valor de la vivienda');
    const enganche = Math.max(0, n(i.enganche));
    const credito = Math.max(0, valor - enganche);
    const tasa = positive(i.tasaAnual, 'la tasa anual');
    const meses = positive(i.plazoAnios, 'el plazo') * 12;
    const seguros = Math.max(0, n(i.segurosMensuales));
    const cuotaCapital = payment(credito, tasa, meses);
    const mensual = cuotaCapital + seguros;
    const apertura = credito * Math.max(0, n(i.comisionAperturaPct)) / 100;
    const gastos = Math.max(0, n(i.gastosIniciales));
    return {
      montoCredito: fmtMXN(credito),
      mensualidadTotal: fmtMXN(mensual),
      desembolsoInicial: fmtMXN(enganche + apertura + gastos),
      interesesTotales: fmtMXN(Math.max(0, cuotaCapital * meses - credito)),
      _insight: insight('Hipoteca bancaria', `Financiar **${fmtMXN(credito)}** genera una mensualidad estimada de **${fmtMXN(mensual)}**, incluidos seguros. Para firmar necesitarías alrededor de **${fmtMXN(enganche + apertura + gastos)}** entre enganche y gastos iniciales.`, mensual <= n(i.ingresoMensual) * 0.35 ? 'good' : 'warn', '🏦'),
      _chart: doughnut([{ label: 'Enganche', value: enganche }, { label: 'Crédito', value: credito }], fmtMXN(valor), 'Valor de vivienda'),
    };
  },

  'comisiones-pasarelas-pago-mexico-2026': (i) => {
    const ticket = positive(i.ticketPromedio, 'el ticket promedio');
    const operaciones = positive(i.operacionesMes, 'las operaciones mensuales');
    const proveedor = String(i.proveedor || 'clip');
    const volumen = ticket * operaciones;
    const tarifas: Record<string, { rate: number; fixed: number; label: string }> = {
      clip: { rate: 3.6, fixed: 0, label: 'Clip' },
      'mercado-pago-inmediato': { rate: 3.49, fixed: 4, label: 'Mercado Pago inmediato' },
      'mercado-pago-30': { rate: 2.95, fixed: 4, label: 'Mercado Pago a 30 días' },
      paypal: { rate: 3.95, fixed: 4, label: 'PayPal' },
      personalizada: { rate: Math.max(0, n(i.tasaPersonalizada)), fixed: Math.max(0, n(i.fijoPersonalizado)), label: 'Tarifa personalizada' },
    };
    const tarifa = tarifas[proveedor] || tarifas.clip;
    const comisionBase = volumen * tarifa.rate / 100 + operaciones * tarifa.fixed;
    const iva = comisionBase * MEXICO_2026.iva.general;
    const total = comisionBase + iva;
    return {
      ventasMensuales: fmtMXN(volumen),
      comisionConIva: fmtMXN(total),
      netoRecibido: fmtMXN(volumen - total),
      costoEfectivo: pct(total / volumen * 100, 2),
      _insight: insight(tarifa.label, `Sobre ventas mensuales de **${fmtMXN(volumen)}**, la pasarela descontaría cerca de **${fmtMXN(total)} con IVA** y recibirías **${fmtMXN(volumen - total)}**.`, 'neutral', '💳'),
      _chart: doughnut([{ label: 'Neto recibido', value: volumen - total }, { label: 'Comisión + IVA', value: total }], fmtMXN(volumen), 'Ventas procesadas'),
    };
  },

  'fondo-ahorro-vales-despensa-mexico-2026': (i) => {
    const salario = positive(i.salarioMensual, 'el salario mensual');
    const fondoTrabajador = salario * Math.max(0, n(i.fondoTrabajadorPct)) / 100;
    const fondoPatron = salario * Math.max(0, n(i.fondoPatronPct)) / 100;
    const vales = Math.max(0, n(i.valesMensuales));
    const limiteVales = MEXICO_2026.uma.diaria * 0.4 * 30.4;
    const valesExentosSbc = Math.min(vales, limiteVales);
    const valesIntegrables = Math.max(0, vales - limiteVales);
    const fondoCumpleIgualdad = Math.abs(fondoTrabajador - fondoPatron) < 1;
    return {
      ahorroMensualTotal: fmtMXN(fondoTrabajador + fondoPatron),
      aportacionPatron: fmtMXN(fondoPatron),
      valesReferenciaExentos: fmtMXN(valesExentosSbc),
      excedenteIntegrableSbc: fmtMXN(valesIntegrables),
      _insight: insight('Prestaciones de previsión social', `El fondo acumularía **${fmtMXN(fondoTrabajador + fondoPatron)} al mes**. De los vales, **${fmtMXN(valesExentosSbc)}** quedan dentro del límite de referencia del 40% y **${fmtMXN(valesIntegrables)}** lo exceden.${fondoCumpleIgualdad ? ' Las aportaciones al fondo son iguales.' : ' Ojo: las aportaciones al fondo no son iguales y deben revisarse.'}`, fondoCumpleIgualdad && valesIntegrables === 0 ? 'good' : 'warn', '🎁'),
      _chart: doughnut([{ label: 'Ahorro trabajador', value: fondoTrabajador }, { label: 'Ahorro patrón', value: fondoPatron }, { label: 'Vales', value: vales }], fmtMXN(fondoTrabajador + fondoPatron + vales), 'Beneficio mensual'),
    };
  },

  'cambio-propietario-refrendo-vehicular-mexico-2026': (i) => {
    const cambio = Math.max(0, n(i.costoCambioPropietario, 433));
    const refrendo = Math.max(0, n(i.refrendoAnual, 760));
    const tenencia = Math.max(0, n(i.tenenciaPendiente));
    const multas = Math.max(0, n(i.multasAdeudos));
    const gestoria = Math.max(0, n(i.gestoria));
    const total = cambio + refrendo + tenencia + multas + gestoria;
    return {
      derechosTramite: fmtMXN(cambio + refrendo),
      adeudos: fmtMXN(tenencia + multas),
      totalPagar: fmtMXN(total),
      costoSinAdeudos: fmtMXN(cambio + refrendo + gestoria),
      _insight: insight('Cambio de propietario y refrendo', `El trámite completo costaría **${fmtMXN(total)}** con los valores ingresados. Los derechos y refrendo suman **${fmtMXN(cambio + refrendo)}**; los adeudos agregan **${fmtMXN(tenencia + multas)}**.`, tenencia + multas > 0 ? 'warn' : 'good', '🚘'),
      _chart: doughnut([{ label: 'Cambio de propietario', value: cambio }, { label: 'Refrendo', value: refrendo }, { label: 'Tenencia y multas', value: tenencia + multas }, { label: 'Gestoría', value: gestoria }], fmtMXN(total), 'Total del trámite'),
    };
  },

  'importacion-auto-estados-unidos-mexico-2026': (i) => {
    const valorUsd = positive(i.valorVehiculoUsd, 'el valor del vehículo');
    const tipoCambio = positive(i.tipoCambio, 'el tipo de cambio');
    const valor = valorUsd * tipoCambio;
    const igiRate = Math.max(0, n(i.igiPct, 10));
    const igi = valor * igiRate / 100;
    const dta = valor * Math.max(0, n(i.dtaPct, 0.8)) / 100;
    const iva = (valor + igi + dta) * MEXICO_2026.iva.general;
    const isan = Math.max(0, n(i.isanEstimado));
    const agente = Math.max(0, n(i.agenteTraslado));
    const impuestos = igi + dta + iva + isan;
    const total = valor + impuestos + agente;
    return {
      valorVehiculoMxn: fmtMXN(valor),
      impuestosAduanales: fmtMXN(impuestos),
      costoImportado: fmtMXN(total),
      sobrecosto: pct((total / valor - 1) * 100),
      _insight: insight('Importación definitiva normal', `El vehículo de **USD ${valorUsd.toLocaleString('es-MX')}** tendría un costo puesto en México cercano a **${fmtMXN(total)}**. Impuestos y derechos suman **${fmtMXN(impuestos)}**, antes de placas y adecuaciones.`, 'warn', '🚙'),
      _chart: doughnut([{ label: 'Valor del vehículo', value: valor }, { label: 'IGI', value: igi }, { label: 'IVA', value: iva }, { label: 'DTA e ISAN', value: dta + isan }, { label: 'Agente y traslado', value: agente }], fmtMXN(total), 'Costo importado'),
    };
  },

  'presuncion-costos-ugpp-colombia-2026': (i) => {
    const ingreso = positive(i.ingresoBrutoMensual, 'el ingreso bruto mensual');
    const actividad = String(i.actividad || 'no-clasificada');
    const tasas: Record<string, number> = {
      agricultura: 66.85, mineria: 56.39, manufactura: 62.34, energia: 60.30, agua: 65.15,
      construccion: 62.89, comercio: 66.97, transporte: 63.79, alojamiento: 61.67,
      informacion: 61.17, finanzas: 60.65, inmobiliaria: 61.73, profesionales: 62.04,
      administrativos: 59.10, publica: 65.25, educacion: 67.08, salud: 63.24,
      artes: 56.92, otros: 56.33, hogares: 56.01, extraterritorial: 64.26,
      'no-clasificada': 62.53, 'rentista-capital': 28.08,
    };
    const costoPct = actividad === 'personalizada' ? Math.max(0, Math.min(100, n(i.costoPersonalizadoPct))) : (tasas[actividad] ?? 62.53);
    const ingresoNeto = ingreso * (1 - costoPct / 100);
    const ibcTeorico = ingresoNeto * 0.4;
    const obligado = ingresoNeto >= COLOMBIA_2026.smlmv;
    const ibc = obligado ? Math.min(COLOMBIA_2026.smlmv * 25, Math.max(COLOMBIA_2026.smlmv, ibcTeorico)) : 0;
    const salud = ibc * COLOMBIA_2026.independientes.salud;
    const pension = ibc * COLOMBIA_2026.independientes.pension;
    return {
      costosPresuntos: `${fmtCOP(ingreso * costoPct / 100)} (${pct(costoPct, 2)})`,
      ingresoNeto: fmtCOP(ingresoNeto),
      ibcEstimado: obligado ? fmtCOP(ibc) : 'Sin obligación por debajo de 1 SMLMV neto',
      aportesSaludPension: fmtCOP(salud + pension),
      _insight: insight('IBC con presunción de costos', obligado ? `La actividad admite costos presuntos de **${pct(costoPct, 2)}**. El ingreso neto queda en **${fmtCOP(ingresoNeto)}** y el IBC estimado es **${fmtCOP(ibc)}**.` : `Después de aplicar costos presuntos del **${pct(costoPct, 2)}**, el ingreso neto queda por debajo de 1 SMLMV. Revisa si corresponde aporte voluntario o si tienes otros ingresos.`, obligado ? 'neutral' : 'good', '🧾'),
      _chart: doughnut([{ label: 'Costos presuntos', value: ingreso * costoPct / 100 }, { label: 'Ingreso neto', value: ingresoNeto }], fmtCOP(ingreso), 'Ingreso bruto'),
    };
  },

  'digito-verificacion-nit-dian-colombia': (i) => {
    const raw = String(i.nit || '').replace(/\D/g, '');
    if (!raw) throw new Error('Ingresa el NIT sin dígito de verificación');
    const base = raw.length > 1 && String(i.incluyeDv || 'no') === 'si' ? raw.slice(0, -1) : raw;
    const supplied = raw.length > 1 && String(i.incluyeDv || 'no') === 'si' ? Number(raw.slice(-1)) : null;
    const weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
    const padded = base.padStart(15, '0').slice(-15);
    const sum = padded.split('').reduce((acc, digit, idx) => acc + Number(digit) * weights[idx], 0);
    const mod = sum % 11;
    const dv = mod === 0 || mod === 1 ? mod : 11 - mod;
    const valido = supplied === null ? 'No se validó un DV ingresado' : supplied === dv ? 'Válido' : `No válido: ingresaste ${supplied}`;
    return {
      digitoVerificacion: String(dv),
      nitCompleto: `${base}-${dv}`,
      validacion: valido,
      procedimiento: `Suma ponderada ${sum}; residuo módulo 11 = ${mod}.`,
      _insight: insight('Dígito de verificación DIAN', `El NIT completo es **${base}-${dv}**.${supplied === null ? '' : supplied === dv ? ' El dígito ingresado coincide.' : ` El dígito ingresado no coincide: debería ser ${dv}.`}`, supplied === null || supplied === dv ? 'good' : 'warn', '🔢'),
    };
  },

  'beps-colpensiones-colombia-2026': (i) => {
    const saldo = Math.max(0, n(i.saldoActual));
    const ahorroMensual = positive(i.ahorroMensual, 'el ahorro mensual');
    const anios = positive(i.aniosAhorro, 'los años de ahorro');
    const tasa = Math.max(0, n(i.rentabilidadAnualPct, 4)) / 100;
    const meses = anios * 12;
    const r = tasa / 12;
    const ahorroFuturo = r === 0 ? ahorroMensual * meses : ahorroMensual * ((1 + r) ** meses - 1) / r;
    const saldoFuturo = saldo * (1 + r) ** meses + ahorroFuturo;
    const incentivo = saldoFuturo * 0.20;
    const total = saldoFuturo + incentivo;
    const horizonte = positive(i.aniosPagoEstimado, 'los años estimados de pago') * 6;
    const ingresoBimestral = total / horizonte;
    return {
      ahorroProyectado: fmtCOP(saldoFuturo),
      incentivoEstimado: fmtCOP(incentivo),
      capitalConIncentivo: fmtCOP(total),
      ingresoBimestralAprox: fmtCOP(ingresoBimestral),
      _insight: insight('Proyección BEPS', `Al mantener el ahorro, acumularías cerca de **${fmtCOP(saldoFuturo)}**. Con incentivo estatal estimado del 20%, el capital sería **${fmtCOP(total)}**, equivalente de forma simplificada a **${fmtCOP(ingresoBimestral)} bimestrales**.`, 'good', '👵'),
      _chart: doughnut([{ label: 'Ahorro propio proyectado', value: saldoFuturo }, { label: 'Incentivo 20%', value: incentivo }], fmtCOP(total), 'Capital estimado'),
    };
  },

  'indemnizacion-sustitutiva-colpensiones-colombia-2026': (i) => {
    const iblMensual = positive(i.ingresoBasePromedioMensual, 'el ingreso base promedio');
    const semanas = positive(i.semanasCotizadas, 'las semanas cotizadas');
    const ppc = positive(i.porcentajePromedioCotizacion, 'el porcentaje promedio de cotización') / 100;
    const sbcSemanal = iblMensual * 12 / 52;
    const indemnizacion = sbcSemanal * semanas * ppc;
    return {
      salarioBaseSemanal: fmtCOP(sbcSemanal),
      porcentajeAplicado: pct(ppc * 100, 2),
      indemnizacionEstimada: fmtCOP(indemnizacion),
      equivalenteAportes: `${(indemnizacion / iblMensual).toFixed(1).replace('.', ',')} meses de IBL`,
      _insight: insight('Indemnización sustitutiva estimada', `Aplicando la fórmula reglamentaria a **${semanas.toLocaleString('es-CO')} semanas**, un IBL mensual de **${fmtCOP(iblMensual)}** y PPC de **${pct(ppc * 100, 2)}**, el resultado aproximado es **${fmtCOP(indemnizacion)}**.`, 'neutral', '📄'),
    };
  },

  'nomina-vs-prestacion-servicios-colombia-2026': (i) => {
    const salario = positive(i.salarioMensual, 'el salario mensual de nómina');
    const auxilio = String(i.incluyeAuxilio || 'si') === 'si' && salario < COLOMBIA_2026.smlmv * 2 ? COLOMBIA_2026.auxilioTransporte : 0;
    const exonerado = String(i.empleadorExonerado || 'si') === 'si';
    const arl = Math.max(0, n(i.arlPct, 0.522)) / 100;
    const basePrestaciones = salario + auxilio;
    const prestaciones = basePrestaciones / 12 * 2 + salario / 24 + basePrestaciones / 12 * 0.12;
    const aportesPatron = salario * (COLOMBIA_2026.aportes.pensionEmpleador + arl + COLOMBIA_2026.aportes.parafiscales.cajaCompensacion +
      (exonerado ? 0 : COLOMBIA_2026.aportes.saludEmpleador + COLOMBIA_2026.aportes.parafiscales.icbf + COLOMBIA_2026.aportes.parafiscales.sena));
    const costoNomina = salario + auxilio + prestaciones + aportesPatron;
    const netoEmpleado = salario * (1 - COLOMBIA_2026.aportes.saludEmpleado - COLOMBIA_2026.aportes.pensionEmpleado) + auxilio;
    const rateInd = 0.4 * (COLOMBIA_2026.independientes.salud + COLOMBIA_2026.independientes.pension + arl);
    const honorarioNetoEquivalente = netoEmpleado / Math.max(0.01, 1 - rateInd);
    const honorarioCostoEquivalente = costoNomina;
    return {
      costoMensualNomina: fmtCOP(costoNomina),
      netoEmpleado: fmtCOP(netoEmpleado),
      honorarioMismoNeto: fmtCOP(honorarioNetoEquivalente),
      honorarioMismoCostoEmpresa: fmtCOP(honorarioCostoEquivalente),
      _insight: insight('Nómina vs servicios', `Un salario de **${fmtCOP(salario)}** cuesta a la empresa aproximadamente **${fmtCOP(costoNomina)} al mes**. Para que un contratista conserve un neto parecido debería facturar al menos **${fmtCOP(honorarioNetoEquivalente)}**, antes de reservar vacaciones y periodos sin contrato.`, 'neutral', '⚖️'),
      _chart: doughnut([{ label: 'Salario y auxilio', value: salario + auxilio }, { label: 'Prestaciones provisionadas', value: prestaciones }, { label: 'Aportes patronales', value: aportesPatron }], fmtCOP(costoNomina), 'Costo de nómina'),
    };
  },

  'costo-vender-online-colombia-2026': (i) => {
    const precio = positive(i.precioVenta, 'el precio de venta');
    const costoProducto = Math.max(0, n(i.costoProducto));
    const envio = Math.max(0, n(i.envioEmpaque));
    const canal = String(i.canal || 'mercado-libre');
    let fee = 0;
    let label = '';
    if (canal === 'mercado-libre') {
      fee = precio * Math.max(0, n(i.comisionMarketplacePct, 14)) / 100;
      label = 'Mercado Libre';
    } else {
      const provider = String(i.pasarela || 'wompi');
      if (provider === 'wompi') { fee = (precio * 0.0265 + 700) * 1.19; label = 'Wompi'; }
      else if (provider === 'mercado-pago-7') { fee = precio * 0.0299 * 1.19; label = 'Mercado Pago 7 días'; }
      else { fee = precio * Math.max(0, n(i.tasaPersonalizadaPct)) / 100 + Math.max(0, n(i.fijoPersonalizado)); label = 'Pasarela personalizada'; }
    }
    const utilidad = precio - costoProducto - envio - fee;
    return {
      comisionCanal: fmtCOP(fee),
      utilidadNeta: fmtCOP(utilidad),
      margenNeto: pct(utilidad / precio * 100),
      precioEquilibrio: fmtCOP(costoProducto + envio + fee),
      _insight: insight(label, `Después de producto, envío y comisiones, la venta deja **${fmtCOP(utilidad)}**, un margen de **${pct(utilidad / precio * 100)}**.`, utilidad > 0 ? 'good' : 'warn', '🛒'),
      _chart: doughnut([{ label: 'Costo producto', value: costoProducto }, { label: 'Envío y empaque', value: envio }, { label: 'Comisión', value: fee }, { label: 'Utilidad', value: Math.max(0, utilidad) }], fmtCOP(precio), 'Precio de venta'),
    };
  },

  'peajes-combustible-ruta-colombia-2026': (i) => {
    const distancia = positive(i.distanciaKm, 'la distancia de la ruta');
    const rendimiento = positive(i.rendimientoKmGalon, 'el rendimiento del vehículo');
    const combustible = positive(i.precioGalon, 'el precio por galón');
    const peajes = Math.max(0, n(i.totalPeajes));
    const trayectos = String(i.tipoViaje || 'ida-vuelta') === 'ida-vuelta' ? 2 : 1;
    const km = distancia * trayectos;
    const galones = km / rendimiento;
    const gasolina = galones * combustible;
    const peajesTotal = peajes * trayectos;
    const total = gasolina + peajesTotal;
    return {
      distanciaTotal: `${Math.round(km).toLocaleString('es-CO')} km`,
      combustibleEstimado: `${galones.toFixed(1).replace('.', ',')} gal — ${fmtCOP(gasolina)}`,
      peajesTotales: fmtCOP(peajesTotal),
      costoRuta: fmtCOP(total),
      _insight: insight('Costo total de carretera', `La ruta requiere cerca de **${galones.toFixed(1).replace('.', ',')} galones** y cuesta **${fmtCOP(total)}** entre combustible y peajes.`, 'neutral', '🛣️'),
      _chart: doughnut([{ label: 'Combustible', value: gasolina }, { label: 'Peajes', value: peajesTotal }], fmtCOP(total), 'Costo del viaje'),
    };
  },

  'traspaso-vehiculo-colombia-2026': (i) => {
    const avaluo = positive(i.avaluoVehiculo, 'el avalúo comercial');
    const tipo = String(i.tipoVehiculo || 'carro');
    const tarifaBase = tipo === 'moto' ? 145500 : 260400;
    const retencion = avaluo * 0.01;
    const extras = Math.max(0, n(i.otrosCostos));
    const total = tarifaBase + retencion + extras;
    const quien = String(i.quienPagaRetencion || 'vendedor');
    const comprador = tarifaBase + extras + (quien === 'comprador' ? retencion : quien === 'mitades' ? retencion / 2 : 0);
    const vendedor = total - comprador;
    return {
      tarifaTramite: fmtCOP(tarifaBase),
      retencionUnoPct: fmtCOP(retencion),
      totalTraspaso: fmtCOP(total),
      reparto: `Comprador ${fmtCOP(comprador)} · vendedor ${fmtCOP(vendedor)}`,
      _insight: insight('Traspaso vehicular 2026', `El traspaso suma **${fmtCOP(total)}**: **${fmtCOP(tarifaBase)}** de tarifa base, **${fmtCOP(retencion)}** de retención del 1% y **${fmtCOP(extras)}** de otros costos.`, 'neutral', '🚗'),
      _chart: doughnut([{ label: 'Tarifa base', value: tarifaBase }, { label: 'Retención 1%', value: retencion }, { label: 'Otros costos', value: extras }], fmtCOP(total), 'Total traspaso'),
    };
  },

  'pico-placa-solidario-bogota-2026': (i) => {
    const periodo = String(i.periodo || 'mes');
    const bases: Record<string, number> = { dia: 70294, mes: 561808, semestre: 2809311 };
    const base = bases[periodo] || bases.mes;
    const municipio = String(i.matricula || 'bogota') === 'fuera' ? 1.5 : 1;
    const factorAvaluo = Math.max(0.1, n(i.factorAvaluo, 1));
    const factorAmbiental = Math.max(0.1, n(i.factorAmbiental, 1));
    const total = base * municipio * factorAvaluo * factorAmbiental;
    const diasUso = positive(i.diasUsoPeriodo, periodo === 'dia' ? '1 día de uso' : 'los días de uso previstos');
    return {
      tarifaBase: fmtCOP(base),
      multiplicadorTotal: `${(municipio * factorAvaluo * factorAmbiental).toFixed(2).replace('.', ',')}×`,
      permisoEstimado: fmtCOP(total),
      costoPorDiaUso: fmtCOP(total / diasUso),
      _insight: insight('Pico y Placa Solidario', `El permiso parte de **${fmtCOP(base)}** y, con los factores ingresados, queda en **${fmtCOP(total)}**. Si lo usas ${Math.round(diasUso)} días, equivale a **${fmtCOP(total / diasUso)} por día**.`, municipio > 1 ? 'warn' : 'neutral', '🚦'),
    };
  },

  'recibo-agua-bogota-eaab-2026': (i) => {
    const consumo = positive(i.consumoM3Bimestre, 'el consumo bimestral');
    const fijoAgua = Math.max(0, n(i.cargoFijoAgua, 20000));
    const fijoAlc = Math.max(0, n(i.cargoFijoAlcantarillado, 12000));
    const tarifaAgua = Math.max(0, n(i.tarifaAguaM3, 3420.84));
    const tarifaAlc = Math.max(0, n(i.tarifaAlcantarilladoM3, 3800));
    const factor = n(i.factorSubsidioContribucionPct, 0) / 100;
    const subtotal = fijoAgua + fijoAlc + consumo * (tarifaAgua + tarifaAlc);
    const ajuste = subtotal * factor;
    const total = subtotal + ajuste;
    return {
      cargoFijoTotal: fmtCOP(fijoAgua + fijoAlc),
      consumoFacturado: fmtCOP(consumo * (tarifaAgua + tarifaAlc)),
      subsidioContribucion: `${ajuste >= 0 ? '+' : '-'}${fmtCOP(Math.abs(ajuste))}`,
      totalEstimado: fmtCOP(total),
      _insight: insight('Factura EAAB estimada', `Con **${consumo.toFixed(1).replace('.', ',')} m³** bimestrales, la factura sería aproximadamente **${fmtCOP(total)}**, usando los cargos y el factor de estrato ingresados.`, consumo > 22 ? 'warn' : 'neutral', '🚰'),
      _chart: doughnut([{ label: 'Cargos fijos', value: fijoAgua + fijoAlc }, { label: 'Consumo', value: consumo * (tarifaAgua + tarifaAlc) }, { label: ajuste >= 0 ? 'Contribución' : 'Subsidio', value: Math.abs(ajuste) }], fmtCOP(total), 'Factura estimada'),
    };
  },

  'millas-lifemiles-avianca-colombia-2026': (i) => {
    const cash = positive(i.precioCashCop, 'el precio del pasaje en efectivo');
    const millas = positive(i.millasRequeridas, 'las millas requeridas');
    const tasas = Math.max(0, n(i.tasasCop));
    const valorNeto = cash - tasas;
    const valorMilla = valorNeto / millas;
    const valorMil = valorMilla * 1000;
    const saldo = Math.max(0, n(i.saldoMillas));
    const faltantes = Math.max(0, millas - saldo);
    const umbral = Math.max(0, n(i.valorReferenciaMilCop, 50000));
    return {
      valorPorMilMillas: fmtCOP(valorMil),
      ahorroNetoCanje: fmtCOP(Math.max(0, valorNeto)),
      millasFaltantes: Math.round(faltantes).toLocaleString('es-CO'),
      decision: valorMil >= umbral ? 'Conviene usar millas frente a tu referencia' : 'Conviene pagar en efectivo o buscar otro canje',
      _insight: insight('Valor de este canje LifeMiles', `Cada 1.000 millas rinde **${fmtCOP(valorMil)}** después de tasas. Frente a tu referencia de **${fmtCOP(umbral)}**, ${valorMil >= umbral ? 'el canje resulta atractivo' : 'conviene comparar con pago en efectivo'}.`, valorMil >= umbral ? 'good' : 'warn', '✈️'),
      _chart: doughnut([{ label: 'Ahorro cubierto por millas', value: Math.max(0, valorNeto) }, { label: 'Tasas pagadas en efectivo', value: tasas }], fmtCOP(cash), 'Precio cash comparable'),
    };
  },
};
