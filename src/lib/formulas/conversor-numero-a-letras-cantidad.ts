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

const MONEDAS: Record<string, {
  singular: string;
  plural: string;
  centSingular: string;
  centPlural: string;
  simbolo: string;
}> = {
  ARS: { singular: 'peso argentino', plural: 'pesos argentinos', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  MXN: { singular: 'peso mexicano', plural: 'pesos mexicanos', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  COP: { singular: 'peso colombiano', plural: 'pesos colombianos', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  CLP: { singular: 'peso chileno', plural: 'pesos chilenos', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  USD: { singular: 'dólar estadounidense', plural: 'dólares estadounidenses', centSingular: 'centavo', centPlural: 'centavos', simbolo: 'US$' },
  EUR: { singular: 'euro', plural: 'euros', centSingular: 'céntimo', centPlural: 'céntimos', simbolo: '€' },
  PEN: { singular: 'sol', plural: 'soles', centSingular: 'céntimo', centPlural: 'céntimos', simbolo: 'S/' },
  UYU: { singular: 'peso uruguayo', plural: 'pesos uruguayos', centSingular: 'centésimo', centPlural: 'centésimos', simbolo: '$U' },
  VES: { singular: 'bolívar', plural: 'bolívares', centSingular: 'céntimo', centPlural: 'céntimos', simbolo: 'Bs.' },
  DOP: { singular: 'peso dominicano', plural: 'pesos dominicanos', centSingular: 'centavo', centPlural: 'centavos', simbolo: 'RD$' },
  BRL: { singular: 'real brasileño', plural: 'reales brasileños', centSingular: 'centavo', centPlural: 'centavos', simbolo: 'R$' },
};

// ---------- Núcleo: enteros a letras (reglas RAE, escala larga española) ----------

const UNIDADES = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
  'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
  'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
];

const DECENAS = [
  '', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa',
];

const CENTENAS = [
  '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
];

// Convierte 0..999 a letras. apocope = true → "uno" se vuelve "un" al final (un mil, un millón).
function tresDigitos(n: number, apocope: boolean): string {
  if (n === 0) return '';
  if (n === 100) return 'cien';

  let centena = '';
  let resto = n % 100;
  const c = Math.floor(n / 100);
  if (c > 0) centena = CENTENAS[c];

  let bajo = '';
  if (resto === 0) {
    bajo = '';
  } else if (resto < 30) {
    bajo = UNIDADES[resto];
  } else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    bajo = DECENAS[d];
    if (u > 0) bajo += ' y ' + UNIDADES[u];
  }

  // Apócope: "uno" → "un", "veintiuno" → "veintiún"
  if (apocope) {
    bajo = bajo.replace(/\bveintiuno\b/, 'veintiún').replace(/\buno\b/, 'un');
  }

  if (centena && bajo) return centena + ' ' + bajo;
  return centena || bajo;
}

// Convierte un entero no negativo a letras usando escala larga española.
// Grupos de 6 cifras: unidades, millones, billones, trillones...
// apocopeFinal = true → un "uno"/"veintiuno" al final del número se apocopa a
// "un"/"veintiún" (necesario cuando precede a un sustantivo masculino: "un peso").
function enteroALetras(num: number, apocopeFinal = false): string {
  if (num === 0) return 'cero';

  // Nombres de los grupos de millón (escala larga): 10^0, 10^6, 10^12, 10^18...
  const ESCALAS = ['', 'millón', 'billón', 'trillón'];
  const ESCALAS_PL = ['', 'millones', 'billones', 'trillones'];

  // Partir el número en grupos de 6 dígitos desde la derecha.
  const grupos: number[] = [];
  let n = num;
  while (n > 0) {
    grupos.push(n % 1000000);
    n = Math.floor(n / 1000000);
  }

  const partes: string[] = [];

  // Recorrer de mayor a menor escala.
  for (let g = grupos.length - 1; g >= 0; g--) {
    const valor = grupos[g];
    if (valor === 0) continue;

    if (g === 0) {
      // Grupo de unidades simples: 0..999999. Apócope final solo si lo pide el formato.
      partes.push(grupoSeisCifras(valor, apocopeFinal));
    } else {
      // Grupos de millón/billón/etc: el número que los precede va apocopado
      // ("un millón", "veintiún millones", "dos millones").
      const texto = grupoSeisCifras(valor, true);
      if (valor === 1) {
        partes.push('un ' + ESCALAS[g]);
      } else {
        partes.push(texto + ' ' + ESCALAS_PL[g]);
      }
    }
  }

  return partes.join(' ').replace(/\s+/g, ' ').trim();
}

// Convierte 0..999999 a letras (maneja el "mil" interno).
function grupoSeisCifras(n: number, apocopeFinal: boolean): string {
  if (n === 0) return '';
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;

  let out = '';

  if (miles > 0) {
    if (miles === 1) {
      out = 'mil';
    } else {
      // "dos mil", "veintiún mil", "ciento un mil" → la parte de miles va apocopada.
      out = tresDigitos(miles, true) + ' mil';
    }
  }

  if (resto > 0) {
    const restoTxt = tresDigitos(resto, apocopeFinal);
    out = out ? out + ' ' + restoTxt : restoTxt;
  } else if (apocopeFinal && out) {
    // Caso "un millón" → resto 0 pero apócope ya aplicada arriba; nada que hacer.
  }

  return out.trim();
}

// Pasa la primera letra a mayúscula.
function capitalizar(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Importe completo en letras estilo factura: "mil doscientos pesos ... con 50 centavos".
// Reutilizado para el desglose Neto / IVA / Total del preset factura+IVA.
function importeEnLetras(entero: number, centavos: number, moneda: (typeof MONEDAS)[string]): string {
  const letras = enteroALetras(entero, true);
  const terminaEnEscala = /\b(mill(?:ón|ones)|bill(?:ón|ones)|trill(?:ón|ones))$/.test(letras);
  const conector = terminaEnEscala ? 'de ' : '';
  const unidad = entero === 1 ? moneda.singular : moneda.plural;
  const centWord = centavos === 1 ? moneda.centSingular : moneda.centPlural;
  return `${letras} ${conector}${unidad} con ${centavos} ${centWord}`;
}

// Redondeo a centavos y split entero/centavos (con carry si redondea a 100).
function splitImporte(valor: number): { entero: number; centavos: number } {
  const abs = Math.abs(valor);
  let entero = Math.floor(abs);
  let centavos = Math.round((abs - entero) * 100);
  if (centavos === 100) { entero += 1; centavos = 0; }
  return { entero, centavos };
}

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
