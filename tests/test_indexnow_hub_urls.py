#!/usr/bin/env python3
"""Regresiones del detector IndexNow para hubs globales y regionales."""

import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location(
    "indexnow_push", ROOT / "scripts" / "indexnow-push.py"
)
INDEXNOW = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(INDEXNOW)


class Completed:
    def __init__(self, stdout: str):
        self.stdout = stdout


class HubUrlDetectionTests(unittest.TestCase):
    def detect(self, relative_path: str, expected_url: str):
        with (
            patch.object(INDEXNOW.subprocess, "run", return_value=Completed(relative_path + "\n")),
            patch.object(INDEXNOW, "all_sitemap_urls", return_value={expected_url}),
        ):
            self.assertEqual(INDEXNOW.urls_from_git_diff("before", "after"), [expected_url])

    def test_global_hub_uses_slug_as_complete_route(self):
        self.detect(
            "src/lib/hubs/aguinaldo.ts",
            "https://hacecuentas.com/trabajo/aguinaldo",
        )

    def test_regional_hub_does_not_duplicate_locale(self):
        self.detect(
            "src/lib/hubs/uy/estudio-y-vida-cotidiana.ts",
            "https://hacecuentas.com/uy/trabajo/estudio-y-vida-cotidiana",
        )


if __name__ == "__main__":
    unittest.main()
