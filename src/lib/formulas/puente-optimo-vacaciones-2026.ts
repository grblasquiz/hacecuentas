/**
 * Armá tu puente óptimo 2026 — dado N días de vacaciones (hábiles), busca la
 * ventana del resto de 2026 donde pedirlos maximiza los días seguidos libres,
 * pegándolos a feriados y fines de semana.
 * Datos: src/lib/data/feriados-ar-2026.ts + src/lib/data/feriados-latam-2026.ts.
 */

import { feriadosDePais } from './dias-habiles-restantes-2026';

export interface PuenteOptimoVacaciones2026Inputs {
  pais: string;
  diasVacaciones: number;
  fechaDesde: string;
}

export interface PuenteOptimoVacaciones2026Outputs {
  resultado: number;
  resumen: string;
  alternativas: string;
  explicacion: string;
}

const FIN = new Date(2026, 11, 31);

function parseLocal(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function iso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function fmtCorto(d: Date): string {
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function puenteOptimoVacaciones2026(
  inputs: PuenteOptimoVacaciones2026Inputs
): PuenteOptimoVacaciones2026Outputs {
  const pais = inputs.pais || 'argentina';
  const n = Math.max(1, Math.min(30, Math.round(Number(inputs.diasVacaciones) || 5)));
  const { fechas: feriados, nombrePais } = feriadosDePais(pais);

  let desde: Date;
  const raw = (inputs.fechaDesde || '').trim();
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) desde = parseLocal(raw);
  else desde = new Date();
  desde.setHours(0, 0, 0, 0);
  const inicio2026 = new Date(2026, 0, 1);
  if (desde < inicio2026) desde = inicio2026;

  if (desde > FIN) {
    return {
      resultado: 0,
      resumen: 'La fecha elegida es posterior al 31/12/2026: no quedan ventanas de 2026 para armar el puente.',
      alternativas: '',
      explicacion: 'Elegí una fecha dentro de 2026 (o dejá el campo vacío para buscar desde hoy).',
    };
  }

  // Un día es "libre" si es sábado, domingo o feriado oficial del país.
  const esLibre = (d: Date): boolean => {
    const dow = d.getDay();
    return dow === 0 || dow === 6 || feriados.has(iso(d));
  };

  interface Opcion {
    inicioVac: Date;
    finVac: Date;
    inicioBloque: Date;
    finBloque: Date;
    total: number;
    feriadosUsados: string[];
  }

  const opciones: Opcion[] = [];
  const cursor = new Date(desde);

  while (cursor <= FIN) {
    if (!esLibre(cursor)) {
      // Tomar N días hábiles de vacaciones empezando acá.
      let habilesTomados = 0;
      const d = new Date(cursor);
      let finVac: Date | null = null;
      while (d <= FIN && habilesTomados < n) {
        if (!esLibre(d)) habilesTomados++;
        if (habilesTomados === n) finVac = new Date(d);
        d.setDate(d.getDate() + 1);
      }
      if (finVac) {
        // Extender el bloque libre hacia atrás y adelante.
        const inicioBloque = new Date(cursor);
        inicioBloque.setDate(inicioBloque.getDate() - 1);
        while (esLibre(inicioBloque)) inicioBloque.setDate(inicioBloque.getDate() - 1);
        inicioBloque.setDate(inicioBloque.getDate() + 1);

        const finBloque = new Date(finVac);
        finBloque.setDate(finBloque.getDate() + 1);
        while (esLibre(finBloque)) finBloque.setDate(finBloque.getDate() + 1);
        finBloque.setDate(finBloque.getDate() - 1);

        const total = Math.round((finBloque.getTime() - inicioBloque.getTime()) / 86400000) + 1;

        const feriadosUsados: string[] = [];
        const f = new Date(inicioBloque);
        while (f <= finBloque) {
          const key = iso(f);
          if (feriados.has(key)) feriadosUsados.push(`${fmtCorto(f)} (${feriados.get(key)})`);
          f.setDate(f.getDate() + 1);
        }

        opciones.push({ inicioVac: new Date(cursor), finVac, inicioBloque, finBloque, total, feriadosUsados });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  if (!opciones.length) {
    return {
      resultado: 0,
      resumen: `No quedan suficientes días hábiles en 2026 para tomar ${n} días de vacaciones desde la fecha elegida.`,
      alternativas: '',
      explicacion: 'Probá con menos días de vacaciones o una fecha anterior.',
    };
  }

  // Mejor opción: máximo total; empate → la más temprana.
  const orden = [...opciones].sort(
    (a, b) => b.total - a.total || a.inicioVac.getTime() - b.inicioVac.getTime()
  );
  const mejor = orden[0];

  // Top alternativas con inicio de bloque distinto (evitar casi-duplicados).
  const vistas = new Set<string>();
  const top: Opcion[] = [];
  for (const o of orden) {
    const key = iso(o.inicioBloque) + '|' + iso(o.finBloque);
    if (vistas.has(key)) continue;
    vistas.add(key);
    top.push(o);
    if (top.length === 3) break;
  }

  const desc = (o: Opcion) =>
    `pedís del ${fmtCorto(o.inicioVac)} al ${fmtCorto(o.finVac)} (${n} días hábiles) y quedás libre del ` +
    `${fmtCorto(o.inicioBloque)} al ${fmtCorto(o.finBloque)}: ${o.total} días seguidos` +
    (o.feriadosUsados.length ? `, aprovechando ${o.feriadosUsados.join(', ')}` : '');

  const resumen =
    `Mejor puente en ${nombrePais} con ${n} días de vacaciones: ${desc(mejor)}. ` +
    `Rendimiento: ${(mejor.total / n).toFixed(1)} días libres por cada día de vacaciones pedido.`;

  const alternativas = top
    .map((o, i) => `${i + 1}. ${desc(o)}`)
    .join('\n');

  const explicacion =
    `El buscador recorre todas las fechas de inicio posibles en lo que resta de 2026: toma ${n} días hábiles de vacaciones desde cada fecha y mide cuántos días seguidos sin trabajar quedan al pegar esas vacaciones con los fines de semana y los feriados oficiales de ${nombrePais}. ` +
    `Gana la ventana con el bloque libre más largo (a igualdad, la más cercana). Solo usa feriados oficiales ya confirmados en el calendario 2026.`;

  return { resultado: mejor.total, resumen, alternativas, explicacion };
}
