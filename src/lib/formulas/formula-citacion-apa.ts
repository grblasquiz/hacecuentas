/** Generador de Citas APA 7ma Ed. */
export interface Inputs { apellido: string; inicial: string; ano: number; titulo: string; fuente: string; tipo: string; }
export interface Outputs { referencia: string; citaTexto: string; citaParentesis: string; notas: string; }

export function formulaCitacionApa(i: Inputs): Outputs {
  const apellido = String(i.apellido).trim();
  const inicial = String(i.inicial).trim();
  const ano = Number(i.ano);
  const titulo = String(i.titulo).trim();
  const fuente = String(i.fuente).trim();
  if (!apellido) throw new Error('Ingresá el apellido del autor');
  if (!titulo) throw new Error('Ingresá el título');
  if (!fuente) throw new Error('Ingresá la editorial, revista o URL');

  let referencia: string;
  let notas: string;

  switch (i.tipo) {
    case 'libro':
      referencia = `${apellido}, ${inicial} (${ano}). *${titulo}*. ${fuente}.`;
      notas = 'Si hay edición: agregar (Xª ed.) después del título. Si hay DOI, agregalo al final.';
      break;
    case 'articulo':
      referencia = `${apellido}, ${inicial} (${ano}). ${titulo}. *${fuente}*.`;
      notas = 'Formato completo: Apellido, I. (Año). Título artículo. *Revista*, *vol*(núm), pp-pp. https://doi.org/xxx';
      break;
    case 'web':
      referencia = `${apellido}, ${inicial} (${ano}). *${titulo}*. ${fuente}.`;
      notas = 'Para webs sin autor: usar el título en posición de autor. Sin fecha: usar (s.f.).';
      break;
    default:
      referencia = `${apellido}, ${inicial} (${ano}). *${titulo}*. ${fuente}.`;
      notas = 'Verificá el formato según el tipo específico de fuente.';
  }

  const citaTexto = `${apellido} (${ano})`;
  const citaParentesis = `(${apellido}, ${ano})`;

  return { referencia, citaTexto, citaParentesis, notas };
}
