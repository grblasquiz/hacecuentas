/** Aplica únicamente tramos que ya publicó el Consejo del Salario. */
import { join } from 'node:path';
import { SMVM_CRONOGRAMA, SMVM_PERIODO_PUBLICADO, SMVM_NORMAS } from '../../../src/lib/data/smvm-ar-2026.ts';
import { replaceStringConst } from '../patchers/ts-constant.ts';
import { reportMode, reportWarn } from '../utils/run-status.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('smvm');
const file = join(process.cwd(), 'src/lib/data/smvm-ar-2026.ts');

export async function fetchSmvm({ dry = false, now = new Date() }: { dry?: boolean; now?: Date }): Promise<boolean> {
  // sv-SE dispone año y mes como AAAA-MM; la vigencia cambia a medianoche en Argentina.
  const periodo = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit',
  }).format(now);
  const tramo = SMVM_CRONOGRAMA.find((row) => row.periodo === periodo);
  if (!tramo) {
    reportMode('smvm', 'pending');
    reportWarn('smvm', `No hay tramo publicado para ${periodo}; se conserva ${SMVM_PERIODO_PUBLICADO}. Verificar nuevas resoluciones.`);
    return false;
  }
  reportMode('smvm', 'deterministic');
  if (tramo.periodo <= SMVM_PERIODO_PUBLICADO) {
    log.skip('sin cambios');
    return false;
  }
  log.info(`${tramo.periodo}: ${tramo.mensual} ARS/mes y ${tramo.hora} ARS/h según ${SMVM_NORMAS[tramo.norma].nombre}`);
  if (dry) return true;
  return replaceStringConst(file, 'SMVM_PERIODO_PUBLICADO', tramo.periodo).changed;
}
