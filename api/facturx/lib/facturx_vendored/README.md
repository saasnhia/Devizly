# factur-x (vendored, patched)

Vendored copy of the Akretion factur-x Python library v4.2, patched to
remove the saxonche dependency that pushes Vercel Python function
bundles over the 250 MB unzipped limit.

## Why vendor?

factur-x v4.2 declares `saxonche` as a hard `Requires-Dist`. Saxonche
ships a ~100 MB Saxon HE C library DLL used only for Schematron
validation (`xml_check_schematron` function). Our code never calls
that function — we pass `check_schematron=False` everywhere.

A previous attempt with a local `api/facturx/saxonche/__init__.py` stub
was insufficient: pip still installed the real saxonche at build time,
regardless of Python import shadowing at runtime. The only clean way to
exclude saxonche from the Vercel bundle is to not depend on factur-x
via pip at all, and instead vendor its source code directly —
removing the saxonche references along the way.

## Bundle size impact

| What | Before | After | Savings |
|------|--------|-------|---------|
| `facturx/facturx.py` + `__init__.py` | 60 KB | 60 KB (patched) | 0 |
| `facturx/xsd/` (all profiles + Order-X) | ~62 MB | ~90 KB (BASIC only) | ~62 MB |
| `saxonche/` (pip, Saxon HE C DLL) | ~100 MB | 0 (not installed) | ~100 MB |
| `Pillow` (pip, only used at build time) | ~16 MB | 0 (removed) | ~16 MB |
| **Total** | **~178 MB** | **~100 KB** | **~178 MB** |

## What's patched

1. `import saxonche` removed from `facturx.py` (line 37 in the original)
2. `VERSION = importlib.metadata.version("factur-x")` → `VERSION = "4.2-vendored"`
   (we don't have a pip-installed factur-x package to read metadata from)
3. `def xml_check_schematron(...)` (lines 218-353 in the original, 138 lines)
   replaced by a stub that raises `NotImplementedError`
4. `FACTURX_LEVEL2xsd` dict trimmed to only the `'basic'` entry
5. `ORDERX_LEVEL2xsd` dict emptied
6. `__init__.py` no longer re-exports `xml_check_schematron`
7. Only `xsd/facturx-basic/Factur-X_1.08_BASIC*.xsd` files are shipped
   (compiled Schematron `.xsl`, `.sef`, `.xml` files dropped too — they
   were only used by `xml_check_schematron`)

## Constraints on callers

- Always pass `level='basic'` explicitly (autodetection via `get_level()`
  still works and will return `'basic'` for our CII XML)
- Always pass `check_schematron=False`
- Never call `xml_check_schematron()` directly

## Re-vendoring procedure (when upgrading factur-x)

1. Install the target version in a clean venv:
   ```
   python -m venv .tmp-venv
   .tmp-venv/Scripts/pip install factur-x==<new_version>
   ```
2. Copy the new source files into this directory:
   ```
   cp .tmp-venv/Lib/site-packages/facturx/facturx.py ./facturx.py
   ```
3. Re-apply the 7 patches listed above
4. Copy the new `facturx-basic/*.xsd` files into `xsd/facturx-basic/`
5. Test locally via the POC venv:
   ```
   C:/finpilote/facturx-poc-python/venv/Scripts/python.exe \
     scripts/test-vendored.py
   ```
6. Commit with the Akretion source version in the commit message

## Source

https://github.com/akretion/factur-x/tree/v4.2
