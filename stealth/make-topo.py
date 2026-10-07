"""THE SURVEY. Contour maps for the stealth page and the LinkedIn banner, from one terrain recipe.

A summit, a few hills and a saddle, low-frequency value noise for the wobble - damped near the summit so
the rings around it stay clean - traced with marching squares, simplified, and smoothed into cubic
Beziers. Lines are sorted into three inks the way a survey sheet sorts them: every fifth level is an
index contour, and the rest alternate slate and blue.

    python3 stealth/make-topo.py

writes stealth/topo-page.svg (inlined into stealth/index.html) and stealth/topo-banner.svg (rendered
to PNG by scripts/make-stealth-banner.mjs). Needs numpy.
"""
import numpy as np
from pathlib import Path

HERE = Path(__file__).parent


def terrain(W, H, summit, hills, seed, S=8, calm=420, wobble=1.0):
    nx, ny = W // S + 1, H // S + 1
    X, Y = np.meshgrid(np.arange(nx) * S, np.arange(ny) * S)
    sx, sy, ax, ay = summit
    f = np.exp(-(((X - sx) / ax) ** 2 + ((Y - sy) / ay) ** 2))
    for cx, cy, rx, ry, a in hills:
        f += a * np.exp(-(((X - cx) / rx) ** 2 + ((Y - cy) / ry) ** 2))

    def vnoise(scale, amp, s):
        g = np.random.default_rng(s).standard_normal((int(H / scale) + 3, int(W / scale) + 3))
        u, v = X / scale, Y / scale
        i, j = np.floor(u).astype(int), np.floor(v).astype(int)
        fu, fv = u - i, v - j
        su, sv = fu * fu * (3 - 2 * fu), fv * fv * (3 - 2 * fv)
        a, b, c, d = g[j, i], g[j, i + 1], g[j + 1, i], g[j + 1, i + 1]
        return amp * ((a * (1 - su) + b * su) * (1 - sv) + (c * (1 - su) + d * su) * sv)

    noise = vnoise(380, .10, seed) + vnoise(170, .045, seed + 2) + vnoise(80, .012, seed + 6)
    damp = 1 - np.exp(-(((X - sx) ** 2 + (Y - sy) ** 2) / calm ** 2))
    return f + wobble * noise * (0.15 + 0.85 * damp), S


TABLE = {1: [('l', 'b')], 2: [('b', 'r')], 3: [('l', 'r')], 4: [('t', 'r')], 5: [('l', 't'), ('b', 'r')],
         6: [('t', 'b')], 7: [('l', 't')], 8: [('l', 't')], 9: [('t', 'b')], 10: [('t', 'r'), ('l', 'b')],
         11: [('t', 'r')], 12: [('l', 'r')], 13: [('b', 'r')], 14: [('l', 'b')]}


def march(f, S, lv):
    a, b, c, d = f[:-1, :-1], f[:-1, 1:], f[1:, 1:], f[1:, :-1]
    idx = (a > lv) * 8 + (b > lv) * 4 + (c > lv) * 2 + (d > lv) * 1
    segs = []
    lerp = lambda p, q, u, w: (p[0] + (lv - u) / (w - u) * (q[0] - p[0]), p[1] + (lv - u) / (w - u) * (q[1] - p[1]))
    for y, x in zip(*np.nonzero((idx > 0) & (idx < 15))):
        va, vb, vc, vd = f[y, x], f[y, x + 1], f[y + 1, x + 1], f[y + 1, x]
        A, B, C, D = (x * S, y * S), ((x + 1) * S, y * S), ((x + 1) * S, (y + 1) * S), (x * S, (y + 1) * S)
        e = {'t': lerp(A, B, va, vb), 'r': lerp(B, C, vb, vc), 'b': lerp(D, C, vd, vc), 'l': lerp(A, D, va, vd)}
        segs += [(e[p], e[q]) for p, q in TABLE[idx[y, x]]]
    return segs


def join(segs):
    key = lambda p: (round(p[0], 2), round(p[1], 2))
    adj = {}
    for i, (p, q) in enumerate(segs):
        adj.setdefault(key(p), []).append(i)
        adj.setdefault(key(q), []).append(i)
    used, lines = [False] * len(segs), []
    for i in range(len(segs)):
        if used[i]:
            continue
        used[i] = True
        line = list(segs[i])
        for end in (1, 0):
            while True:
                tip = line[-1] if end else line[0]
                nxt = next((j for j in adj.get(key(tip), []) if not used[j]), None)
                if nxt is None:
                    break
                used[nxt] = True
                a, b = segs[nxt]
                other = b if key(a) == key(tip) else a
                line.append(other) if end else line.insert(0, other)
        lines.append(line)
    return lines


def simplify(pts, eps=1.6):
    if len(pts) < 3:
        return pts
    a = np.array(pts)
    s, e = a[0], a[-1]
    d = e - s
    n = np.hypot(*d)
    dist = np.hypot(*(a - s).T) if n == 0 else np.abs(d[0] * (a[:, 1] - s[1]) - d[1] * (a[:, 0] - s[0])) / n
    i = int(np.argmax(dist))
    if dist[i] > eps:
        return simplify(pts[:i + 1], eps)[:-1] + simplify(pts[i:], eps)
    return [pts[0], pts[-1]]


def bezier(pts, closed):
    n = len(pts)
    if n < 3:
        return 'M%.0f %.0f' % pts[0] + ''.join(' L%.0f %.0f' % p for p in pts[1:])
    P = (lambda i: pts[i % n]) if closed else (lambda i: pts[max(0, min(n - 1, i))])
    d = 'M%.0f %.0f' % pts[0]
    for i in (range(n) if closed else range(n - 1)):
        p0, p1, p2, p3 = P(i - 1), P(i), P(i + 1), P(i + 2)
        d += ' C%.0f %.0f %.0f %.0f %.0f %.0f' % (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
                                                  p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, *p2)
    return d + (' Z' if closed else '')


def inside(pt, poly):
    x, y, hit = pt[0], pt[1], False
    for i in range(len(poly)):
        (x1, y1), (x2, y2) = poly[i], poly[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            hit = not hit
    return hit


def area(poly):
    return abs(sum(poly[i - 1][0] * poly[i][1] - poly[i][0] * poly[i - 1][1] for i in range(len(poly)))) / 2


def contours(f, S, count, clear=None):
    """clear: a point; the smallest closed ring around it is left out, so the summit stays open."""
    levels = np.linspace(f.min() + 0.04, f.max() - 0.02, count)
    found = []
    for li, lv in enumerate(levels):
        kind = 'index' if li % 5 == 4 else ('blue' if li % 2 else 'ink')
        for line in join(march(f, S, lv)):
            if len(line) < 6:
                continue
            closed = abs(line[0][0] - line[-1][0]) < .5 and abs(line[0][1] - line[-1][1]) < .5
            s = simplify(line)
            if closed and len(s) > 3:
                s = s[:-1]
            if len(s) >= 2:
                found.append((kind, s, closed))
    if clear:
        rings = [i for i, (_, s, closed) in enumerate(found) if closed and len(s) > 3 and inside(clear, s)]
        if rings:
            found.pop(min(rings, key=lambda i: area(found[i][1])))
    out = {'ink': [], 'blue': [], 'index': []}
    for kind, s, closed in found:
        out[kind].append(bezier(s, closed))
    return out


def svg(W, H, lines, cls, extra=''):
    paths = ''.join('<path class="%s-%s" d="%s"/>' % (cls, k, ' '.join(v)) for k, v in lines.items())
    return ('<svg class="%s" viewBox="0 0 %d %d" preserveAspectRatio="xMidYMid slice" aria-hidden="true"%s>%s</svg>'
            % (cls, W, H, extra, paths))


# The page: 1600x1000, sliced to cover. The summit sits 44 units above centre - exactly under the mark,
# which rides above the middle of the mark-and-name block - with clean rings around it. The innermost
# ring is left out so the summit itself stays open under the mark.
f, S = terrain(1600, 1000, (800, 456, 420, 360),
               [(230, 180, 260, 200, .55), (1380, 820, 300, 230, .6), (1300, 150, 220, 180, .38),
                (260, 860, 240, 190, .42), (560, 700, 170, 150, -.2), (1090, 330, 150, 140, -.16)], seed=3)
(HERE / 'topo-page.svg').write_text(svg(1600, 1000, contours(f, S, 30, clear=(800, 456)), 'topo'))

# The banner: 1584x396. The avatar punches through the bottom-left, so the summit goes right of centre
# and the ground falls away under the avatar into long, quiet lines.
f, S = terrain(1584, 396, (1080, 214, 360, 210),
               [(1480, 60, 220, 160, .45), (420, 120, 300, 170, .5), (760, 360, 200, 120, -.25),
                (140, 380, 260, 140, .15)], seed=21, S=6, calm=300)
(HERE / 'topo-banner.svg').write_text(svg(1584, 396, contours(f, S, 26), 'topo',
                                          ' xmlns="http://www.w3.org/2000/svg" width="1584" height="396"'))
print('wrote', HERE / 'topo-page.svg', HERE / 'topo-banner.svg')
