import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('bing_gate', Path(__file__).resolve().parents[1] / 'scripts/audit-bing-build.py')
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)

class BuildGateTests(unittest.TestCase):
    def fixture(self, root, html):
        ns = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
        (root / 'sitemap.xml').write_text(f'<sitemapindex {ns}><sitemap><loc>https://hacecuentas.com/sitemap-core.xml</loc></sitemap></sitemapindex>')
        (root / 'sitemap-core.xml').write_text(f'<urlset {ns}><url><loc>https://hacecuentas.com/</loc></url></urlset>')
        (root / 'sitemap-fresh.xml').write_text(f'<urlset {ns}></urlset>')
        key = '00e48c587b06495db41032c4797d9d39'
        (root / (key + '.txt')).write_text(key)
        (root / 'index.html').write_text(html)

    def test_accepts_canonical_indexable_page(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            self.fixture(root, '<title>Calculadora</title><meta name="description" content="Descripción"><link rel="canonical" href="https://hacecuentas.com/"><h1>Calculadora</h1>')
            self.assertEqual(gate.audit(root)['failures'], [])

    def test_rejects_noindex_wrong_canonical_and_invalid_schema(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            self.fixture(root, '<title>Calculadora</title><meta name="robots" content="noindex"><link rel="canonical" href="https://hacecuentas.com/otra"><script type="application/ld+json">{bad}</script>')
            errors = '\n'.join(gate.audit(root)['failures'])
            for issue in ['noindex in sitemap', 'canonical mismatch', 'invalid H1', 'missing description', 'invalid JSON-LD']:
                self.assertIn(issue, errors)

if __name__ == '__main__':
    unittest.main()
