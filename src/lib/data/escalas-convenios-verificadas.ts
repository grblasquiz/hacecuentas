type Escala = {
  slug: string;
  title: string;
  month: string;
  description: string;
  columns: string[];
  rows: string[][];
  note: string;
  source: { name: string; url: string };
  calculator?: { label: string; href: string };
};

export const escalasConvenios: Escala[] = [
  {
    slug: 'empleados-de-comercio-130-75',
    title: 'Escala salarial de Empleados de Comercio CCT 130/75',
    month: 'Noviembre de 2026',
    description: 'Consultá sueldos básicos y sumas no remunerativas del convenio de Comercio para maestranza, administrativos y cajeros.',
    columns: ['Categoría', 'Básico mensual', 'Sumas no remunerativas', 'Subtotal bruto'],
    rows: [
      ['Maestranza A', '$1.233.448', '$145.000', '$1.378.448'],
      ['Administrativo C', '$1.257.240', '$145.000', '$1.402.240'],
      ['Administrativo F', '$1.305.707', '$145.000', '$1.450.707'],
      ['Cajero B', '$1.257.240', '$145.000', '$1.402.240'],
    ],
    note: 'Las sumas se componen de $120.000 de acuerdos anteriores y $25.000 del acuerdo de octubre. La escala indica que la suma de $25.000 queda fuera de la base de antigüedad y presentismo. El subtotal tampoco incluye adicionales ni descuentos.',
    source: { name: 'FAECYS · escala del acuerdo de octubre de 2026', url: 'https://www.faecys.org.ar/faecys/wp-content/uploads/2026/10/CIRCULAR-ESCALAS-ACUERDO-OCTUBRE-2026-CCT-130.pdf' },
  },
  {
    slug: 'construccion-uocra-76-75',
    title: 'Escala salarial de la construcción UOCRA CCT 76/75',
    month: 'Noviembre de 2026',
    description: 'Valor de la hora de ayudante, medio oficial y oficial de la construcción en Zona A, con equivalencia para un jornal de 8 horas.',
    columns: ['Categoría · Zona A', 'Básico por hora', 'Básico por 8 horas'],
    rows: [
      ['Ayudante', '$5.696', '$45.568'],
      ['Medio oficial', '$6.188', '$49.504'],
      ['Oficial', '$6.697', '$53.576'],
      ['Oficial especializado', '$7.828', '$62.624'],
    ],
    note: 'El jornal equivalente multiplica por 8 el básico por hora. El convenio contempla escalas distintas por zona y otros conceptos. El sereno de Zona A figura con básico mensual de $1.034.783.',
    source: { name: 'UOCRA · acuerdo salarial del 21 de septiembre de 2026', url: 'https://www.uocra.org/pdf/f03639_acuerdo_76.75y577.10-21.09.2026.pdf' },
  },
  {
    slug: 'metalurgicos-uom-260-75',
    title: 'Escala salarial de metalúrgicos UOM CCT 260/75',
    month: 'Noviembre de 2026',
    description: 'Consultá el básico por hora de la Rama 17 metalmecánica y el bono informado por la UOM para noviembre.',
    columns: ['Categoría · Rama 17', 'Básico por hora'],
    rows: [
      ['Ingresante', '$4.665,41'],
      ['Operario calificado', '$5.054,03'],
      ['Medio oficial', '$5.447,03'],
      ['Oficial', '$6.445,08'],
    ],
    note: 'La UOM informó un bono de $50.000 para noviembre y un ingreso mínimo global de referencia de $1.187.653. El básico mensual de un administrativo de primera es $901.251,29. Consultá la planilla de tu rama para las demás categorías.',
    source: { name: 'UOM · actas y planillas por rama de agosto de 2026 a abril de 2027', url: 'https://uom.org.ar/?page_id=325' },
  },
  {
    slug: 'bancarios',
    title: 'Escala salarial bancaria en Argentina',
    month: 'Octubre de 2026',
    description: 'Salario inicial bancario conformado y actualización de octubre de 2026 de la Asociación Bancaria.',
    columns: ['Concepto', 'Valor para octubre de 2026'],
    rows: [
      ['Actualización salarial', '2,2%'],
      ['Salario inicial', '$2.608.320,16'],
      ['Participación en ganancias (ROE)', '$75.398,39'],
      ['Salario inicial conformado con ROE', '$2.683.718,55'],
    ],
    note: 'El inicial conformado incluye la participación en ganancias, identificada como ROE en el comunicado. Revisá tu categoría y los adicionales del recibo antes de estimar el neto. Esta ficha corresponde a octubre de 2026.',
    source: { name: 'Asociación Bancaria · comunicado de actualización salarial de octubre de 2026', url: 'https://labancaria.org/wp-content/uploads/2026/11/Actualizacion-OCTUBRE.pdf' },
  },
  {
    slug: 'sanidad-clinicas-122-75',
    title: 'Escala salarial de Sanidad CCT 122/75',
    month: 'Noviembre de 2026',
    description: 'Básicos de noviembre para enfermería, mantenimiento y administración de clínicas, sanatorios y geriátricos privados.',
    columns: ['Categoría', 'Básico mensual', 'Asignación no remunerativa'],
    rows: [
      ['Obstetricia e instrumentación', '$1.451.261,46', '$70.000'],
      ['Enfermería de piso o consultorios externos', '$1.349.492,40', '$70.000'],
      ['Oficial de mantenimiento', '$1.312.390,26', '$70.000'],
      ['Personal administrativo de primera', '$1.277.406,87', '$70.000'],
    ],
    note: 'Los valores surgen del acuerdo salarial firmado el 15 de octubre. La asignación de noviembre se informa aparte del básico. El convenio para instituciones sin internación tiene su propia escala.',
    source: { name: 'Acta paritaria de FATSA y las cámaras del CCT 122/75 del 15 de octubre de 2026', url: 'https://hruseful.com/wp-content/uploads/2026/10/acta-fatsa-cct-122-75-15-10-2026.pdf' },
  },
  {
    slug: 'casas-particulares',
    title: 'Escala salarial de Casas Particulares',
    month: 'Noviembre de 2026',
    description: 'Mínimos por hora y por mes para empleadas domésticas y personal de casas particulares, con y sin retiro.',
    columns: ['Categoría', 'Hora con retiro', 'Hora sin retiro', 'Mes con retiro', 'Mes sin retiro'],
    rows: [
      ['Supervisión', '$4.923,44', '$5.339,08', '$614.186,76', '$677.369,70'],
      ['Tareas específicas', '$4.695,59', '$5.093,82', '$574.828,75', '$633.158,89'],
      ['Caseros', '—', '$4.447,11', '—', '$562.284,09'],
      ['Cuidado de personas', '$4.447,11', '$4.918,66', '$562.284,09', '$619.810,80'],
      ['Tareas generales', '$4.170,52', '$4.447,11', '$511.639,37', '$562.284,09'],
    ],
    note: 'La comisión determinó un aumento del 1,6% sobre las bases que fija la resolución. Consultá en el anexo si corresponde el 31% por zona desfavorable. Para estimar aportes y costo total, usá la herramienta del régimen de casas particulares.',
    source: { name: 'Comisión Nacional de Trabajo en Casas Particulares · anexo 4 rectificado', url: 'https://www.argentina.gob.ar/sites/default/files/infoleg/res7-1-429627.pdf' },
    calculator: { label: 'Calcular aportes y costo de personal de casas particulares', href: '/trabajo/contratar-personal-casas-particulares' },
  },
];
