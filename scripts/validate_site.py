#!/usr/bin/env python3
"""Fast structural checks for the static ME Shield site."""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parent.parent
CANONICAL_ORIGIN = "https://meshieldfinancial.com"


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.hrefs = []
        self.jsonld = []
        self._in_jsonld = False
        self._jsonld_parts = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and attrs.get("href"):
            self.hrefs.append(attrs["href"])
        if tag == "link" and "canonical" in attrs.get("rel", "").lower():
            self.canonicals.append(attrs.get("href", ""))
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self._in_jsonld = True
            self._jsonld_parts = []

    def handle_data(self, data):
        if self._in_jsonld:
            self._jsonld_parts.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._in_jsonld:
            self.jsonld.append("".join(self._jsonld_parts))
            self._in_jsonld = False


def target_exists(href):
    parsed = urlparse(href)
    if parsed.scheme or href.startswith(("#", "mailto:", "tel:", "javascript:")):
        return True
    path = parsed.path
    if not path or path == "/":
        return (ROOT / "index.html").exists()
    relative = path.lstrip("/")
    return (ROOT / relative).exists() or (ROOT / (relative + ".html")).exists()


def main():
    errors = []
    html_files = sorted(ROOT.glob("*.html"))
    for html_file in html_files:
        parser = PageParser()
        parser.feed(html_file.read_text(encoding="utf-8"))
        for href in parser.hrefs:
            if re.search(r"(?:^|/)index\.html(?:$|[?#])", href):
                errors.append(f"{html_file.name}: links to index.html: {href}")
            elif re.search(r"\.html(?:$|[?#])", href) and not urlparse(href).scheme:
                errors.append(f"{html_file.name}: internal .html link: {href}")
            elif not target_exists(href):
                errors.append(f"{html_file.name}: missing internal target: {href}")
        if html_file.name not in {"404.html"}:
            if len(parser.canonicals) != 1:
                errors.append(f"{html_file.name}: expected one canonical, found {len(parser.canonicals)}")
            elif not parser.canonicals[0].startswith(CANONICAL_ORIGIN):
                errors.append(f"{html_file.name}: invalid canonical: {parser.canonicals[0]}")
        for raw_jsonld in parser.jsonld:
            try:
                json.loads(raw_jsonld)
            except json.JSONDecodeError as exc:
                errors.append(f"{html_file.name}: invalid JSON-LD: {exc}")

    sitemap = ElementTree.parse(ROOT / "sitemap.xml")
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_urls = [loc.text for loc in sitemap.findall("sm:url/sm:loc", ns)]
    for url in sitemap_urls:
        if not url.startswith(CANONICAL_ORIGIN + "/"):
            errors.append(f"sitemap.xml: non-canonical origin: {url}")
            continue
        relative = url[len(CANONICAL_ORIGIN):].lstrip("/")
        target = ROOT / ("index.html" if not relative else relative + ".html")
        if not target.exists():
            errors.append(f"sitemap.xml: missing page for {url}")

    redirects = (ROOT / "_redirects").read_text(encoding="utf-8")
    for expected in (
        "/index.html / 301",
        "/paralegal-immigration /immigration-forms 301",
        "/paralegal-immigration.html /immigration-forms 301",
    ):
        if expected not in redirects:
            errors.append(f"_redirects: missing rule: {expected}")

    if errors:
        print("Site validation failed:")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    print(f"Site validation passed: {len(html_files)} HTML files, {len(sitemap_urls)} sitemap URLs.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
