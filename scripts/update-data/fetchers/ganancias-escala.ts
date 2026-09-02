/** Verificación determinística de Ganancias contra los PDF oficiales de ARCA. */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GANANCIAS_2026, GANANCIAS_2026_DEDUCCIONES } from '../../../src/lib/data/ganancias-2026.ts';
import { createLogger } from '../utils/logger.ts';
import { reportMode } from '../utils/run-status.ts';

const log = createLogger('ganancias-escala');
const ROOT = process.cwd();
const EXTRACTOR = join(ROOT, 'scripts/data-sources/fetch-arca-ganancias.py');
const SNAPSHOT = join(ROOT, 'db/data-sources/arca-ganancias-jul-dic-2026.json');

type Snapshot = {
  deducciones_anual: Record<string, number>;
  escala_anual: Array<{ desde: number; hasta: number | null; monto_fijo: number; porcentaje: number }>;
  sources: { escala_url: string; deducciones_url: string };
};

const close = (a: number, b: number) => Math.abs(a - b) < 0.011;

export async function fetchGananciasEscala({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const run = spawnSync('python3', [EXTRACTOR], { cwd: ROOT, encoding: 'utf8', timeout: 120_000 });
  if (run.status !== 0) throw new Error(`extractor ARCA falló: ${(run.stderr || run.stdout).slice(0, 500)}`);

  const snap = JSON.parse(readFileSync(SNAPSHOT, 'utf8')) as Snapshot;
  const d = snap.deducciones_anual;
  const expected = GANANCIAS_2026_DEDUCCIONES.second;
  const pairs: Array<[string, number, number]> = [
    ['GNI', d.mni, expected.gni],
    ['cónyuge', d.conyuge, expected.conyuge],
    ['hijo', d.hijo, expected.hijo],
    ['hijo incapacitado', d.hijo_incapacitado, expected.hijoIncapacitado],
    ['deducción especial autónomos', d.deduccion_especial_apartado_1, expected.especialAutonomos],
    ['deducción especial empleados', d.deduccion_especial_apartado_2, expected.especialEmpleados],
  ];
  for (const [name, official, local] of pairs) {
    if (!close(official, local)) throw new Error(`${name}: ARCA=${official} pero sitio=${local}`);
  }

  const localScale = GANANCIAS_2026.second;
  if (snap.escala_anual.length !== localScale.length) throw new Error('cantidad de tramos distinta de ARCA');
  snap.escala_anual.forEach((row, i) => {
    const [desde, hasta, fijo, tasa] = localScale[i];
    const officialHasta = row.hasta ?? Infinity;
    if (!close(row.desde, desde) || !(officialHasta === hasta || close(officialHasta, hasta)) ||
        !close(row.monto_fijo, fijo) || !close(row.porcentaje / 100, tasa)) {
      throw new Error(`tramo ${i + 1} diverge de la tabla oficial ARCA`);
    }
  });

  reportMode('ganancias-escala', 'deterministic');
  log.success(`escala y deducciones julio-diciembre verificadas contra ARCA (${dry ? 'dry' : 'sin diferencias'})`);
  log.info(`fuentes: ${snap.sources.escala_url} · ${snap.sources.deducciones_url}`);
  return false;
}
