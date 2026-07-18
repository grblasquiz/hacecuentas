/**
 * ¿A qué edad me puedo jubilar en Uruguay? — Reforma Ley N° 20.130.
 *
 * La reforma eleva la edad mínima de la causal común de 60 a 65 años en forma
 * gradual, según el AÑO DE NACIMIENTO (transición): nacidos hasta 1972 → 60,
 * 1973 → 61, 1974 → 62, 1975 → 63, 1976 → 64, 1977 en adelante → 65. En todos
 * los casos la causal común exige al menos 30 años de servicios reconocidos.
 * Con menos de 30 años se accede por la causal de EDAD AVANZADA: 65/25, 66/23,
 * 67/21, 68/19, 69/17 y 70/15 (edad/años). Con menos de 15 años no se configura
 * una causal jubilatoria contributiva.
 *
 * Fuente: BPS + Ley 20.130 (IMPO).
 */
import { JUBILACION_UY } from '../data/uruguay-2026';

export interface Inputs {
  /** Año de nacimiento (ej: 1975). */
  anioNacimiento: number;
  /** Años de servicio / aportes reconocidos. */
  aniosServicio: number;
}

export interface Outputs {
  edadJubilacion: string;
  causal: string;
  aniosFaltantes: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

/** Edad mínima de la causal común según año de nacimiento (transición Ley 20.130). */
function edadComunPorNacimiento(anio: number): number {
  for (const tramo of JUBILACION_UY.edadMinimaPorNacimiento) {
    if (anio <= tramo.nacidoHasta) return tramo.edad;
  }
  return 65;
}

export function compute(i: Inputs): Outputs {
  const anio = Math.round(Number(i.anioNacimiento) || 0);
  const aniosServicio = Math.max(0, Number(i.aniosServicio) || 0);

  const edadComun = edadComunPorNacimiento(anio);
  const req = JUBILACION_UY.aniosServicioComun; // 30

  let edad: number | null;
  let causal: string;
  let detalle: string;
  const faltan = Math.max(0, req - aniosServicio);

  if (aniosServicio >= req) {
    // Causal común: se jubila a la edad mínima según su año de nacimiento.
    edad = edadComun;
    causal = 'Causal común (30 años de servicio)';
    detalle =
      `Nacido en ${anio}: la edad mínima de la causal común es ${edadComun} años (transición Ley 20.130). ` +
      `Con ${aniosServicio} años de servicio (≥ 30) ya cumplís los años requeridos, así que podés jubilarte a los ${edadComun} años.`;
  } else {
    // No llega a 30 años: buscar la causal de edad avanzada.
    const avanzada = JUBILACION_UY.edadAvanzada.find((e) => aniosServicio >= e.aniosServicio);
    if (avanzada) {
      edad = avanzada.edad;
      causal = 'Edad avanzada';
      detalle =
        `Con ${aniosServicio} años de servicio no alcanzás la causal común (requiere 30). ` +
        `Por la causal de edad avanzada podés jubilarte a los ${avanzada.edad} años ` +
        `(esa edad requiere ${avanzada.aniosServicio} años de servicio). ` +
        `Te faltan ${faltan} años de servicio para acceder a la causal común a los ${edadComun}.`;
    } else {
      edad = null;
      causal = 'No configura causal contributiva';
      detalle =
        `Con ${aniosServicio} años de servicio (menos de 15) no se configura una causal jubilatoria contributiva. ` +
        `Con 15 años podrías jubilarte por edad avanzada a los 70. Para la causal común te faltan ${faltan} años de servicio.`;
    }
  }

  const edadTxt = edad === null ? 'No configura' : `${edad} años`;

  return {
    edadJubilacion: edadTxt,
    causal,
    aniosFaltantes: aniosServicio >= req ? '0 (ya cumplís los 30 años)' : `${faltan} años de servicio`,
    detalle,
    _insight: {
      type: 'highlight',
      icon: '👵',
      tone: 'info' as const,
      text:
        aniosServicio >= req
          ? `Nacido en **${anio}**, con **${aniosServicio} años** de servicio te jubilás por causal común a los **${edadComun} años**. La reforma sube la edad de a un año por año de nacimiento hasta llegar a 65 para los nacidos desde 1977.`
          : edad !== null
            ? `Con **${aniosServicio} años** de servicio te conviene la causal de **edad avanzada a los ${edad} años**. Si sumás hasta **30 años**, adelantás la jubilación a la causal común a los **${edadComun} años**.`
            : `Con **${aniosServicio} años** de servicio todavía no configurás causal: necesitás al menos **15 años** (edad avanzada a los 70) o **30 años** (causal común a los ${edadComun}).`,
    },
    _table: {
      title: 'Edad mínima de la causal común según año de nacimiento (Ley 20.130)',
      headers: ['Año de nacimiento', 'Edad mínima', 'Años de servicio'],
      rows: [
        ['Hasta 1972', '60 años', '30'],
        ['1973', '61 años', '30'],
        ['1974', '62 años', '30'],
        ['1975', '63 años', '30'],
        ['1976', '64 años', '30'],
        ['1977 en adelante', '65 años', '30'],
      ],
      note:
        'Causal común: 30 años de servicio en todos los casos. Con menos de 30 años, la causal de edad avanzada permite jubilarse a los 65 (25 años), 66 (23), 67 (21), 68 (19), 69 (17) o 70 (15). La causal común del nuevo sistema empieza a otorgarse en 2033.',
    },
  };
}
