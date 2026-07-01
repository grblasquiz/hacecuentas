#!/usr/bin/env node
/** Orchestrator: run all data sources in parallel. */
import { spawn } from "node:child_process";

const sources = [
  "scripts/data-sources/fetch-dolar.mjs",
  "scripts/data-sources/fetch-inflacion.mjs",
  "scripts/data-sources/fetch-bcra.mjs",
  "scripts/data-sources/fetch-tasas-billeteras.mjs",
  "scripts/data-sources/fetch-chile.mjs",
  "scripts/data-sources/fetch-colombia.mjs",
  "scripts/data-sources/fetch-mexico.mjs",
  "scripts/data-sources/fetch-peru.mjs",
  "scripts/data-sources/generate-datasets.mjs",
];

async function run(script) {
  return new Promise((resolve) => {
    const p = spawn("node", [script], { stdio: "inherit" });
    p.on("close", (code) => resolve({ script, code }));
  });
}

const results = await Promise.all(sources.map(run));
const failed = results.filter((r) => r.code !== 0);
if (failed.length) {
  console.error(`\n[fetch-all] ${failed.length}/${sources.length} sources failed`);
  process.exit(1);
}
console.log(`\n[fetch-all] ✓ ${sources.length} sources OK`);
