#!/usr/bin/env node
/** Fetch independent sources; publish only after the separate sanity gate. */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_NAMES = ['dolar', 'inflacion', 'bcra', 'tasas-billeteras', 'chile', 'colombia', 'mexico', 'peru', 'uruguay', 'paraguay', 'venezuela', 'dominicana'];
const SOURCES = SOURCE_NAMES.map(name => ({
  script: `scripts/data-sources/fetch-${name}.${name === 'dominicana' ? 'py' : 'mjs'}`,
  outputs: [`src/data/live/${name === 'bcra' ? 'tasas' : name}.json`],
}));

function runScript(script) {
  return new Promise(resolve => {
    const child = spawn(script.endsWith('.py') ? 'python3' : 'node', [script], { stdio: 'inherit' });
    child.once('error', () => resolve(1));
    child.once('close', code => resolve(code ?? 1));
  });
}

/** A failed fetch may have written a partial file: restore its exact prior bytes. */
export async function refreshSources(sources, { run = runScript, allowPartial = false } = {}) {
  const paths = sources.flatMap(source => source.outputs);
  if (new Set(paths).size !== paths.length) throw new Error('Sources must own disjoint output paths');
  const results = await Promise.all(sources.map(async source => {
    const previous = await Promise.all(source.outputs.map(async file => {
      try { return { file, bytes: await fs.readFile(file) }; }
      catch (error) { if (error.code === 'ENOENT') return { file, bytes: null }; throw error; }
    }));
    let code;
    try { code = await run(source.script); } catch { code = 1; }
    if (code !== 0) {
      for (const { file, bytes } of previous) {
        if (bytes === null) await fs.rm(file, { force: true });
        else await fs.writeFile(file, bytes);
      }
    }
    return { script: source.script, code, retainedPrevious: code !== 0, outputs: source.outputs };
  }));
  const failed = results.filter(result => result.code !== 0);
  const successCount = results.length - failed.length;
  return {
    status: !failed.length ? 'success' : allowPartial && successCount > 0 ? 'partial' : 'failure',
    successCount, failedCount: failed.length, results,
  };
}

async function main() {
  const allowPartial = process.argv.includes('--allow-partial');
  const reportArg = process.argv.find(arg => arg.startsWith('--report='));
  const report = await refreshSources(SOURCES, { allowPartial });
  if (reportArg) await fs.writeFile(reportArg.slice('--report='.length), JSON.stringify(report, null, 2) + '\n');
  if (report.status === 'failure') {
    console.error(`[fetch-all] ${report.failedCount}/${report.results.length} sources failed; failed outputs restored; no dataset generation`);
    process.exitCode = 1;
    return;
  }
  if (report.status === 'partial') {
    for (const item of report.results.filter(item => item.code !== 0)) {
      console.warn(`::warning::${item.script} failed; previous snapshot retained, including original freshness timestamp.`);
    }
  }
  // Datasets must read the completed snapshots, never race their producers.
  const datasetCode = await runScript('scripts/data-sources/generate-datasets.mjs');
  if (datasetCode !== 0) { process.exitCode = 1; return; }
  console.log(`[fetch-all] ${report.status}: ${report.successCount} sources refreshed, ${report.failedCount} retained; datasets generated afterwards. Sanity gate still required before publication.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error('[fetch-all]', error.message); process.exitCode = 1; });
}
