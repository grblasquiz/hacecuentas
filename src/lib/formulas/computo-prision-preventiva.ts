/**
 * Cómputo prisión preventiva — Código Procesal Penal Art. 7 + Ley 24.390 (art. 7 original 2x1).
 * Ley 27.362 (2017) derogó el 2x1 para delitos de lesa humanidad; regla general 1x1.
 * Excepcional 2x1: si hubo más de 2 años de prisión preventiva SIN sentencia firme
 *   (Ley 24.390 original, pre-2017), se computa doble el tiempo excedente.
 * Resultado: días/meses/años equivalentes a pena efectiva.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function computoPrisionPreventiva(i: Inputs): Outputs {
  const dias = Math.max(0, Number(i.diasDetenido) || 0);
  const regimen = String(i.regimen || 'normal'); // normal | doble2x1
  const anioDetencion = Math.max(1990, Math.min(2030, Number(i.anioInicio) || 2024));

  if (dias <= 0) throw new Error('Ingresá los días detenido');

  let diasComputo = dias;
  let aviso = '';

  if (regimen === 'doble2x1') {
    // Aplica únicamente para hechos anteriores a Ley 27.362 (2017) y con más de 2 años sin sentencia firme.
    if (anioDetencion >= 2017) {
      aviso = 'Ley 27.362 (2017) derogó el 2x1. Se aplica cómputo normal 1x1.';
    } else {
      const limite = 730; // 2 años
      if (dias > limite) {
        diasComputo = limite + (dias - limite) * 2;
        aviso = `2x1 aplicado al excedente de 2 años (Ley 24.390 original). ${dias - limite} días computan doble.`;
      } else {
        aviso = 'Menos de 2 años de preventiva: no aplica 2x1, cómputo 1x1.';
      }
    }
  }

  const anios = Math.floor(diasComputo / 365);
  const meses = Math.floor((diasComputo % 365) / 30);
  const diasRest = Math.round((diasComputo % 365) % 30);

  const equivalente = `${anios} años, ${meses} meses, ${diasRest} días`;
  const diasExtra = diasComputo - dias;
  const aplico2x1 = diasExtra > 0;
  const pidio2x1 = regimen === 'doble2x1';

  let insText: string;
  let insTone: 'good' | 'warn' | 'neutral';
  if (aplico2x1) {
    insText = `Con el 2x1 sobre el excedente de 2 años, **${dias} días** de preventiva computan como **${diasComputo} días** de pena efectiva (**${equivalente}**): el cómputo doble te suma **${diasExtra} días** extra.`;
    insTone = 'good';
  } else if (pidio2x1) {
    insText = `El 2x1 **no aplica** a este caso (${aviso.includes('27.362') ? 'la Ley 27.362 lo derogó para hechos desde 2017' : 'se requieren más de 2 años de preventiva'}). Tus **${dias} días** computan 1x1 = **${equivalente}** de pena efectiva.`;
    insTone = 'warn';
  } else {
    insText = `Tus **${dias} días** de prisión preventiva computan 1x1 como **${equivalente}** de pena efectiva (Art. 7 CPPN / Ley 27.362).`;
    insTone = 'neutral';
  }

  return {
    diasComputables: diasComputo,
    equivalente,
    aviso: aviso || 'Cómputo 1x1 estándar (Art. 7 CPPN / Ley 27.362).',
    disclaimer: 'Cálculo orientativo — el cómputo formal lo hace el juez de ejecución. Consultar abogado penalista.',
    _insight: {
      title: aplico2x1 ? '2x1 aplicado' : 'Cómputo 1x1',
      text: insText,
      tone: insTone,
      icon: '⚖️',
    },
  };
}
