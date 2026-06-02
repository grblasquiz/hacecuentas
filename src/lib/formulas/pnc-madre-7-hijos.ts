/**
 * Calculadora PNC Madre de 7 o más hijos (Argentina)
 *
 * Marco legal:
 *   - Ley 23.746 (1989) — Pensión No Contributiva para madres de 7 o más hijos
 *   - Decreto 1357/94 — reglamentación
 *   - Resolución SSS 268/2024 — liquidación transferida a ANSES
 *
 * Importe: 100% del haber mínimo jubilatorio vigente.
 * Movilidad: aplica la Ley 27.609 (movilidad jubilatoria trimestral, hoy mensual por DNU 274/2024).
 *
 * Requisitos (art. 1 Ley 23.746):
 *   - Madre argentina o naturalizada con 1 año mínimo de residencia
 *   - 7 o más hijos nacidos vivos (incluye fallecidos)
 *   - No percibir jubilación ni pensión propia
 *   - No tener otros ingresos que superen el haber mínimo
 *   - Hijos legalmente reconocidos o adoptivos
 */

export interface PncMadre7HijosInputs {
  cantidadHijos: number;
  edadMadre: number;
  percibeOtroIngreso: boolean | string;
  montoOtroIngreso: number;
  haberMinimoVigente: number; // se inyecta como input para no hardcodear
}

export interface PncMadre7HijosOutputs {
  importeMensual: number;
  importeAnualConSac: number;
  cumpleRequisitos: boolean;
  motivos: string[];
  tramiteWeb: string;
  hijosFaltantes: number;
  mensaje: string;
  _insight?: any;
}

export function pncMadre7Hijos(inputs: PncMadre7HijosInputs): PncMadre7HijosOutputs {
  const hijos = Math.max(0, Math.floor(Number(inputs.cantidadHijos) || 0));
  const edad = Math.max(0, Math.floor(Number(inputs.edadMadre) || 0));
  const percibe =
    inputs.percibeOtroIngreso === true ||
    inputs.percibeOtroIngreso === 'true' ||
    inputs.percibeOtroIngreso === 'si' ||
    inputs.percibeOtroIngreso === 'Si' ||
    inputs.percibeOtroIngreso === 'sí';
  const montoOtro = Math.max(0, Number(inputs.montoOtroIngreso) || 0);
  const haberMinimo = Math.max(0, Number(inputs.haberMinimoVigente) || 0);

  if (!haberMinimo || haberMinimo <= 0) {
    throw new Error('Ingresá el haber mínimo jubilatorio vigente (consultá ANSES)');
  }
  if (!edad || edad <= 0) {
    throw new Error('Ingresá la edad de la madre');
  }

  const motivos: string[] = [];

  // Requisito principal: 7 o más hijos
  const hijosFaltantes = Math.max(0, 7 - hijos);
  if (hijos < 7) {
    motivos.push(
      `Faltan ${hijosFaltantes} hijo${hijosFaltantes === 1 ? '' : 's'}: la Ley 23.746 exige un mínimo de 7 hijos nacidos vivos (incluso si alguno falleció).`,
    );
  }

  // Otro ingreso superior al haber mínimo: incompatibilidad
  if (percibe && montoOtro >= haberMinimo) {
    motivos.push(
      `El otro ingreso declarado ($${montoOtro.toLocaleString('es-AR')}) iguala o supera el haber mínimo ($${haberMinimo.toLocaleString('es-AR')}). La PNC es incompatible con otro beneficio mayor o igual al haber mínimo.`,
    );
  }

  // Edad mínima de la madre: la Ley 23.746 no exige edad mínima, pero se requiere capacidad civil plena
  if (edad < 18) {
    motivos.push(
      'La solicitante debe ser mayor de edad (18 años o más) para tramitar la PNC en nombre propio.',
    );
  }

  const cumpleRequisitos = motivos.length === 0;

  // Importe: 100% del haber mínimo (Ley 23.746, art. 5)
  const importeMensual = cumpleRequisitos ? haberMinimo : 0;
  // SAC: la PNC madre de 7 hijos cobra aguinaldo (Resolución ANSES 70/2018). 13 sueldos anuales.
  const importeAnualConSac = importeMensual * 13;

  let mensaje = '';
  if (cumpleRequisitos) {
    mensaje = `Cumplís los requisitos para tramitar la PNC madre de 7 hijos. El haber mensual estimado es de $${importeMensual.toLocaleString('es-AR')} (100% del haber mínimo) más medio aguinaldo en junio y diciembre. El trámite es gratuito y se inicia en ANSES con turno previo.`;
  } else if (hijos < 7) {
    mensaje = `No cumplís el requisito mínimo de 7 hijos. Podés explorar otras prestaciones: PUAM (a partir de 65 años), PNC por vejez (a partir de 70 años), o Asignación Universal por Hijo si tenés hijos menores de 18.`;
  } else {
    mensaje = `Hay incompatibilidades para acceder a la PNC. Revisá los motivos detallados arriba y consultá en ANSES por alternativas.`;
  }

  const importeMensualRed = Math.round(importeMensual);
  const importeAnualRed = Math.round(importeAnualConSac);
  const insight = cumpleRequisitos
    ? {
        title: 'Cumplís los requisitos',
        text: `Podés tramitar la PNC madre de 7 hijos: cobrarías **$${importeMensualRed.toLocaleString('es-AR')}** por mes (100% del haber mínimo) y **$${importeAnualRed.toLocaleString('es-AR')}** al año con aguinaldo. El trámite es **gratuito** en ANSES con turno previo.`,
        tone: 'good' as const,
        icon: '👩‍👧‍👦',
      }
    : {
        title: hijos < 7 ? 'Todavía no calificás' : 'Hay una incompatibilidad',
        text: hijos < 7
          ? `Te falta${hijosFaltantes === 1 ? '' : 'n'} **${hijosFaltantes} hijo${hijosFaltantes === 1 ? '' : 's'}**: la Ley 23.746 exige **7 o más** nacidos vivos. Mientras tanto mirá la PUAM (65 años), la PNC por vejez (70) o la AUH si tenés hijos menores.`
          : `No podés acceder por las incompatibilidades detalladas (otro ingreso igual o mayor al haber mínimo). Revisá los motivos y consultá alternativas en ANSES.`,
        tone: 'warn' as const,
        icon: '👩‍👧‍👦',
      };

  return {
    importeMensual: importeMensualRed,
    importeAnualConSac: importeAnualRed,
    cumpleRequisitos,
    motivos,
    tramiteWeb: 'https://www.anses.gob.ar/prestaciones/pension-no-contributiva-madre-de-7-o-mas-hijos',
    hijosFaltantes,
    mensaje,
    _insight: insight,
  };
}
