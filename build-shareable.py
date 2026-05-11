"""
Build a single-file shareable HTML from app.html source.
Inlines: styles.css, all jsx components, edward.jpg (base64), 5 SVG avatars.
Keeps React/ReactDOM/Babel as CDN refs (recipient needs internet).

Output: BeyondPath-prototype.html (~240 KB)
"""
import base64
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(ROOT, "app.html")
OUT  = os.path.join(ROOT, "BeyondPath-prototype.html")

def read_text(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def read_bytes(path):
    with open(path, "rb") as f:
        return f.read()

def b64_data_url(path, mime):
    return f"data:{mime};base64," + base64.b64encode(read_bytes(path)).decode("ascii")

def main():
    html = read_text(SRC)

    # 1. Inline styles.css
    css = read_text(os.path.join(ROOT, "components", "styles.css"))
    html = html.replace(
        '<link rel="stylesheet" href="components/styles.css">',
        f'<style data-inlined="components/styles.css">\n{css}\n</style>',
    )

    # 2. Inline jsx scripts
    jsx_files = [
        "components/data.standalone.jsx",
        "components/app2.jsx",
        "components/steps-5-8.jsx",
        "components/steps-9-12.jsx",
        "components/worker.jsx",
        "components/journey.jsx",
        "components/shell.standalone.jsx",
    ]
    for rel in jsx_files:
        src_tag = f'<script type="text/babel" src="{rel}"></script>'
        body = read_text(os.path.join(ROOT, rel))
        # Defensive: escape any literal </script> inside jsx (none today, but future-proof)
        body = body.replace("</script>", "<\\/script>")
        replacement = f'<script type="text/babel" data-inlined="{rel}">\n{body}\n</script>'
        if src_tag not in html:
            print(f"  ! tag not found for {rel}")
            sys.exit(1)
        html = html.replace(src_tag, replacement)

    # 3. Inline assets (edward.jpg + 5 SVG avatars) into __resources
    edward_url = b64_data_url(os.path.join(ROOT, "assets", "edward.jpg"), "image/jpeg")
    svg_urls = {}
    for name in ["avArc", "avJay", "avMei", "avNoa", "avRen"]:
        svg_urls[name] = b64_data_url(
            os.path.join(ROOT, "assets", f"{name}.svg"),
            "image/svg+xml"
        )

    # Replace the resource shim block
    new_resources = (
        "  window.__resources = {\n"
        f'    avEdward: "{edward_url}",\n'
        f'    avArc:    "{svg_urls["avArc"]}",\n'
        f'    avJay:    "{svg_urls["avJay"]}",\n'
        f'    avMei:    "{svg_urls["avMei"]}",\n'
        f'    avNoa:    "{svg_urls["avNoa"]}",\n'
        f'    avRen:    "{svg_urls["avRen"]}"\n'
        "  };"
    )
    html = re.sub(
        r"  window\.__resources = \{[\s\S]*?\};",
        new_resources.replace("\\", "\\\\"),
        html,
        count=1,
    )

    # Update title to make it unambiguous
    html = html.replace(
        "<title>BeyondPath · App</title>",
        "<title>BeyondPath · Client⇄Worker Prototype</title>",
    )

    # Write output
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    size_kb = os.path.getsize(OUT) / 1024
    print(f"Built: {OUT}")
    print(f"Size:  {size_kb:.1f} KB")

if __name__ == "__main__":
    main()
