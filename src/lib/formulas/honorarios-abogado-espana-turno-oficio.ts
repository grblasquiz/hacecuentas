/** Honorarios turno de oficio España — baremo por procedimiento y comunidad */
export interface Inputs {
  comunidad: string; // 'andalucia' | 'madrid' | 'cataluna'
  procedimiento: string; // 'penal-juicio-rapido' | 'penal-abreviado' | 'civil-juicio-verbal' | ...
}

export interface Outputs {
  importeBase: number;
  iva: number;
  totalConIva: number;
  comunidadMostrada: string;
  procedimientoMostrado: string;
  resumen: string;
}

// Baremos orientativos 2026 (EUR), basados en normativa autonómica
const BAREMO: Record<string, Record<string, { monto: number; label: string }>> = {
  'andalucia': {
    'penal-juicio-rapido': { monto: 175, label: 'Juicio rápido penal' },
    'penal-abreviado': { monto: 325, label: 'Procedimiento abreviado penal' },
    'penal-sumario': { monto: 485, label: 'Sumario / jurado penal' },
    'civil-verbal': { monto: 210, label: 'Juicio verbal civil' },
    'civil-ordinario': { monto: 345, label: 'Juicio ordinario civil' },
    'familia-divorcio': { monto: 285, label: 'Divorcio / familia' },
    'laboral': { monto: 250, label: 'Jurisdicción social / laboral' },
    'contencioso': { monto: 275, label: 'Contencioso administrativo' },
    'extranjeria': { monto: 175, label: 'Extranjería / asilo' },
    'menores': { monto: 220, label: 'Menores / responsabilidad penal' },
  },
  'madrid': {
    'penal-juicio-rapido': { monto: 215, label: 'Juicio rápido penal' },
    'penal-abreviado': { monto: 380, label: 'Procedimiento abreviado penal' },
    'penal-sumario': { monto: 560, label: 'Sumario / jurado penal' },
    'civil-verbal': { monto: 245, label: 'Juicio verbal civil' },
    'civil-ordinario': { monto: 400, label: 'Juicio ordinario civil' },
    'familia-divorcio': { monto: 330, label: 'Divorcio / familia' },
    'laboral': { monto: 290, label: 'Jurisdicción social / laboral' },
    'contencioso': { monto: 320, label: 'Contencioso administrativo' },
    'extranjeria': { monto: 210, label: 'Extranjería / asilo' },
    'menores': { monto: 255, label: 'Menores / responsabilidad penal' },
  },
  'cataluna': {
    'penal-juicio-rapido': { monto: 195, label: 'Juicio rápido penal' },
    'penal-abreviado': { monto: 355, label: 'Procediment abreujat penal' },
    'penal-sumario': { monto: 520, label: 'Sumari / jurat penal' },
    'civil-verbal': { monto: 225, label: 'Judici verbal civil' },
    'civil-ordinario': { monto: 375, label: 'Judici ordinari civil' },
    'familia-divorcio': { monto: 310, label: 'Divorci / família' },
    'laboral': { monto: 270, label: 'Jurisdicció social / laboral' },
    'contencioso': { monto: 300, label: 'Contenciós administratiu' },
    'extranjeria': { monto: 195, label: 'Estrangeria / asil' },
    'menores': { monto: 240, label: 'Menors / responsabilitat penal' },
  },
};

const COMUNIDADES: Record<string, string> = {
  'andalucia': 'Andalucía (Junta de Andalucía)',
  'madrid': 'Comunidad de Madrid (ICAM)',
  'cataluna': 'Cataluña (CICAC)',
};

export function honorariosAbogadoEspanaTurnoOficio(i: Inputs): Outputs {
  const com = String(i.comunidad || 'andalucia').toLowerCase();
  const proc = String(i.procedimiento || 'penal-juicio-rapido').toLowerCase();

  const baremoCom = BAREMO[com];
  if (!baremoCom) throw new Error('Comunidad inválida');
  const item = baremoCom[proc];
  if (!item) throw new Error('Procedimiento no encontrado para esta comunidad');

  const base = item.monto;
  const iva = base * 0.21;
  const total = base + iva;

  return {
    importeBase: Number(base.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    totalConIva: Number(total.toFixed(2)),
    comunidadMostrada: COMUNIDADES[com] || com,
    procedimientoMostrado: item.label,
    resumen: `Turno de oficio **${item.label}** en ${COMUNIDADES[com]} = **€${base.toFixed(2)}** + IVA 21% (€${iva.toFixed(2)}) = **€${total.toFixed(2)}**.`,
  };
}
