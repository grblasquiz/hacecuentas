#!/usr/bin/env python3
"""Read-only, fixed cohort inspection. Keeps failures separate from non-indexed URLs."""
import argparse
import importlib.util
import json
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    baseline = json.loads((ROOT / 'docs/seo-recovery/baseline-2026-09-09.json').read_text())
    spec = importlib.util.spec_from_file_location('coverage', ROOT / 'scripts/gsc-coverage-audit.py')
    coverage = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(coverage)
    def inspect(previous):
        current = coverage.inspect_url_threadsafe(previous['url']) or {'url': previous['url'], 'error': 'Empty response'}
        return {**current, 'group': previous['group'], 'baseline_verdict': previous.get('verdict'),
                'baseline_coverage_state': previous.get('coverage_state')}
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(inspect, baseline['urls']))
    groups = {}
    for group in sorted({r['group'] for r in results}):
        rows = [r for r in results if r['group'] == group]
        groups[group] = {'total': len(rows), 'errors': sum(bool(r.get('error')) for r in rows),
                         'indexed': sum(r.get('verdict') == 'PASS' for r in rows),
                         'baseline_indexed': sum(r.get('baseline_verdict') == 'PASS' for r in rows),
                         'states': dict(Counter(r.get('coverage_state', 'API error') for r in rows))}
    report = {'observed': datetime.now(timezone.utc).isoformat(), 'baseline_date': baseline['observed'],
              'note': baseline['note'], 'groups': groups, 'urls': results}
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(groups, ensure_ascii=False, indent=2))
    if any(r.get('error') for r in results):
        raise SystemExit('Some inspection requests failed; see artifact. Do not count errors as deindexing.')

if __name__ == '__main__':
    main()
