export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function calendarioVacunasBebeArgentina2026Completo(i: Inputs): Outputs {
  const m = Number(i.edadMeses) || 0;

  // Esquema oficial Calendario Nacional de Vacunación Argentina 2026
  // Cada etapa lista las vacunas que se dan EN ESA VISITA
  const ETAPAS: { edad: number; label: string; vacunas: string }[] = [
    {
      edad: 0,
      label: 'Recién nacido (primeras 12–24 h)',
      vacunas: 'BCG (tuberculosis, 1ª y única dosis) + Hepatitis B 1ª dosis',
    },
    {
      edad: 2,
      label: '2 meses',
      vacunas:
        'Quíntuple Pentavalente 1ª (difteria, tétanos, coqueluche, HepB, Hib) + Neumococo VCN20 1ª + Rotavirus 1ª (oral) + IPV Salk 1ª (polio) + Meningococo ACYW 1ª',
    },
    {
      edad: 3,
      label: '3 meses',
      vacunas: 'Meningococo ACYW 2ª dosis',
    },
    {
      edad: 4,
      label: '4 meses',
      vacunas:
        'Quíntuple Pentavalente 2ª + Neumococo VCN20 2ª + Rotavirus 2ª (oral) + IPV Salk 2ª',
    },
    {
      edad: 6,
      label: '6 meses',
      vacunas:
        'Quíntuple Pentavalente 3ª + IPV Salk 3ª + Antigripal (Gripe) 1ª dosis',
    },
    {
      edad: 12,
      label: '12 meses',
      vacunas:
        'Triple Viral 1ª dosis (sarampión, rubéola, paperas) + Hepatitis A 1ª dosis + Neumococo VCN20 refuerzo',
    },
    {
      edad: 15,
      label: '15 meses',
      vacunas:
        'Meningococo ACYW refuerzo + Varicela 1ª dosis',
    },
    {
      edad: 18,
      label: '15–18 meses',
      vacunas:
        'Triple Viral 2ª dosis (adelantada 2026 para niños nacidos desde 1/7/2024) + Quíntuple Pentavalente refuerzo + Polio oral (OPV)',
    },
  ];

  // Instancias cumplidas: etapas cuya edad <= edad actual del bebé
  const cumplidas = ETAPAS.filter(e => m >= e.edad);
  // Próxima etapa: primera cuya edad > edad actual
  const proxEtapa = ETAPAS.find(e => e.edad > m);

  const mesesTxt = Number.isInteger(m) ? `${m}` : m.toFixed(1).replace('.', ',');

  let vacunasAplicadas: string;
  let detalleAplicadas: string;
  let proximas: string;

  if (cumplidas.length === 0) {
    vacunasAplicadas = 'Aún sin instancias (recién nacido prematuro o < 0 meses)';
    detalleAplicadas = 'Ninguna todavía';
    proximas = 'Recién nacido: BCG + Hepatitis B en las primeras 12–24 h de vida';
  } else {
    vacunasAplicadas = `${cumplidas.length} instancia${cumplidas.length === 1 ? '' : 's'} cumplida${cumplidas.length === 1 ? '' : 's'} hasta los ${mesesTxt} meses`;
    detalleAplicadas = cumplidas.map(e => `${e.label}: ${e.vacunas}`).join(' | ');
    proximas = proxEtapa
      ? `${proxEtapa.label}: ${proxEtapa.vacunas}`
      : 'Esquema 0–18 meses completado. Continuar con calendario de niños (2 años en adelante).';
  }

  const insText = cumplidas.length
    ? `A los **${mesesTxt} meses** ya corresponden **${cumplidas.length} instancia${cumplidas.length === 1 ? '' : 's'}** de vacunación del Calendario Nacional 2026. Próximo turno: **${proxEtapa ? `${proxEtapa.label}` : 'esquema 0–18 meses completo'}**. Todas gratuitas y obligatorias (Ley 27.491).`
    : `Recién nacido: la primera instancia es **BCG + Hepatitis B** en las primeras 12–24 horas de vida. Gratuitas y obligatorias (Ley 27.491).`;

  return {
    vacunasAplicadas,
    detalleAplicadas,
    proximas,
    gratis: 'Sí, todas gratuitas en hospitales y centros de salud públicos de Argentina. Ley 27.491.',
    _insight: { title: 'Esquema de vacunación', text: insText, tone: 'neutral', icon: '💉' },
  };
}
