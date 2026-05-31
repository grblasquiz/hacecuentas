#!/usr/bin/env python3
"""
Guard compartido contra falsos 410 en calcs jóvenes / locales secundarios.

CONTEXTO (2026-05-27 → 2026-05-30)
----------------------------------
El barrido `--emit-gone-410` marca como zombie cualquier URL con
clicks==0 AND impressions==0 en GSC. El 2026-05-27 esto barrió 60 de las
88 calcs de España (`src/content/calcs-es/`) como "zombies" cuando en
realidad eran calcs nuevas (abril 2026) que todavía no se habían indexado
— falso positivo. Se revivieron y enriquecieron el 2026-05-30, pero siguen
con ~0 tráfico GSC, así que si el barrido se corre de nuevo con el mismo
umbral las vuelve a 410'ear y se pierde el trabajo.

REGLA
-----
"0 impresiones = zombie" SOLO es válido si la URL tuvo tiempo de indexarse
(>~6 meses) EN UN MERCADO CON AUTORIDAD. Por eso protegemos del 410:

  (a) Locales jóvenes / secundarios sin autoridad propia:
        /es/, /mx/, /co/, /cl/   (siempre)
        /en/, /pt/               (opcional — PRUNE_GUARD_INCLUDE_EN_PT=1,
                                  igual quedan protegidos por edad mientras
                                  sean nuevos)
  (b) Calcs con menos de MIN_AGE_DAYS (~6 meses) desde su publicación:
        `datePublished` del JSON, o (fallback) fecha del primer commit git
        del archivo del calc.

USO
---
    from prune_guard import PruneGuard
    guard = PruneGuard()                       # today = date.today()
    protected, reason = guard.is_protected("/es/calculadora-...")
    if protected:
        excluded.append((path, reason))        # NO 410'ear

CLI
---
    python3 scripts/prune_guard.py --self-test   # asegura que es/mx/co/cl
                                                 # estén 100% protegidos
    python3 scripts/prune_guard.py --report      # resumen por locale
    python3 scripts/prune_guard.py --check /es/foo /calculadora-bar
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src" / "content"

# Locales secundarios SIN autoridad propia (mercados nuevos, abril 2026).
# es/mx/co/cl se bloquean siempre. en/pt son opcionales: por default NO se
# bloquean por locale para no neutralizar el audit de calidad EN/PT
# (apply-en-pt-audit.py), pero igual quedan protegidos por la regla de edad
# mientras sean nuevos. Activar el bloqueo duro con PRUNE_GUARD_INCLUDE_EN_PT=1.
CORE_SECONDARY = ("es", "mx", "co", "cl")
EXTRA_SECONDARY = ("en", "pt")
ALL_LOCALES = CORE_SECONDARY + EXTRA_SECONDARY  # para detección + resolución JSON

DEFAULT_MIN_AGE_DAYS = 180  # ~6 meses

LOCALE_DIR = {
    "es": "calcs-es",
    "mx": "calcs-mx",
    "co": "calcs-co",
    "cl": "calcs-cl",
    "en": "calcs-en",
    "pt": "calcs-pt",
    "ar": "calcs",
}


def locale_of(path: str) -> str:
    """Devuelve el código de locale de una URL: 'es','mx',... o 'ar' (root)."""
    parts = path.strip("/").split("/")
    if len(parts) >= 2 and parts[0] in ALL_LOCALES:
        return parts[0]
    return "ar"


def slug_of(path: str, locale: str | None = None) -> str | None:
    """Devuelve el slug del calc desde la URL (sin prefijo de locale)."""
    if locale is None:
        locale = locale_of(path)
    parts = path.strip("/").split("/")
    if not parts or not parts[0]:
        return None
    if locale != "ar":
        return parts[1] if len(parts) >= 2 else None
    return parts[0]


class PruneGuard:
    """Decide si una URL está protegida de pasar a 410 Gone.

    Cachea el slug→Path por directorio y el mapa git first-commit (un solo
    `git log`) para no spawnear un subproceso por URL.
    """

    def __init__(
        self,
        today: date | None = None,
        min_age_days: int = DEFAULT_MIN_AGE_DAYS,
        include_en_pt: bool | None = None,
    ) -> None:
        self.today = today or date.today()
        self.min_age_days = min_age_days
        self.cutoff = self.today - timedelta(days=min_age_days)
        if include_en_pt is None:
            include_en_pt = os.environ.get("PRUNE_GUARD_INCLUDE_EN_PT", "").lower() in (
                "1",
                "true",
                "yes",
            )
        self.include_en_pt = include_en_pt
        self.block_locales = set(CORE_SECONDARY)
        if include_en_pt:
            self.block_locales |= set(EXTRA_SECONDARY)
        self._slugmap: dict[str, dict[str, Path]] = {}
        self._gitmap: dict[str, str] | None = None

    # ---- resolución JSON ----------------------------------------------------

    def _dir_slugmap(self, dirname: str) -> dict[str, Path]:
        if dirname not in self._slugmap:
            m: dict[str, Path] = {}
            d = CONTENT / dirname
            if d.is_dir():
                for f in d.glob("*.json"):
                    m[f.stem] = f
            self._slugmap[dirname] = m
        return self._slugmap[dirname]

    def _json_for(self, locale: str, slug: str) -> Path | None:
        dirname = LOCALE_DIR.get(locale, "calcs")
        return self._dir_slugmap(dirname).get(slug)

    # ---- edad ---------------------------------------------------------------

    @staticmethod
    def _date_published(jf: Path) -> date | None:
        try:
            d = json.loads(jf.read_text(encoding="utf-8"))
        except Exception:
            return None
        dp = d.get("datePublished")
        if not dp:
            return None
        try:
            return date.fromisoformat(str(dp)[:10])
        except ValueError:
            return None

    def _build_gitmap(self) -> dict[str, str]:
        """Mapa {ruta-relativa-al-repo: fecha-ISO del primer commit que la agregó}.

        Un único `git log --reverse --diff-filter=A` sobre src/content. Con
        --reverse (más viejo primero) + setdefault, la primera vez que vemos un
        path = su add más antiguo.
        """
        m: dict[str, str] = {}
        try:
            out = subprocess.run(
                [
                    "git",
                    "-C",
                    str(ROOT),
                    "log",
                    "--reverse",
                    "--diff-filter=A",
                    "--name-only",
                    "--format=__C__%aI",
                    "--",
                    "src/content",
                ],
                capture_output=True,
                text=True,
                timeout=120,
            ).stdout
        except Exception:
            return m
        cur: str | None = None
        for line in out.splitlines():
            if line.startswith("__C__"):
                cur = line[5:][:10]  # YYYY-MM-DD
            elif line and "/" in line and cur:
                m.setdefault(line.strip(), cur)
        return m

    def _git_first_commit(self, jf: Path) -> date | None:
        if self._gitmap is None:
            self._gitmap = self._build_gitmap()
        try:
            rel = str(jf.relative_to(ROOT))
        except ValueError:
            return None
        s = self._gitmap.get(rel)
        if not s:
            return None
        try:
            return date.fromisoformat(s)
        except ValueError:
            return None

    def _published_date(self, jf: Path) -> tuple[date | None, str | None]:
        d = self._date_published(jf)
        if d:
            return d, "datePublished"
        d = self._git_first_commit(jf)
        if d:
            return d, "git-first-commit"
        return None, None

    # ---- decisión -----------------------------------------------------------

    def is_protected(self, path: str) -> tuple[bool, str | None]:
        """(protegido?, motivo). Motivo None si no está protegido."""
        locale = locale_of(path)

        # Regla (a): locale secundario sin autoridad → nunca 410 por tráfico.
        if locale in self.block_locales:
            return True, f"locale-secundario:{locale}"

        # Regla (b): calc demasiado nueva para confiar en "0 impresiones".
        slug = slug_of(path, locale)
        if slug:
            jf = self._json_for(locale, slug)
            if jf:
                pub, src = self._published_date(jf)
                if pub and pub > self.cutoff:
                    age = (self.today - pub).days
                    return (
                        True,
                        f"calc-joven:{src}={pub.isoformat()}({age}d<{self.min_age_days}d)",
                    )
        return False, None

    def filter_gone(self, paths) -> tuple[list[str], list[tuple[str, str]]]:
        """Parte una lista de URLs en (a-410, excluidas[(url,motivo)])."""
        keep: list[str] = []
        excluded: list[tuple[str, str]] = []
        for p in paths:
            prot, reason = self.is_protected(p)
            if prot:
                excluded.append((p, reason or "protegido"))
            else:
                keep.append(p)
        return keep, excluded


# ---- CLI: self-test / report / check -----------------------------------------


def _all_urls_for(locale: str) -> list[str]:
    dirname = LOCALE_DIR[locale]
    d = CONTENT / dirname
    if not d.is_dir():
        return []
    prefix = "" if locale == "ar" else f"/{locale}"
    return [f"{prefix}/{f.stem}" for f in sorted(d.glob("*.json"))]


def _self_test(guard: PruneGuard) -> int:
    """Asegura que TODA calc de locale secundario core (es/mx/co/cl) esté
    protegida. Falla (exit 1) si alguna quedaría expuesta al 410."""
    ok = True
    print(f"prune_guard self-test  (today={guard.today}, cutoff={guard.cutoff})\n")
    for loc in CORE_SECONDARY:
        urls = _all_urls_for(loc)
        if not urls:
            print(f"  {loc}: (sin calcs)")
            continue
        exposed = [u for u in urls if not guard.is_protected(u)[0]]
        sample = guard.is_protected(urls[0])[1]
        status = "OK" if not exposed else f"FALLO ({len(exposed)} expuestas)"
        print(f"  {loc}: {len(urls):3} calcs · protegidas · {status}")
        print(f"        ej: {urls[0]}  →  {sample}")
        if exposed:
            ok = False
            for u in exposed[:10]:
                print(f"        EXPUESTA: {u}")
    # en/pt: informativo (protegidos por edad mientras sean nuevos)
    for loc in EXTRA_SECONDARY:
        urls = _all_urls_for(loc)
        if not urls:
            continue
        prot = sum(1 for u in urls if guard.is_protected(u)[0])
        print(
            f"  {loc}: {prot}/{len(urls)} protegidas "
            f"({'locale+edad' if guard.include_en_pt else 'solo edad'})"
        )
    print("\nRESULTADO:", "PASS ✅" if ok else "FAIL ❌")
    return 0 if ok else 1


def _report(guard: PruneGuard) -> int:
    print(f"prune_guard report  (today={guard.today}, min_age={guard.min_age_days}d)\n")
    print(f"  locales bloqueados por regla (a): {sorted(guard.block_locales)}")
    print(f"  cutoff edad (regla b): publicado después de {guard.cutoff} = protegido\n")
    for loc in ("ar",) + ALL_LOCALES:
        urls = _all_urls_for(loc)
        if not urls:
            continue
        prot = sum(1 for u in urls if guard.is_protected(u)[0])
        print(f"  {LOCALE_DIR[loc]:10} ({loc}): {prot:4}/{len(urls):4} protegidas")
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--self-test", action="store_true", help="Asegura es/mx/co/cl 100% protegidos (exit 1 si no)")
    ap.add_argument("--report", action="store_true", help="Resumen de protección por locale")
    ap.add_argument("--check", nargs="+", metavar="PATH", help="Chequear URLs puntuales")
    ap.add_argument("--min-age-days", type=int, default=DEFAULT_MIN_AGE_DAYS)
    ap.add_argument("--include-en-pt", action="store_true", help="Bloquear en/pt por locale (regla a)")
    args = ap.parse_args(argv)

    guard = PruneGuard(
        min_age_days=args.min_age_days,
        include_en_pt=True if args.include_en_pt else None,
    )

    if args.check:
        for p in args.check:
            prot, reason = guard.is_protected(p)
            mark = "PROTEGIDA" if prot else "410-elegible"
            print(f"  {mark:13} {p}  →  {reason or '-'}")
        return 0
    if args.report:
        return _report(guard)
    # default → self-test
    return _self_test(guard)


if __name__ == "__main__":
    raise SystemExit(main())
