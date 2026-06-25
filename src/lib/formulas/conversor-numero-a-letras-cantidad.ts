export interface Inputs {
  numero: number;
  formato: string;
}

export interface Outputs {
  entero: number;
  decimal: number;
  _insight?: any;
}

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

// ---------- compute ----------

export function compute(i: Inputs): Outputs {
  const numeroRaw = Number(i.numero);
  const formato = String(i.formato || 'simple').toLowerCase();

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

  if (formato === 'moneda') {
    const peso = enteroFinal === 1 && !negativo ? 'peso' : 'pesos';
    const centTxt = centavosFinal.toString().padStart(2, '0');
    const centWord = centavosFinal === 1 ? 'centavo' : 'centavos';
    textoFinal = `${capitalizar(letrasEntero)} ${conector}${peso} con ${centavosFinal} ${centWord}`;
    nota = `Importe formateado para factura o recibo: incluye los ${centTxt} centavos en letras.`;
  } else if (formato === 'cheque') {
    // Cheque: TODO en mayúsculas, centavos como "NN/100".
    const peso = enteroFinal === 1 && !negativo ? 'PESO' : 'PESOS';
    const centTxt = centavosFinal.toString().padStart(2, '0');
    textoFinal = `${letrasEntero} ${conector}${peso} CON ${centTxt}/100`.toUpperCase();
    nota = 'Formato cheque: todo en MAYÚSCULAS y los centavos como NN/100, como exige la mayoría de los bancos.';
  } else {
    // simple: solo el entero en letras.
    textoFinal = capitalizar(letrasEntero);
    nota = 'Formato simple: el número entero escrito en letras según las reglas de la RAE.';
  }

  const ejemploCifra = formato === 'cheque'
    ? `**$${enteroFinal.toLocaleString('es-AR')}** → ${textoFinal}`
    : `**${negativo ? '-' : ''}${abs.toLocaleString('es-AR', { minimumFractionDigits: formato === 'simple' ? 0 : 2, maximumFractionDigits: formato === 'simple' ? 0 : 2 })}**`;

  return {
    entero: enteroFinal,
    decimal: centavosFinal,
    _insight: {
      title: 'El número en letras',
      text: `${ejemploCifra}\n\n## ${textoFinal}\n\n${nota}`,
      tone: 'neutral',
      icon: '✍️',
    },
  };
}
