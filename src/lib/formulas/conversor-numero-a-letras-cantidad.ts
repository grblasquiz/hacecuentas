export interface Inputs {
  numero: number;
  formato: string;
  moneda?: string;
  /** Alícuota de IVA opcional (solo formato factura/recibo): 0, 10.5, 21 o 27. */
  ivaPct?: number | string;
}

export interface Outputs {
  entero: number;
  decimal: number;
  /** Solo formato factura/recibo con IVA > 0. */
  ivaMonto?: number;
  totalConIva?: number;
  _insight?: any;
}

// Lógica pura (reglas RAE) compartida con el componente flagship — ver
// src/lib/numero-a-letras.ts. Antes vivía acá; se extrajo para no duplicarla.
import {
  MONEDAS,
  enteroALetras,
  capitalizar,
  importeEnLetras,
  splitImporte,
} from '../numero-a-letras.js';

// ---------- compute ----------

export function compute(i: Inputs): Outputs {
  const numeroRaw = Number(i.numero);
  const formato = String(i.formato || 'simple').toLowerCase();
  const moneda = MONEDAS[String(i.moneda || 'ARS').toUpperCase()] || MONEDAS.ARS;

  if (!isFinite(numeroRaw)) {
    return {
      entero: 0,
      decimal: 0,
      _insight: {
        title: 'Revisá el número',
        text: 'Ingresá un número válido para convertir a letras.',
        tone: 'warn',
        icon: '⚠️',
      },
    };
  }

  const negativo = numeroRaw < 0;
  const abs = Math.abs(numeroRaw);

  // Límite de seguridad: hasta 10^18 (trillón en escala larga).
  if (abs >= 1e18) {
    return {
      entero: 0,
      decimal: 0,
      _insight: {
        title: 'Número demasiado grande',
        text: 'Probá con un número menor a un trillón (10^18). Para cifras mayores el texto deja de ser legible.',
        tone: 'warn',
        icon: '⚠️',
      },
    };
  }

  const parteEntera = Math.floor(abs);
  // Centavos: redondear los 2 decimales para moneda/cheque.
  const centavos = Math.round((abs - parteEntera) * 100);
  // Si redondea a 100 centavos, sumamos al entero.
  let enteroFinal = parteEntera;
  let centavosFinal = centavos;
  if (centavosFinal === 100) {
    enteroFinal += 1;
    centavosFinal = 0;
  }

  // En moneda/cheque el número precede al sustantivo masculino "peso(s)", así que
  // "uno"/"veintiuno" se apocopan a "un"/"veintiún". En simple es número suelto.
  const apocope = formato === 'moneda' || formato === 'cheque';
  let letrasEntero = enteroALetras(enteroFinal, apocope);
  if (negativo) letrasEntero = 'menos ' + letrasEntero;

  // RAE: cuando la cifra termina en "millón/millones/billón…" y le sigue un
  // sustantivo, se intercala "de" (un millón DE pesos). No aplica si después
  // del millón hay más cifras (un millón doscientos mil pesos).
  const terminaEnEscala = /\b(mill(?:ón|ones)|bill(?:ón|ones)|trill(?:ón|ones))$/.test(letrasEntero);
  const conector = terminaEnEscala ? 'de ' : '';

  let textoFinal = '';
  let nota = '';
  let ivaMonto: number | undefined;
  let totalConIva: number | undefined;

  if (formato === 'moneda') {
    const unidad = enteroFinal === 1 ? moneda.singular : moneda.plural;
    const centTxt = centavosFinal.toString().padStart(2, '0');
    const centWord = centavosFinal === 1 ? moneda.centSingular : moneda.centPlural;
    textoFinal = `${capitalizar(letrasEntero)} ${conector}${unidad} con ${centavosFinal} ${centWord}`;
    nota = `Importe formateado para factura o recibo: incluye los ${centTxt} centavos en letras.`;

    // Preset factura con IVA: desglose Neto / IVA / Total, cada uno en letras.
    // Alícuotas vigentes en Argentina (Ley de IVA, ARCA): 21% general,
    // 10,5% reducida, 27% servicios públicos.
    const ivaPct = Number(i.ivaPct || 0);
    if (!negativo && ivaPct > 0 && ivaPct <= 100) {
      const neto = enteroFinal + centavosFinal / 100;
      const iva = neto * (ivaPct / 100);
      const total = neto + iva;
      const sIva = splitImporte(iva);
      const sTot = splitImporte(total);
      ivaMonto = Math.round(iva * 100) / 100;
      totalConIva = Math.round(total * 100) / 100;
      const fmt = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const pctTxt = String(ivaPct).replace('.', ',');
      textoFinal =
        `Neto: ${capitalizar(importeEnLetras(enteroFinal, centavosFinal, moneda))} (${moneda.simbolo}${fmt(neto)})\n\n` +
        `IVA ${pctTxt}%: ${capitalizar(importeEnLetras(sIva.entero, sIva.centavos, moneda))} (${moneda.simbolo}${fmt(iva)})\n\n` +
        `Total: ${capitalizar(importeEnLetras(sTot.entero, sTot.centavos, moneda))} (${moneda.simbolo}${fmt(total)})`;
      nota = `Desglose para factura: neto + IVA ${pctTxt}% = total, cada importe en letras. El IVA se calculó sobre el monto ingresado como neto gravado.`;
    }
  } else if (formato === 'contrato') {
    // Contrato formal: moneda primero, importe en letras y cifra entre paréntesis,
    // convención de escribanías y contratos ("PESOS ARGENTINOS CIEN MIL ...").
    const letrasSinApocope = negativo ? 'menos ' + enteroALetras(enteroFinal, false) : enteroALetras(enteroFinal, false);
    const centTxt = centavosFinal > 0
      ? ` con ${enteroALetras(centavosFinal, false)} ${centavosFinal === 1 ? moneda.centSingular : moneda.centPlural}`
      : '';
    const cifra = `${moneda.simbolo}${(enteroFinal + centavosFinal / 100).toLocaleString('es-AR', { minimumFractionDigits: centavosFinal > 0 ? 2 : 0, maximumFractionDigits: 2 })}`;
    textoFinal = `${moneda.plural.toUpperCase()} ${letrasSinApocope.toUpperCase()}${centTxt.toUpperCase()} (${cifra})`;
    nota = 'Formato contrato: la moneda primero, el importe en letras (los centavos también en letras) y la cifra entre paréntesis, como se usa en contratos y escrituras. Si difieren, prevalece lo escrito en letras.';
  } else if (formato === 'cheque') {
    // Cheque: TODO en mayúsculas, centavos como "NN/100".
    const unidad = enteroFinal === 1 ? moneda.singular : moneda.plural;
    const centTxt = centavosFinal.toString().padStart(2, '0');
    textoFinal = `${letrasEntero} ${conector}${unidad} CON ${centTxt}/100`.toUpperCase();
    nota = 'Formato cheque: todo en MAYÚSCULAS y los centavos como NN/100, como exige la mayoría de los bancos.';
  } else {
    // simple: solo el entero en letras.
    textoFinal = capitalizar(letrasEntero);
    nota = 'Formato simple: el número entero escrito en letras según las reglas de la RAE.';
  }

  const ejemploCifra = formato === 'cheque'
    ? `**${moneda.simbolo}${enteroFinal.toLocaleString('es-AR')}** → ${textoFinal}`
    : `**${negativo ? '-' : ''}${abs.toLocaleString('es-AR', { minimumFractionDigits: formato === 'simple' ? 0 : 2, maximumFractionDigits: formato === 'simple' ? 0 : 2 })}**`;

  return {
    entero: enteroFinal,
    decimal: centavosFinal,
    ...(ivaMonto !== undefined ? { ivaMonto, totalConIva } : {}),
    _insight: {
      title: 'El número en letras',
      text: `${ejemploCifra}\n\n## ${textoFinal}\n\n${nota}`,
      tone: 'neutral',
      icon: '✍️',
    },
  };
}
