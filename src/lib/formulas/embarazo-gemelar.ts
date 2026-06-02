/** Embarazo gemelar — FPP ajustada y controles */
export interface Inputs { fum: string; tipoGemelar?: string; semanaActual?: number; }
export interface Outputs { fppGemelar: string; pesoEstimado: string; controles: string; riesgos: string; _insight?: any; }

export function embarazoGemelar(i: Inputs): Outputs {
  const parts = String(i.fum || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una FUM válida');
  const [yy, mm, dd] = parts;
  const fum = new Date(yy, mm - 1, dd);
  if (isNaN(fum.getTime())) throw new Error('Ingresá una FUM válida');
  const tipo = String(i.tipoGemelar || 'no-se');
  const sem = Number(i.semanaActual) || 0;

  // FPP según tipo
  let semanasParto = 37;
  let controles = '';
  let riesgos = '';
  switch (tipo) {
    case 'bicorial':
      semanasParto = 37;
      controles = 'Ecografía cada 4 semanas desde semana 20. Monitoreo fetal desde semana 32.';
      riesgos = 'Parto prematuro, preeclampsia, diabetes gestacional, RCIU discordante.';
      break;
    case 'monocorial-bi':
      semanasParto = 36;
      controles = 'Ecografía cada 2 semanas desde semana 16. Doppler de arteria umbilical. Monitoreo fetal desde semana 28.';
      riesgos = 'STFF (síndrome de transfusión feto-fetal), RCIU selectivo, parto prematuro, preeclampsia.';
      break;
    case 'monocorial-mono':
      semanasParto = 33;
      controles = 'Ecografía semanal desde semana 16. Internación posible desde semana 26-28. Monitoreo fetal diario.';
      riesgos = 'STFF, enredo de cordones, parto prematuro extremo. Requiere centro de alta complejidad.';
      break;
    default:
      semanasParto = 37;
      controles = 'Depende del tipo de gemelar. Consultá con tu obstetra para definir la corionicidad.';
      riesgos = 'Hasta no saber el tipo, seguí controles regulares con mayor frecuencia.';
  }

  // FPP gemelar
  const fpp = new Date(fum.getTime());
  fpp.setDate(fpp.getDate() + semanasParto * 7);

  // Peso estimado por bebé según semana (gemelos ~10-15% menos que único)
  const pesosGemelar: Record<number, string> = {
    12: '~14 g', 16: '~85 g', 20: '~260 g', 24: '~550 g', 28: '~900 g',
    30: '~1,1 kg', 32: '~1,5 kg', 34: '~1,9 kg', 36: '~2,3 kg', 37: '~2,4 kg',
    38: '~2,5 kg', 40: '~2,8 kg',
  };
  let pesoEstimado = 'Ingresá la semana actual para ver el peso estimado';
  if (sem > 0) {
    const keys = Object.keys(pesosGemelar).map(Number).sort((a, b) => a - b);
    let closest = keys[0];
    for (const k of keys) { if (k <= sem) closest = k; }
    pesoEstimado = `${pesosGemelar[closest]} por bebé (semana ${closest})`;
  }

  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const fppTxt = `${fpp.getDate()} de ${meses[fpp.getMonth()]} de ${fpp.getFullYear()}`;
  const tipoTxt: Record<string, string> = {
    'bicorial': 'bicorial-biamniótico (dos placentas)',
    'monocorial-bi': 'monocorial-biamniótico (placenta compartida)',
    'monocorial-mono': 'monocorial-monoamniótico (placenta y bolsa compartidas)',
    'no-se': 'gemelar',
  };
  const tono = (tipo === 'monocorial-mono' || tipo === 'monocorial-bi') ? 'warn'
    : tipo === 'no-se' ? 'neutral' : 'warn';
  const extra = tipo === 'monocorial-mono'
    ? ' Es el tipo de mayor riesgo: requiere centro de alta complejidad y controles muy frecuentes.'
    : tipo === 'monocorial-bi'
    ? ' Al compartir placenta hay que vigilar el STFF con ecografías cada 2 semanas.'
    : tipo === 'bicorial'
    ? ' Al tener placentas separadas es el escenario más favorable dentro de un embarazo gemelar.'
    : ' Definir la corionicidad con tu obstetra es clave para ajustar controles y fecha de parto.';

  return {
    fppGemelar: `${fpp.getFullYear()}-${String(fpp.getMonth()+1).padStart(2,'0')}-${String(fpp.getDate()).padStart(2,'0')}`,
    pesoEstimado,
    controles,
    riesgos,
    _insight: {
      title: 'Tu embarazo gemelar',
      text: `Para un embarazo ${tipoTxt[tipo] || 'gemelar'}, los mellizos suelen nacer alrededor de la **semana ${semanasParto}** — antes que un embarazo único — con FPP estimada para el **${fppTxt}**.${extra}`,
      tone: tono,
      icon: '👶',
    },
  };
}
