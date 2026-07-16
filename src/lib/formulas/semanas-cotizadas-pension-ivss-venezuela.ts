/**
 * Semanas cotizadas y edad de jubilación (IVSS) — Venezuela.
 *
 * La pensión de vejez del Instituto Venezolano de los Seguros Sociales exige
 * DOS requisitos simultáneos (Ley del Seguro Social):
 *   - Edad: 60 años (hombres) / 55 años (mujeres).
 *   - Cotizaciones: mínimo 750 semanas cotizadas.
 *
 * Esta calculadora estima cuánto te falta de cada requisito y en cuántos años
 * completarías las semanas si seguís cotizando de forma continua.
 *
 * ⚠️ ORIENTATIVA. Existen pensiones especiales/parciales y convenios; la
 * situación real la determina el IVSS. No sustituye asesoría previsional.
 */

export interface Inputs {
  sexo?: string;            // 'm' | 'f'
  edad?: number;
  semanasCotizadas?: number;
  semanasPorAnio?: number;  // semanas que cotizás por año a futuro (default 48)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const SEMANAS_REQUERIDAS = 750;      // Ley del Seguro Social
const EDAD_HOMBRE = 60;
const EDAD_MUJER = 55;

export function compute(i: Inputs): Outputs {
  const sexo = String(i.sexo ?? 'm') === 'f' ? 'f' : 'm';
  const edad = Math.max(0, Number(i.edad) || 0);
  const semanas = Math.max(0, Number(i.semanasCotizadas) || 0);
  const semanasPorAnio = Math.max(1, Math.min(52, Number(i.semanasPorAnio ?? 48) || 48));
  if (edad <= 0) throw new Error('Ingresá tu edad');

  const edadRequerida = sexo === 'f' ? EDAD_MUJER : EDAD_HOMBRE;

  const cumpleEdad = edad >= edadRequerida;
  const cumpleSemanas = semanas >= SEMANAS_REQUERIDAS;
  const faltanAniosEdad = Math.max(0, edadRequerida - edad);
  const faltanSemanas = Math.max(0, SEMANAS_REQUERIDAS - semanas);
  const aniosParaSemanas = faltanSemanas > 0 ? Math.ceil(faltanSemanas / semanasPorAnio) : 0;

  // El requisito que más tarda en cumplirse marca cuándo te podrías pensionar.
  const aniosFaltantesTotal = Math.max(faltanAniosEdad, aniosParaSemanas);
  const cumpleAmbos = cumpleEdad && cumpleSemanas;

  let estado: string;
  if (cumpleAmbos) {
    estado = 'Cumplís ambos requisitos: edad y semanas cotizadas.';
  } else if (cumpleEdad && !cumpleSemanas) {
    estado = `Tenés la edad pero te faltan ${faltanSemanas} semanas (${aniosParaSemanas} año/s cotizando ${semanasPorAnio}/año).`;
  } else if (!cumpleEdad && cumpleSemanas) {
    estado = `Tenés las 750 semanas pero te faltan ${faltanAniosEdad} año/s para la edad (${edadRequerida}).`;
  } else {
    estado = `Te faltan ${faltanAniosEdad} año/s para la edad (${edadRequerida}) y ${faltanSemanas} semanas de cotización.`;
  }

  const aniosCotizadosEquiv = (semanas / 52);

  const narrativa =
    `Para la pensión de vejez del IVSS ${sexo === 'f' ? '(mujer)' : '(hombre)'} necesitás ${edadRequerida} años de edad y 750 semanas cotizadas ` +
    `(unos ${(SEMANAS_REQUERIDAS / 52).toFixed(0)} años de aportes). ` +
    `Hoy tenés ${edad} años y ${semanas} semanas (~${aniosCotizadosEquiv.toFixed(1)} años cotizados). ${estado}` +
    (!cumpleAmbos ? ` Estimando de forma continua, podrías pensionarte en ~${aniosFaltantesTotal} año/s.` : '');

  return {
    cumpleRequisitos: cumpleAmbos ? 'Sí, cumplís edad y semanas' : 'Todavía no',
    faltanSemanas,
    faltanAniosEdad,
    aniosParaCompletarSemanas: aniosParaSemanas,
    edadRequerida: `${edadRequerida} años`,
    detalle: estado,
    _insight: { type: cumpleAmbos ? 'highlight' : 'warning', icon: cumpleAmbos ? '✅' : '⏳', text: narrativa },
    _table: {
      title: 'Requisitos de la pensión de vejez (IVSS)',
      headers: ['Requisito', 'Exigido', 'Tenés', '¿Cumple?', 'Falta'],
      rows: [
        ['Edad', `${edadRequerida} años`, `${edad} años`, cumpleEdad ? '✅ Sí' : 'No', cumpleEdad ? '—' : `${faltanAniosEdad} año/s`],
        ['Semanas cotizadas', `${SEMANAS_REQUERIDAS}`, `${semanas}`, cumpleSemanas ? '✅ Sí' : 'No', cumpleSemanas ? '—' : `${faltanSemanas} semanas`],
        ['Pensión de vejez', 'Edad + semanas', '—', cumpleAmbos ? '✅ Sí' : 'No', cumpleAmbos ? '—' : `~${aniosFaltantesTotal} año/s`],
      ],
      note: 'Requisitos de la pensión ordinaria de vejez (Ley del Seguro Social): 750 semanas y 60/55 años. Existen pensiones parciales, especiales y convenios de continuación facultativa; la evaluación real la hace el IVSS. Cálculo orientativo.',
    },
  };
}
