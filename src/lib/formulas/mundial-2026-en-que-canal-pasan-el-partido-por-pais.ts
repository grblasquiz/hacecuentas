/**
 * "¿En qué canal pasan el partido del Mundial 2026?" — guía de transmisión por país.
 *
 * El usuario elige su PAÍS (y opcionalmente filtra por tipo de señal) y le decimos
 * en qué canales se ve la Copa Mundial de la FIFA 2026 (EE.UU./México/Canadá, jun-jul
 * 2026), separando TV abierta (gratis), cable/paga y streaming. El hook compartible es
 * la TABLA con todas las señales del país + el aviso de si la selección local va por
 * TV abierta.
 *
 * Datos confirmados con el torneo en curso (jun-2026). Fuentes: medios deportivos y
 * derechos oficiales por país (ver `sources` en el JSON). `dataUpdate.frequency` = yearly
 * (los derechos se relicitan por Mundial; revisar antes de Catar→2026→2030).
 * Devuelve outputs + _insight + _table.
 */

export interface CanalMundialInputs {
  pais: string;
  tipoSenal?: string; // 'todas' | 'abierta' | 'streaming'
  __lang?: string;
}

export interface CanalMundialOutputs {
  canalesAbierta: string;
  canalesCable: string;
  canalesStreaming: string;
  seleccionTvAbierta: string;
  _insight?: any;
  _table?: any;
}

interface PaisData {
  nombre: string;
  bandera: string;
  abierta: string[]; // TV abierta gratuita
  cable: string[]; // cable / TV paga
  streaming: string[]; // plataformas (gratis o de pago, indicado en el string)
  clasificado: boolean; // ¿la selección juega el Mundial 2026?
  anfitrion?: boolean;
  seleccionEnAbierta: boolean; // ¿los partidos de la selección local van por TV abierta?
  nota?: string;
}

// Derechos de TV/streaming del Mundial 2026 por país (confirmado jun-2026).
const PAISES: Record<string, PaisData> = {
  argentina: {
    nombre: 'Argentina',
    bandera: '🇦🇷',
    abierta: ['TV Pública', 'Telefe', 'TyC Sports (52 partidos)'],
    cable: ['DSports (DirecTV) — los 104 partidos'],
    streaming: ['DGO', 'Flow', 'Telecentro Play', 'Mi Telefe', 'Disney+ Premium', 'Paramount+'],
    clasificado: true,
    seleccionEnAbierta: true,
    nota: 'Telefe pasa todos los de Argentina, cruces destacados, semifinales y final. DSports/DGO es la única vía para ver los 104 partidos.',
  },
  mexico: {
    nombre: 'México',
    bandera: '🇲🇽',
    abierta: ['Canal 5 (TelevisaUnivisión)', 'Canal 9', 'Azteca 7', 'Azteca Uno (TV Azteca)'],
    cable: ['TUDN', 'Sky', 'Izzi', 'Totalplay', 'Megacable'],
    streaming: ['ViX Premium (Pase Mundial, los 104)', 'Azteca Deportes online'],
    clasificado: true,
    anfitrion: true,
    seleccionEnAbierta: true,
    nota: 'México es anfitrión. La Selección Mexicana va por Canal 9 y TV Azteca en abierta; ViX Premium tiene los 104 partidos por streaming.',
  },
  espana: {
    nombre: 'España',
    bandera: '🇪🇸',
    abierta: ['La 1 (RTVE)', 'La 2', 'Teledeporte'],
    cable: ['Movistar Plus+', 'DAZN'],
    streaming: ['RTVE Play (gratis)', 'DAZN (los 104, de pago)'],
    clasificado: true,
    seleccionEnAbierta: true,
    nota: 'RTVE emite un partido por jornada (todos los de España y los más importantes) gratis. Para el torneo completo hay que ir a DAZN/Movistar Plus+.',
  },
  colombia: {
    nombre: 'Colombia',
    bandera: '🇨🇴',
    abierta: ['Caracol', 'RCN (35 partidos en abierta)'],
    cable: ['Win Sports / DirecTV', 'DSports — los 104'],
    streaming: ['Caracol Play (gratis)', 'Deportes RCN (gratis)', 'DGO', 'Paramount+'],
    clasificado: true,
    seleccionEnAbierta: true,
    nota: 'Caracol y RCN pasan los 3 partidos de Colombia y otros 35 en abierta. DSports/DGO tiene los 104.',
  },
  chile: {
    nombre: 'Chile',
    bandera: '🇨🇱',
    abierta: ['Chilevisión (CHV) — 52 partidos'],
    cable: ['DSports / DSports 2 / DSports+ (DirecTV) — los 104'],
    streaming: ['DGO', 'Paramount+', 'Disney+ Premium', 'DAZN (los 104)'],
    clasificado: false,
    seleccionEnAbierta: false,
    nota: 'Chile no clasificó al Mundial 2026. Chilevisión igual transmite por interés general (52 partidos, 34 de fase de grupos en abierta).',
  },
  peru: {
    nombre: 'Perú',
    bandera: '🇵🇪',
    abierta: ['América TV (40 partidos)'],
    cable: ['DSports (DirecTV) — los 104'],
    streaming: ['América tvGO (gratis)', 'YouTube de América (gratis)', 'DGO', 'Paramount+', 'DAZN'],
    clasificado: false,
    seleccionEnAbierta: false,
    nota: 'Perú no clasificó al Mundial 2026. América TV transmite gratis 40 partidos (inauguración, favoritos, eliminación directa y final).',
  },
  ecuador: {
    nombre: 'Ecuador',
    bandera: '🇪🇨',
    abierta: ['Teleamazonas (40 partidos)'],
    cable: ['DSports / DSports 2 / DSports+ (DirecTV) — los 104'],
    streaming: ['Teleamazonas.com (gratis)', 'app Claro Video (gratis para clientes Claro)', 'DGO', 'Paramount+', 'Disney+ Premium'],
    clasificado: true,
    seleccionEnAbierta: true,
    nota: 'Teleamazonas es el único canal abierto con derechos: pasa los 3 partidos de Ecuador y otros destacados gratis.',
  },
  uruguay: {
    nombre: 'Uruguay',
    bandera: '🇺🇾',
    abierta: ['Canal 5 (público)'],
    cable: ['DSports (DirecTV) — los 104', 'SimpleTV'],
    streaming: ['Antel TV (gratis dentro del país)', 'DGO', 'Paramount+', 'Disney+ Premium'],
    clasificado: true,
    seleccionEnAbierta: true,
    nota: 'Canal 5 pasa todos los partidos de Uruguay en fase de grupos, gratis; Antel TV lo transmite online sin costo dentro del país.',
  },
  'estados-unidos-espanol': {
    nombre: 'Estados Unidos (en español)',
    bandera: '🇺🇸',
    abierta: ['Telemundo'],
    cable: ['Universo'],
    streaming: ['Peacock (streaming exclusivo en español; gratis con Walmart+ / Instacart)'],
    clasificado: true,
    anfitrion: true,
    seleccionEnAbierta: true,
    nota: 'Mercado hispano de EE.UU.: Telemundo (abierta) + Universo (cable) pasan todos los partidos en español. Peacock concentra el streaming en español.',
  },
  'estados-unidos-ingles': {
    nombre: 'Estados Unidos (en inglés)',
    bandera: '🇺🇸',
    abierta: ['FOX (70 partidos)'],
    cable: ['FS1 (34 partidos)'],
    streaming: ['Tubi (GRATIS, con publicidad)', 'FOX One', 'FOX Sports App'],
    clasificado: true,
    anfitrion: true,
    seleccionEnAbierta: true,
    nota: 'Mercado en inglés de EE.UU.: FOX (abierta) + FS1 (cable) cubren los 104 partidos. Tubi los pasa gratis online, en inglés.',
  },
  venezuela: {
    nombre: 'Venezuela',
    bandera: '🇻🇪',
    abierta: ['Televen (40 partidos)'],
    cable: ['DSports (DirecTV) — los 104', 'SimpleTV', 'Inter'],
    streaming: ['DGO (los 104)', 'Disney+ Premium'],
    clasificado: false,
    seleccionEnAbierta: false,
    nota: 'Venezuela no clasificó al Mundial 2026. Televen es el único canal abierto: pasa 40 partidos gratis (los más destacados y la fase de definición).',
  },
  bolivia: {
    nombre: 'Bolivia',
    bandera: '🇧🇴',
    abierta: ['Unitel', 'Red Uno (jornada inaugural y partidos clave)'],
    cable: ['Tigo Sports — los 104', 'Entel TV', 'DirecTV (DSports)'],
    streaming: ['Tigo Sports app', 'Entel TV', 'DGO'],
    clasificado: false,
    seleccionEnAbierta: false,
    nota: 'Bolivia no clasificó (cayó en el repechaje ante Irak). El dueño full por cable es Tigo Sports/Entel; Unitel y Red Uno pasan la inauguración y encuentros clave en abierta.',
  },
  paraguay: {
    nombre: 'Paraguay',
    bandera: '🇵🇾',
    abierta: ['Trece (Canal 13)', 'GEN (Canal 12)', 'Unicanal'],
    cable: ['Tigo Sports — los 104', 'DirecTV (DSports)'],
    streaming: ['Tigo Sports app', 'DGO', 'Disney+ Premium', 'Paramount+'],
    clasificado: true,
    seleccionEnAbierta: true,
    nota: 'Trece, GEN y Unicanal pasan todos los partidos de Paraguay y la final en abierta. Por cable, el dueño full es Tigo Sports. (Telefuturo y SNT no tienen los derechos esta edición.)',
  },
};

const PAIS_DEFAULT = 'argentina';

function listar(items: string[]): string {
  if (!items.length) return 'No disponible';
  return items.join(' · ');
}

export function mundial2026EnQueCanalPasanElPartidoPorPais(
  inputs: CanalMundialInputs,
): CanalMundialOutputs {
  const key = String(inputs.pais || PAIS_DEFAULT).toLowerCase().trim();
  const pais = PAISES[key] || PAISES[PAIS_DEFAULT];
  const filtro = String(inputs.tipoSenal || 'todas').toLowerCase().trim();

  const abierta = pais.abierta;
  const cable = pais.cable;
  const streaming = pais.streaming;

  // Construcción de la tabla según el filtro elegido.
  type Fila = { tipo: string; canal: string; clase: string };
  const filasAbierta: Fila[] = abierta.map((c) => ({ tipo: '📺 TV abierta (gratis)', canal: c, clase: 'abierta' }));
  const filasCable: Fila[] = cable.map((c) => ({ tipo: '📡 Cable / TV paga', canal: c, clase: 'cable' }));
  const filasStreaming: Fila[] = streaming.map((c) => ({ tipo: '🟢 Streaming', canal: c, clase: 'streaming' }));

  let filas: Fila[];
  if (filtro === 'abierta') {
    filas = filasAbierta;
  } else if (filtro === 'streaming') {
    filas = filasStreaming;
  } else {
    filas = [...filasAbierta, ...filasCable, ...filasStreaming];
  }

  const tableRows = filas.map((f) => [f.canal, f.tipo]);

  // Texto de "selección local por TV abierta".
  let seleccionTxt: string;
  if (!pais.clasificado) {
    seleccionTxt = `${pais.nombre.replace(/\s*\(.*\)/, '')} no clasificó al Mundial 2026`;
  } else if (pais.seleccionEnAbierta) {
    seleccionTxt = `Sí — por ${listar(abierta)}`;
  } else {
    seleccionTxt = 'No por TV abierta — solo por cable/streaming';
  }

  // Insight / narrativa compartible.
  const nombreLimpio = pais.nombre;
  let narrativa: string;
  const abiertaTxt = abierta.length ? listar(abierta) : 'no hay señal abierta';

  if (pais.clasificado && pais.seleccionEnAbierta) {
    const rol = pais.anfitrion ? ' (país anfitrión)' : '';
    narrativa = `En ${nombreLimpio}${rol}, los partidos del Mundial 2026 se ven GRATIS por TV abierta en ${abiertaTxt}. La selección juega el Mundial y sus partidos van por aire. Por cable, ${listar(cable)}; por streaming, ${listar(streaming)}.`;
  } else if (pais.clasificado) {
    narrativa = `En ${nombreLimpio}, los partidos de la selección NO van por TV abierta: necesitás cable (${listar(cable)}) o streaming (${listar(streaming)}). En abierta hay algo de cobertura por ${abiertaTxt}.`;
  } else {
    narrativa = `${nombreLimpio.replace(/\s*\(.*\)/, '')} no clasificó al Mundial 2026, pero igual lo podés ver: gratis por TV abierta en ${abiertaTxt}, o completo por cable (${listar(cable)}) y streaming (${listar(streaming)}).`;
  }
  if (pais.nota) narrativa += ` ${pais.nota}`;

  const subtitulo =
    filtro === 'abierta'
      ? `Canales gratis (TV abierta) en ${nombreLimpio}`
      : filtro === 'streaming'
        ? `Plataformas de streaming en ${nombreLimpio}`
        : `Dónde ver el Mundial 2026 en ${nombreLimpio}`;

  return {
    canalesAbierta: listar(abierta),
    canalesCable: listar(cable),
    canalesStreaming: listar(streaming),
    seleccionTvAbierta: seleccionTxt,
    _insight: {
      type: 'highlight',
      icon: pais.bandera || '📺',
      text: narrativa,
    },
    _table: {
      title: `${subtitulo} ${pais.bandera}`,
      headers: ['Canal / Plataforma', 'Tipo de señal'],
      rows: tableRows,
      note: 'Derechos de transmisión del Mundial FIFA 2026 (en curso, jun-jul 2026). La grilla puntual de qué partido va por abierta vs. solo cable cambia partido a partido: confirmá con tu operador local.',
    },
  };
}
