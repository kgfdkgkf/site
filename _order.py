# -*- coding: utf-8 -*-
"""Пересобрать порядок блоков главной: hero → бегущая → Главное сейчас → ..."""
import re

P = r"C:\Users\arosl\Desktop\site\index.html"
s = open(P, encoding="utf-8").read()
m0 = s.find("<main>") + len("<main>")
m1 = s.find("</main>")
inner = s[m0:m1]

# 1) вырезаем бегущие строки (div) — до следующего <section
def cut_div(src, marker):
    i = src.find(marker)
    if i < 0:
        return src, None
    j = src.find("<section", i)
    if j < 0:
        j = len(src)
    return src[:i] + src[j:], src[i:j].strip()

inner, mob = cut_div(inner, '<div class="marquee marquee--mob"')
inner, desk = cut_div(inner, '<div class="marquee marquee--desk"')

# 2) нарезаем секции: от <section до ближайшего </section>
blocks = []
i = 0
while True:
    st = inner.find("<section", i)
    if st < 0:
        break
    en = inner.find("</section>", st)
    if en < 0:
        break
    en += len("</section>")
    blocks.append(inner[st:en])
    i = en

# 3) определяем ключ каждой секции
def key(b):
    head = b[:220]
    m = re.search(r'id="([^"]+)"', head)
    if m:
        return m.group(1)
    if "class=\"hero" in b or "hero__grid" in b:
        return "hero"
    return "other"

byk = {}
for b in blocks:
    k = key(b)
    if k not in byk:
        byk[k] = b

order = ["hero", "glavnoe", "svezhie", "razdely", "afisha", "podpiska"]
parts = []
if mob:
    parts.append(mob)
for k in order:
    if k == "glavnoe" and desk:
        parts.append(desk)
    if k in byk:
        parts.append(byk[k])
if desk and "glavnoe" not in byk:
    parts.insert(1, desk)

# остальные секции (если есть) — в конец
for b in blocks:
    if key(b) not in order and key(b) != "other":
        parts.append(b)

new = s[:m0] + "\n\n" + "\n\n".join(parts) + "\n\n" + s[m1:]
open(P, "w", encoding="utf-8", newline="\n").write(new)

print("секции:", list(byk.keys()))
print("блоков:", len(parts), "| mob:", bool(mob), "| desk:", bool(desk))
