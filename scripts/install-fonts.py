"""Install the GT Eesti Text web fonts as desktop fonts, for the PDF page header. Requires fonttools and brotli."""

from pathlib import Path

from fontTools.ttLib import TTFont

destination = Path.home() / ".local" / "share" / "fonts"
destination.mkdir(parents=True, exist_ok=True)

for name in ("GT-Eesti-Text-Regular", "GT-Eesti-Text-Bold"):
    font = TTFont(Path(__file__).parent.parent / "public" / "fonts" / f"{name}.woff2")
    font.flavor = None
    font.save(destination / f"{name}.otf")
