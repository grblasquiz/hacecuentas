/** Edad equivalente humana de un conejo */
export interface Inputs {
  edadConejo: number;
  raza?: string;
  __lang?: string;
}
export interface Outputs {
  edadHumana: number;
  etapaVida: string;
  esperanzaVida: string;
  detalle: string;
}

export function edadConejo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorEdad: 'Ingresá la edad del conejo',
      esperanzaMediano: '8-10 años',
      esperanzaEnano: '10-12 años',
      esperanzaGigante: '5-7 años',
      cachorro: 'Cachorro (bebé)',
      adolescente: 'Adolescente',
      adultoJoven: 'Adulto joven',
      adultoMaduro: 'Adulto maduro',
      senior: 'Senior',
      seniorAvanzado: 'Senior avanzado (geriátrico)',
    },
    en: {
      errorEdad: 'Enter the rabbit\'s age',
      esperanzaMediano: '8-10 years',
      esperanzaEnano: '10-12 years',
      esperanzaGigante: '5-7 years',
      cachorro: 'Kit (baby)',
      adolescente: 'Adolescent',
      adultoJoven: 'Young adult',
      adultoMaduro: 'Mature adult',
      senior: 'Senior',
      seniorAvanzado: 'Advanced senior (geriatric)',
    },
  } as const)[__lang];

  const edad = Number(i.edadConejo);
  const raza = String(i.raza || 'mediano');

  if (!edad || edad <= 0) throw new Error(T.errorEdad);

  // Años humanos adicionales por año de conejo después del primero
  let factorAnual = 8; // mediano
  let esperanza = T.esperanzaMediano;

  if (raza === 'enano') {
    factorAnual = 6;
    esperanza = T.esperanzaEnano;
  } else if (raza === 'gigante') {
    factorAnual = 10;
    esperanza = T.esperanzaGigante;
  }

  // Primer año = 21 años humanos, después sumar factor
  let edadHumana = 0;
  if (edad <= 1) {
    edadHumana = edad * 21;
  } else {
    edadHumana = 21 + (edad - 1) * factorAnual;
  }

  // Etapa de vida
  let etapa = '';
  if (edad < 0.5) etapa = T.cachorro;
  else if (edad < 1) etapa = T.adolescente;
  else if (edad < 3) etapa = T.adultoJoven;
  else if (edad < 5) etapa = T.adultoMaduro;
  else if (edad < 7) etapa = T.senior;
  else etapa = T.seniorAvanzado;

  // Ajustar etapa para gigantes (envejecen antes)
  if (raza === 'gigante') {
    if (edad >= 3 && edad < 4) etapa = T.adultoMaduro;
    else if (edad >= 4 && edad < 5) etapa = T.senior;
    else if (edad >= 5) etapa = T.seniorAvanzado;
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    edadHumana: Math.round(edadHumana),
    etapaVida: etapa,
    esperanzaVida: esperanza,
    detalle: __lang === 'en'
      ? `Your rabbit (${raza}) aged ${edad} years is equivalent to ~${fmt.format(edadHumana)} human years. Life stage: ${etapa}. Average life expectancy: ${esperanza}.`
      : `Tu conejo (${raza}) de ${edad} años equivale a ~${fmt.format(edadHumana)} años humanos. Etapa: ${etapa}. Esperanza de vida promedio: ${esperanza}.`,
  };
}
