#!/usr/bin/env python3
"""Extract article metadata and Portable Text blocks from Soft-Tech HTML exports."""
import json
import re
import sys
from html import unescape
from pathlib import Path

try:
    from html.parser import HTMLParser
except ImportError:
    pass


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = (
        text.replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("ñ", "n")
        .replace("ü", "u")
    )
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def strip_tags(html: str) -> str:
    html = re.sub(r"<script[\s\S]*?</script>", "", html, flags=re.I)
    html = re.sub(r"<style[\s\S]*?</style>", "", html, flags=re.I)
    text = re.sub(r"<br\s*/?>", "\n", html, flags=re.I)
    text = re.sub(r"</p>", "\n\n", text, flags=re.I)
    text = re.sub(r"</h2>", "\n\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = unescape(text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_tags(html: str):
    m = re.search(r'<div class="tags">([\s\S]*?)</div>', html, re.I)
    if not m:
        return []
    tags = re.findall(r'<span class="tag">([^<]+)</span>', m.group(1))
    return [t.strip() for t in tags]


def extract_article_body(html: str) -> str:
    m = re.search(r'<article class="article-body">([\s\S]*?)</article>', html, re.I)
    if not m:
        return ""
    body = m.group(1)
    # Remove non-content blocks
    for cls in ("chart-card", "cta-final", "tags", "regional", "vault-pillars", "cost-grid"):
        body = re.sub(rf'<div class="{cls}"[\s\S]*?</div>', "", body, flags=re.I)
    body = re.sub(r"<blockquote[^>]*>[\s\S]*?</blockquote>", "", body, flags=re.I)
    body = re.sub(r'<div class="(callout-gold|insight)"[\s\S]*?</div>', "", body, flags=re.I)
    return body


def blocks_from_body(body_html: str):
    blocks = []
    key = 0

    def span(text: str, marks=None):
        s = {"_type": "span", "text": text, "_key": f"s{key}"}
        if marks:
            s["marks"] = marks
        return s

    def block(text, style="normal", marks=None):
        nonlocal key
        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            return None
        b = {
            "_type": "block",
            "style": style,
            "children": [span(text, marks)],
            "_key": f"k{key}",
        }
        key += 1
        return b

    parts = re.split(r"(<h2[^>]*>[\s\S]*?</h2>)", body_html, flags=re.I)
    for part in parts:
        part = part.strip()
        if not part:
            continue
        if re.match(r"<h2", part, re.I):
            h = strip_tags(part)
            b = block(h, "h2")
            if b:
                blocks.append(b)
            continue
        paragraphs = re.findall(r"<p[^>]*>([\s\S]*?)</p>", part, flags=re.I)
        for p in paragraphs:
            plain = strip_tags(p)
            if not plain:
                continue
            # Preserve simple strong emphasis inline as bold spans
            if "<strong>" in p.lower():
                children = []
                segments = re.split(r"(<strong>[\s\S]*?</strong>)", p, flags=re.I)
                for seg in segments:
                    if not seg.strip():
                        continue
                    if re.match(r"<strong>", seg, re.I):
                        children.append(span(strip_tags(seg), ["strong"]))
                    else:
                        t = strip_tags(seg)
                        if t:
                            children.append(span(t))
                if children:
                    blocks.append(
                        {
                            "_type": "block",
                            "style": "normal",
                            "children": children,
                            "_key": f"k{key}",
                        }
                    )
                    key += 1
            else:
                b = block(plain)
                if b:
                    blocks.append(b)

    return blocks


def meta_description(first_para: str, cta_hint: str = "") -> str:
    text = re.sub(r"\s+", " ", first_para).strip()
    if len(text) > 155:
        cut = text[:155].rsplit(" ", 1)[0]
        text = cut + "…"
    if len(text) < 120 and cta_hint:
        text = f"{text} {cta_hint}"
    if len(text) > 160:
        text = text[:157].rsplit(" ", 1)[0] + "…"
    return text


def parse_file(path: Path) -> dict:
    html = path.read_text(encoding="utf-8")
    title_m = re.search(r"<title>([^<]+)</title>", html, re.I)
    title_raw = title_m.group(1).strip() if title_m else path.stem
    title = re.sub(r"\s*·\s*Soft-Tech.*$", "", title_raw, flags=re.I).strip()

    body_html = extract_article_body(html)
    paragraphs = re.findall(r"<p[^>]*>([\s\S]*?)</p>", body_html, flags=re.I)
    first_para = strip_tags(paragraphs[0]) if paragraphs else ""

    tags = extract_tags(html)
    blocks = blocks_from_body(body_html)

    return {
        "title": title,
        "slug": slugify(title),
        "tags": tags,
        "excerpt": meta_description(first_para),
        "first_paragraph": first_para,
        "content": blocks,
    }


if __name__ == "__main__":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    data = parse_file(Path(sys.argv[1]))
    print(json.dumps(data, ensure_ascii=False, indent=2))
