import type { HubData } from './types';

export const hub: HubData = {
  slug: 'trabajo/accidente-laboral',
  title: 'Accidente laboral: qué hacer, qué cobra la ART y cuándo reclamar',
  description:
    'Guía paso a paso ante un accidente laboral en Argentina: denuncia, atención de la ART, sueldo durante la baja, alta, secuelas y Comisión Médica.',
  silo: 'Trabajo',
  siloHref: '/trabajo',
  eyebrow: 'SRT · ART · Argentina',
  h1: 'Tuve un accidente laboral. ¿Qué hago ahora?',
  lede:
    'Elegí en qué momento del caso estás. Te mostramos qué hacer hoy, qué documentación guardar y cuándo corresponde calcular un pago.',
  stamps: ['Fuentes oficiales SRT', 'Revisado agosto 2026', 'Sin registro'],
  resultLabel: 'Próximo paso',
  inputsTitle: '¿En qué momento estás?',
  inputsIntro: 'Seleccioná la etapa que mejor describe tu caso.',
  fields: [],
  fineprint: 'Esta guía orienta: no reemplaza atención médica ni asesoramiento legal.',
  chart: { type: 'timeline', caption: 'Recorrido habitual desde la denuncia hasta la evaluación de secuelas.' },
  breakdownTitle: 'Qué hacer ahora',
  breakdownIntro: 'Los pasos concretos para no perder documentación ni plazos.',
  answer: {
    title: 'La prioridad es denunciar y conservar constancia',
    copy: 'Ante un accidente laboral, buscá atención médica si la necesitás, avisá al empleador o a la ART y guardá el número de siniestro. Después reuní certificados, estudios, recibos y comunicaciones para que el recorrido pueda revisarse con la SRT.',
    yes: ['Atención médica y denuncia registrada', 'Número de siniestro y copia de cada comunicación', 'Documentación médica y laboral ordenada por fecha'],
    warn: ['No firmes un alta o acuerdo sin entender su alcance', 'Los plazos y trámites dependen del tipo de accidente y de la etapa del caso'],
    plazo: 'Revisá hoy la denuncia y la constancia; para una decisión concreta consultá la fuente oficial o un profesional.',
  },
  faq: [
    { q: '¿Cómo se denuncia un accidente laboral?', a: 'Podés avisar al empleador, que debe comunicarlo a la ART, o denunciarlo directamente ante la aseguradora. Pedí siempre el número de siniestro y guardá una constancia del aviso.' },
    { q: '¿Qué hago si necesito atención médica urgente?', a: 'Priorizá la atención médica. Ante una emergencia llamá al 107 o al 911. Después documentá dónde, cuándo y cómo ocurrió el accidente y notificá al empleador o a la ART.' },
    { q: '¿Quién paga mientras estoy de baja?', a: 'Durante la incapacidad laboral temporaria corresponde una prestación dineraria calculada según la remuneración. La SRT publica las reglas aplicables y sus actualizaciones.' },
    { q: '¿Puedo discutir el alta médica?', a: 'Sí. Si no estás de acuerdo con el alta, la falta de tratamiento o las prestaciones, la SRT contempla trámites de divergencia ante las Comisiones Médicas.' },
    { q: '¿Qué pasa si me quedaron secuelas?', a: 'Después del alta puede corresponder evaluar una incapacidad laboral permanente. El porcentaje lo determina la Comisión Médica y puede dar lugar a una prestación de pago único.' },
    { q: '¿Qué hago si la ART rechaza el accidente?', a: 'Conservá la carta o constancia del rechazo, la documentación médica y la denuncia. Podés solicitar la intervención de la SRT mediante el trámite que corresponda al tipo de rechazo.' },
    { q: '¿Necesito abogado?', a: 'Los trámites de valoración o determinación de incapacidad requieren patrocinio letrado. Para una denuncia inicial o consulta general, revisá el requisito específico en la página oficial.' },
  ],
  sources: [
    { name: 'Información para el trabajador', url: 'https://www.argentina.gob.ar/srt/trabajador', publisher: 'Superintendencia de Riesgos del Trabajo', date: '2026-08-03' },
    { name: 'Pagos que deben efectuar las ART', url: 'https://www.argentina.gob.ar/srt/art/pagos-art', publisher: 'Superintendencia de Riesgos del Trabajo', date: '2026-08-03' },
    { name: 'Incapacidad Laboral Permanente', url: 'https://www.argentina.gob.ar/srt/art/pagos-art/incapacidad-laboral-permanente', publisher: 'Superintendencia de Riesgos del Trabajo', date: '2026-08-03' },
    { name: 'Trámites ante Comisiones Médicas', url: 'https://www.argentina.gob.ar/srt/comisionesmedicas/tramites', publisher: 'Superintendencia de Riesgos del Trabajo', date: '2026-08-03' },
  ],
  replaces: [],
  lastReviewed: '2026-08-03',
  audience: 'AR',
};
