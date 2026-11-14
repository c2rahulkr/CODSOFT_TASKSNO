#!/usr/bin/env python3
"""
Generates the illustrated placeholder artwork used by the Vistara website
(flat-style SVG scenes in the school's navy / gold palette).

These are PLACEHOLDERS. Replace them with real, licensed photographs of your
campus using the same file names (or update the paths in index.html).

Usage:  python3 tools/generate_images.py
"""
import os
import random

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "images")

NAVY, NAVY2, GOLD, CREAM = "#102A43", "#243B53", "#D4AF37", "#F7F9FC"
SKY1, SKY2 = "#9FD3F5", "#E8F4FD"
GRASS, GRASS2, TREE, TREE2 = "#7BC47F", "#5BAA63", "#2F8F5B", "#256F48"
BRICK, BRICK2, STONE = "#C9764F", "#A85C3A", "#E9E2D0"
SKINS = ["#F2C7A5", "#D9A37C", "#B97B55", "#8D5A3B"]
HAIRS = ["#1B1B1F", "#3B2A20", "#6B4226", "#2B2B2B"]
SHIRTS = ["#D4AF37", "#E4572E", "#2E86AB", "#7BC47F", "#B565A7", "#F6F6F6", "#FF8C42"]


def svg(w, h, body, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'preserveAspectRatio="xMidYMid slice">\n<defs>{defs}</defs>\n{body}\n</svg>\n')


def grad(id_, c1, c2, vertical=True):
    x2, y2 = ("0", "1") if vertical else ("1", "0")
    return f'<linearGradient id="{id_}" x1="0" y1="0" x2="{x2}" y2="{y2}"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>'


def rect(x, y, w, h, fill, r=0, extra=""):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" {extra}/>'


def circ(x, y, r, fill, extra=""):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" {extra}/>'


def poly(points, fill):
    return f'<polygon points="{points}" fill="{fill}"/>'


def person(x, y, s=1.0, seed=0, shirt=None):
    """Simple standing student: y is the feet line."""
    r = random.Random(seed)
    skin, hair = r.choice(SKINS), r.choice(HAIRS)
    shirt = shirt or r.choice(SHIRTS)
    pants = r.choice([NAVY, NAVY2, "#3E4C59"])
    return (f'<g transform="translate({x},{y}) scale({s})">'
            f'{rect(-9, -42, 7, 42, pants, 3)}{rect(2, -42, 7, 42, pants, 3)}'
            f'{rect(-15, -92, 30, 54, shirt, 10)}{rect(-22, -88, 8, 38, shirt, 4)}{rect(14, -88, 8, 38, shirt, 4)}'
            f'{circ(0, -108, 15, skin)}<path d="M-15,-110 a15,15 0 0 1 30,0 q-15,-10 -30,0z" fill="{hair}"/></g>')


def tree(x, y, s=1.0, c=TREE):
    return (f'<g transform="translate({x},{y}) scale({s})">{rect(-7, -60, 14, 60, "#7A5230", 3)}'
            f'{circ(0, -95, 48, c)}{circ(-34, -70, 32, c)}{circ(34, -70, 32, c)}{circ(0, -125, 30, TREE2 if c == TREE else TREE)}</g>')


def clouds(w):
    out = ""
    for x, y, s in [(w * .12, 110, 1), (w * .45, 70, .8), (w * .78, 130, 1.1)]:
        out += (f'<g opacity=".92" transform="translate({x},{y}) scale({s})">{circ(0, 0, 28, "#fff")}{circ(34, 8, 34, "#fff")}'
                f'{circ(72, 2, 26, "#fff")}{rect(-26, 8, 120, 28, "#fff", 14)}</g>')
    return out


def windows(x, y, cols, rows, w=34, h=46, gx=26, gy=26, fill="#BFE3F7", frame="#fff"):
    out = ""
    for i in range(cols):
        for j in range(rows):
            wx, wy = x + i * (w + gx), y + j * (h + gy)
            out += rect(wx - 3, wy - 3, w + 6, h + 6, frame, 4) + rect(wx, wy, w, h, fill, 2) + rect(wx + w / 2 - 1, wy, 2, h, frame)
    return out


# ------------------------------------------------------------------ hero / campus
def campus(w=1920, h=1080, people=True):
    horizon = h * 0.66
    body = rect(0, 0, w, h, "url(#sky)")
    body += circ(w * .82, 150, 70, "#FFE9A8", 'opacity=".9"') + clouds(w)
    body += rect(0, horizon, w, h - horizon, "url(#grass)")
    # distant trees
    for x in range(40, w, 190):
        body += tree(x, horizon + 8, .7 + (x % 3) * .08, TREE2)
    # main building
    bx, bw, bh = w * .22, w * .56, 330
    by = horizon - bh + 40
    body += rect(bx, by, bw, bh, BRICK, 6) + rect(bx, by, bw, 26, BRICK2) + rect(bx - 14, by - 16, bw + 28, 22, STONE, 4)
    body += windows(bx + 50, by + 60, 5, 2, w=44, h=54, gx=34, gy=34)
    body += windows(bx + bw - 50 - 5 * 78 + 34, by + 60, 5, 2, w=44, h=54, gx=34, gy=34)
    # central tower + entrance
    cx = w / 2
    body += rect(cx - 120, by - 150, 240, 190, STONE, 4) + poly(f"{cx-140},{by-150} {cx},{by-250} {cx+140},{by-150}", NAVY)
    body += circ(cx, by - 95, 34, "#fff") + circ(cx, by - 95, 28, "#fff", f'stroke="{NAVY}" stroke-width="4"')
    body += f'<path d="M{cx},{by-95} v-20 M{cx},{by-95} l14,8" stroke="{NAVY}" stroke-width="4" stroke-linecap="round"/>'
    body += rect(cx - 150, by + 40, 300, 250, STONE, 4)
    for i in range(5):
        body += rect(cx - 130 + i * 56, by + 60, 22, 230, "#fff", 4)
    body += rect(cx - 56, by + 150, 112, 140, NAVY2, 6) + rect(cx - 4, by + 150, 8, 140, GOLD)
    body += rect(cx - 160, by + 28, 320, 20, GOLD) + poly(f"{cx-170},{by+30} {cx},{by-10} {cx+170},{by+30}", STONE)
    # flag
    body += rect(cx - 2, by - 330, 4, 90, "#555") + poly(f"{cx+2},{by-330} {cx+56},{by-312} {cx+2},{by-294}", GOLD)
    # path and lawn details
    body += f'<path d="M{cx-150},{by+290} L{cx-420},{h} L{cx+420},{h} L{cx+150},{by+290}z" fill="#EADFC6"/>'
    body += f'<path d="M{cx-150},{by+290} L{cx-420},{h} L{cx-380},{h} L{cx-130},{by+290}z" fill="#D8CBAA" opacity=".6"/>'
    for x in (w * .12, w * .88):
        body += tree(x, horizon + 140, 1.5)
    for x in (w * .3, w * .7):
        body += tree(x, horizon + 90, 1.0, TREE)
    if people:
        spots = [(cx - 330, h - 90, 1.5), (cx - 250, h - 60, 1.7), (cx + 260, h - 95, 1.55), (cx + 350, h - 50, 1.75),
                 (cx - 90, h - 30, 1.9), (cx + 120, h - 40, 1.85), (cx + 560, h - 140, 1.3), (cx - 600, h - 130, 1.3)]
        for i, (x, y, s) in enumerate(spots):
            body += person(x, y, s, seed=i + 3)
    return svg(w, h, body, grad("sky", SKY1, SKY2) + grad("grass", GRASS, GRASS2))


# ------------------------------------------------------------------ interior-ish scenes
def room_bg(w, h, wall="#EEF3F8", floor="#C9B79C"):
    return rect(0, 0, w, h, wall) + rect(0, h * .72, w, h * .28, floor) + rect(0, h * .72, w, 8, "#00000022")


def classroom(w=1200, h=800, board="#1F4D3A", lab=False):
    b = room_bg(w, h)
    b += rect(w * .12, 90, w * .76, 250, "#9AA5B1", 10) + rect(w * .12 + 14, 104, w * .76 - 28, 222, board, 6)
    b += f'<text x="{w*.2}" y="190" font-family="Georgia,serif" font-size="46" fill="#fff" opacity=".9">E = mc²   a² + b² = c²</text>'
    b += f'<path d="M{w*.2},250 q60,-50 120,0 t120,0 t120,0" stroke="{GOLD}" stroke-width="5" fill="none"/>'
    b += windows(60, 100, 1, 2, w=70, h=120, gx=0, gy=40) if w > 900 else ""
    for r_, y in enumerate((470, 580)):
        for c in range(4):
            x = 150 + c * 250
            b += rect(x, y, 170, 18, "#B98B5E", 4) + rect(x + 10, y + 18, 8, 50, "#8D6A47") + rect(x + 152, y + 18, 8, 50, "#8D6A47")
            b += person(x + 85, y - 6, 1.1 if r_ else 1.0, seed=r_ * 4 + c + 10) if not lab else ""
    return svg(w, h, b)


def science_lab(w=1200, h=800):
    b = room_bg(w, h, "#EAF1F6", "#B7C4CE")
    b += rect(0, 360, w, 40, "#2B4F6B") + rect(0, 400, w, 330, "#1B3A52")
    flask_cols = ["#E4572E", "#2E86AB", "#7BC47F", "#D4AF37", "#B565A7"]
    for i in range(7):
        x = 120 + i * 150
        c = flask_cols[i % 5]
        b += f'<path d="M{x-14},250 h28 v70 l40,70 q10,22 -14,22 h-80 q-24,0 -14,-22 l40,-70z" fill="#fff" fill-opacity=".55" stroke="#5C7C93" stroke-width="4"/>'
        b += f'<path d="M{x-40},378 h80 l18,34 q8,14 -10,14 h-96 q-18,0 -10,-14z" fill="{c}" opacity=".85"/>'
        b += circ(x - 6, 340, 6, "#fff", 'opacity=".7"') + circ(x + 8, 320, 4, "#fff", 'opacity=".7"')
    b += rect(70, 70, 330, 150, "#fff", 8, 'opacity=".9"') + f'<text x="100" y="150" font-family="Georgia,serif" font-size="34" fill="{NAVY}">H₂O + CO₂</text>'
    b += person(900, 700, 2.1, seed=21, shirt="#fff") + person(1010, 705, 2.0, seed=22, shirt="#fff")
    return svg(w, h, b)


def computer_lab(w=1200, h=800):
    b = room_bg(w, h, "#E6ECF5", "#AEB8C4")
    for r_, y in enumerate((300, 470)):
        for c in range(4):
            x = 110 + c * 265
            b += rect(x - 10, y + 90, 210, 20, "#8896A5", 4)
            b += rect(x, y, 190, 110, "#2B3A4A", 8) + rect(x + 10, y + 10, 170, 90, "url(#scr)", 4)
            b += rect(x + 80, y + 110, 30, 34, "#2B3A4A") + rect(x + 55, y + 140, 80, 10, "#2B3A4A", 4)
            b += rect(x + 20, y + 28, 70, 8, "#fff", 3, 'opacity=".8"') + rect(x + 20, y + 46, 110, 8, GOLD, 3) + rect(x + 20, y + 64, 90, 8, "#fff", 3, 'opacity=".6"')
    b += person(1080, 690, 2.0, seed=31) + person(150, 700, 1.9, seed=33)
    return svg(w, h, b, grad("scr", "#2E86AB", NAVY))


def library(w=1200, h=800):
    b = room_bg(w, h, "#F1E8DA", "#B58B5C")
    cols = ["#C0392B", "#2E86AB", "#D4AF37", "#27AE60", "#8E44AD", "#E67E22", NAVY, "#16A085"]
    r = random.Random(7)
    for shelf in range(3):
        sx = 60 + shelf * 380
        b += rect(sx, 70, 340, 560, "#7A5230", 6) + rect(sx + 10, 80, 320, 540, "#9C6C3F", 3)
        for row in range(4):
            y = 90 + row * 135
            x = sx + 18
            while x < sx + 318:
                bw, bh = r.randint(14, 28), r.randint(80, 118)
                b += rect(x, y + 120 - bh, bw, bh, r.choice(cols), 2)
                x += bw + 2
            b += rect(sx + 10, y + 120, 320, 10, "#7A5230")
    b += rect(250, 640, 700, 22, "#8D6A47", 6) + rect(300, 662, 14, 100, "#6F4F32") + rect(886, 662, 14, 100, "#6F4F32")
    b += person(520, 640, 1.9, seed=41) + person(700, 640, 1.9, seed=42)
    b += rect(470, 612, 70, 22, "#fff", 3) + rect(650, 612, 70, 22, GOLD, 3)
    return svg(w, h, b)


def sports(w=1200, h=800):
    b = rect(0, 0, w, h, "url(#sky)") + clouds(w) + rect(0, 380, w, h - 380, "#5BAA63")
    for i in range(6):
        b += rect(0, 380 + i * 70, w, 35, "#52A05B")
    b += f'<ellipse cx="{w/2}" cy="600" rx="520" ry="170" fill="none" stroke="#fff" stroke-width="6"/>'
    b += rect(w / 2 - 3, 430, 6, 340, "#fff") + f'<ellipse cx="{w/2}" cy="600" rx="70" ry="24" fill="none" stroke="#fff" stroke-width="6"/>'
    b += rect(60, 380, 220, 14, "#fff") + rect(66, 330, 8, 52, "#fff") + rect(266, 330, 8, 52, "#fff")  # goal
    b += rect(w - 260, 320, 10, 70, "#fff") + circ(w - 255, 318, 24, "none", 'stroke="#fff" stroke-width="6"')  # hoop
    b += circ(w / 2 + 40, 640, 18, "#fff", f'stroke="{NAVY}" stroke-width="3"')
    for i, (x, y) in enumerate([(380, 560), (470, 620), (700, 600), (820, 660), (560, 700)]):
        b += person(x, y, 1.6, seed=51 + i, shirt=GOLD if i % 2 else "#E4572E")
    return svg(w, h, b, grad("sky", SKY1, SKY2))


def music(w=1200, h=800):
    b = rect(0, 0, w, h, "url(#bg)") + rect(0, 600, w, 200, "#B58B5C")
    for i in range(5):
        b += rect(150, 160 + i * 28, 900, 3, "#ffffff55")
    for i, (x, y) in enumerate([(220, 200), (360, 250), (520, 180), (700, 240), (880, 190), (1000, 230)]):
        b += f'<g fill="{GOLD}"><ellipse cx="{x}" cy="{y}" rx="22" ry="16" transform="rotate(-20 {x} {y})"/>{rect(x+17, y-90, 5, 92, GOLD)}</g>'
    # piano
    b += rect(150, 470, 420, 130, "#1B1B1F", 10) + "".join(rect(160 + i * 40, 500, 36, 90, "#fff", 3) for i in range(10))
    b += "".join(rect(184 + i * 40, 500, 22, 54, "#1B1B1F", 2) for i in (0, 1, 3, 4, 5, 7, 8))
    # dancers
    for i, x in enumerate((760, 880, 1000)):
        b += f'<g transform="translate({x},600)">{person(0, 0, 1.9, seed=61 + i, shirt=["#E4572E", GOLD, "#B565A7"][i])}</g>'
        b += f'<path d="M{x-40},560 q40,40 80,0" stroke="{["#E4572E", GOLD, "#B565A7"][i]}" stroke-width="10" fill="none" stroke-linecap="round"/>'
    return svg(w, h, b, grad("bg", "#2B4C7E", NAVY))


def transport(w=1200, h=800):
    b = rect(0, 0, w, h, "url(#sky)") + clouds(w) + rect(0, 560, w, 240, "#4A5561") + "".join(rect(i * 160, 670, 90, 10, "#F6E27A") for i in range(8))
    b += rect(0, 540, w, 24, "#6C7A89") + tree(180, 540, 1.2) + tree(1050, 540, 1.1)
    b += rect(220, 330, 760, 260, GOLD, 30) + rect(220, 470, 760, 40, "#B8921F") + rect(220, 330, 760, 28, "#E7C65A", 14)
    for i in range(6):
        b += rect(260 + i * 112, 370, 90, 90, "#BFE3F7", 10) + rect(260 + i * 112 + 43, 370, 4, 90, GOLD)
    b += rect(900, 360, 70, 130, "#BFE3F7", 10) + rect(480, 500, 240, 36, NAVY, 8)
    b += f'<text x="500" y="526" font-family="Arial,sans-serif" font-weight="700" font-size="24" fill="{GOLD}">SCHOOL BUS</text>'
    for x in (350, 800):
        b += circ(x, 590, 52, "#1B1B1F") + circ(x, 590, 26, "#9AA5B1") + circ(x, 590, 8, "#1B1B1F")
    b += circ(985, 520, 12, "#FFF3B0")
    return svg(w, h, b, grad("sky", SKY1, SKY2))


def cafeteria(w=1200, h=800):
    b = room_bg(w, h, "#FBF0DE", "#D7B98E")
    b += rect(0, 120, w, 26, "#F4D9A8") + "".join(circ(100 + i * 160, 150, 18, GOLD) for i in range(8))
    b += rect(80, 300, w - 160, 110, "#B98B5E", 10) + rect(80, 410, w - 160, 160, "#8D6A47", 6)
    foods = ["#E4572E", "#7BC47F", "#F2C14E", "#B565A7", "#2E86AB"]
    for i in range(7):
        x = 140 + i * 150
        b += circ(x + 40, 350, 38, "#fff") + circ(x + 40, 350, 26, foods[i % 5])
    for i, x in enumerate((220, 520, 840)):
        b += rect(x, 620, 220, 16, "#fff", 6) + rect(x + 90, 636, 40, 90, "#8896A5") + person(x + 60, 612, 1.6, seed=71 + i) + person(x + 170, 612, 1.5, seed=75 + i)
    return svg(w, h, b)


def stage(w=1200, h=800):
    b = rect(0, 0, w, h, "#2B1B3D") + rect(0, 0, w, 90, "#8E1B2D")
    for i in range(10):
        b += poly(f"{i*130},0 {i*130+130},0 {i*130+65},300", "#A8243A" if i % 2 else "#8E1B2D")
    b += rect(0, 560, w, 240, "#5B3A29") + rect(w / 2 - 280, 120, 560, 330, NAVY, 10) + rect(w / 2 - 270, 130, 540, 310, "#17395A", 8)
    b += f'<text x="{w/2}" y="260" text-anchor="middle" font-family="Georgia,serif" font-size="58" fill="{GOLD}">Annual Day</text>'
    b += f'<text x="{w/2}" y="320" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="#fff" opacity=".85">Vistara International School</text>'
    for i, x in enumerate((330, 440, 560, 680, 790, 900)):
        b += person(x, 650, 1.8, seed=81 + i, shirt=["#E4572E", GOLD, "#2E86AB", "#7BC47F", "#B565A7", "#fff"][i])
    for x in (140, 1060):
        b += poly(f"{x},560 {x+60},560 {x+30},0", "#FFE9A833")
    return svg(w, h, b)


def festival(w=1200, h=800):
    b = rect(0, 0, w, h, "url(#bg)")
    cols = ["#E4572E", GOLD, "#B565A7", "#2E86AB", "#7BC47F"]
    for i in range(9):
        x = 80 + i * 130
        b += rect(x + 28, 0, 3, 90 + (i % 3) * 40, "#ffffff66") + circ(x + 30, 110 + (i % 3) * 40, 36, cols[i % 5]) + rect(x + 14, 100 + (i % 3) * 40, 32, 6, "#fff", 3, 'opacity=".5"')
    b += rect(0, 620, w, 180, "#6B3E26")
    for i, x in enumerate((330, 500, 670, 840)):
        c = cols[i]
        b += person(x, 660, 2.0, seed=91 + i, shirt=c) + f'<path d="M{x-44},610 q44,60 88,0" fill="{c}" opacity=".85"/>'
    b += "".join(circ(120 + i * 95, 700 + (i % 2) * 30, 8, GOLD) for i in range(12))
    return svg(w, h, b, grad("bg", "#7B2D5B", "#E4572E"))


def expo(w=1200, h=800):
    b = room_bg(w, h, "#EEF3F8", "#B8C2CC")
    for i, x in enumerate((90, 450, 810)):
        b += rect(x, 250, 300, 360, "#fff", 8, 'stroke="#C5D0DB" stroke-width="4"') + rect(x + 14, 264, 272, 110, [NAVY, "#2E86AB", "#27AE60"][i], 6)
        b += f'<text x="{x+150}" y="332" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="#fff">{["Solar", "Robotics", "Ecology"][i]}</text>'
        b += rect(x + 30, 400, 240, 8, "#C5D0DB", 3) + rect(x + 30, 424, 180, 8, "#C5D0DB", 3)
        b += circ(x + 150, 520, 40, ["#FFD966", "#9AA5B1", "#7BC47F"][i]) + rect(x - 20, 600, 340, 24, "#8D6A47", 5)
    b += person(250, 700, 2.0, seed=101) + person(640, 705, 2.0, seed=102, shirt="#fff") + person(1010, 700, 2.0, seed=103)
    return svg(w, h, b)


# ------------------------------------------------------------------ program illustrations
def program(kind, w=1200, h=800):
    palettes = {"pre": ("#FFE9A8", "#FFB347"), "pri": ("#BDE0FE", "#7FB7F0"), "mid": ("#C9F2D5", "#7BC47F"),
                "sec": ("#E4D1F5", "#B590DB"), "sr": ("#FFD3C2", "#F28B6B")}
    c1, c2 = palettes[kind]
    b = rect(0, 0, w, h, "url(#bg)") + circ(w * .85, 140, 160, "#ffffff55") + circ(120, 700, 220, "#ffffff40")
    b += rect(0, 600, w, 200, "#ffffff55")
    if kind == "pre":  # blocks, rainbow, kid
        for i, c in enumerate(["#E4572E", GOLD, "#2E86AB", "#7BC47F"]):
            b += f'<path d="M{300+i*0},{560} a{300-i*40},{300-i*40} 0 0 1 {600+i*80},0" fill="none" stroke="{c}" stroke-width="26" transform="translate({200},0)"/>' if False else ""
        for i, (x, y, c) in enumerate([(240, 520, "#E4572E"), (340, 520, GOLD), (290, 430, "#2E86AB"), (860, 540, "#7BC47F"), (950, 540, "#B565A7")]):
            b += rect(x, y, 90, 90, c, 10) + f'<text x="{x+45}" y="{y+62}" text-anchor="middle" font-family="Arial" font-weight="800" font-size="46" fill="#fff">{"ABC"[i%3]}</text>'
        b += person(600, 650, 2.6, seed=111, shirt="#E4572E") + person(740, 650, 2.3, seed=112, shirt="#2E86AB")
        b += "".join(f'<path d="M{x},{y} l14,34 l-34,-22 l40,0 l-34,22z" fill="#fff" opacity=".9"/>' for x, y in [(150, 200), (1000, 260), (560, 140)])
    elif kind == "pri":  # books & desk & globe
        b += rect(200, 500, 800, 30, "#8D6A47", 8) + rect(260, 530, 18, 110, "#6F4F32") + rect(920, 530, 18, 110, "#6F4F32")
        for i, c in enumerate(["#E4572E", NAVY, GOLD, "#27AE60"]):
            b += rect(280 + i * 64, 400 - i * 8, 56, 100 + i * 8, c, 4)
        b += rect(660, 440, 190, 60, "#fff", 4) + rect(668, 448, 84, 44, "#EEF3F8") + rect(760, 448, 82, 44, "#EEF3F8")
        b += circ(940, 380, 90, "#2E86AB") + f'<path d="M870,360 q40,-40 80,0 q30,30 -10,70 q-50,10 -70,-70z" fill="#7BC47F"/>' + rect(930, 470, 20, 30, "#8D6A47")
        b += person(560, 520, 2.4, seed=121)
    elif kind == "mid":  # science: microscope + atom
        b += rect(300, 560, 300, 24, "#fff", 6) + rect(380, 380, 36, 180, "#2B4F6B") + f'<rect x="350" y="300" width="40" height="150" rx="10" fill="#2B4F6B" transform="rotate(25 370 375)"/>' + rect(320, 560, 200, 20, "#1B3A52")
        b += circ(380, 400, 14, GOLD)
        b += f'<g fill="none" stroke="{NAVY}" stroke-width="7"><ellipse cx="880" cy="360" rx="150" ry="52"/><ellipse cx="880" cy="360" rx="150" ry="52" transform="rotate(60 880 360)"/><ellipse cx="880" cy="360" rx="150" ry="52" transform="rotate(120 880 360)"/></g>' + circ(880, 360, 24, GOLD)
        b += person(700, 650, 2.5, seed=131, shirt="#fff")
    elif kind == "sec":  # lab flask + formulas
        b += f'<path d="M520,230 h60 v140 l110,200 q20,40 -26,40 h-228 q-46,0 -26,-40 l110,-200z" fill="#fff" fill-opacity=".7" stroke="{NAVY}" stroke-width="8"/>'
        b += f'<path d="M430,520 h240 l40,70 q10,22 -16,22 h-288 q-26,0 -16,-22z" fill="#7BC47F"/>' + circ(560, 480, 12, "#fff") + circ(610, 440, 8, "#fff")
        b += f'<text x="150" y="220" font-family="Georgia,serif" font-size="56" fill="{NAVY}" opacity=".75">Σ x² dx</text><text x="820" y="300" font-family="Georgia,serif" font-size="56" fill="{NAVY}" opacity=".75">C₆H₁₂O₆</text>'
        b += person(900, 650, 2.5, seed=141, shirt="#fff") + person(250, 650, 2.3, seed=142)
    else:  # sr: laptop + graph + cap
        b += rect(330, 380, 400, 250, NAVY, 14) + rect(346, 396, 368, 218, "#fff", 6) + rect(250, 630, 560, 26, "#9AA5B1", 10)
        b += f'<polyline points="370,580 440,520 510,545 590,455 680,420" fill="none" stroke="{GOLD}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>'
        b += "".join(rect(380 + i * 70, 560 - i * 20, 40, 30 + i * 20, "#2E86AB", 4, 'opacity=".5"') for i in range(4))
        b += person(930, 660, 2.6, seed=151, shirt=NAVY) + f'<polygon points="880,300 960,280 1040,300 960,322" fill="#1B1B1F"/>'
    return svg(w, h, b, grad("bg", c1, c2))


# ------------------------------------------------------------------ faculty portraits
def portrait(i, w=600, h=720):
    skin, hair = SKINS[i % 4], HAIRS[(i + 1) % 4]
    suits = [NAVY, "#243B53", "#3E4C59", "#7A1F3D"]
    b = rect(0, 0, w, h, "url(#bg)") + circ(w * .5, h * .95, 300, "#ffffff22")
    b += f'<path d="M60,{h} q0,-250 240,-250 q240,0 240,250z" fill="{suits[i % 4]}"/>'
    b += poly(f"{w/2-60},{h-230} {w/2},{h-130} {w/2+60},{h-230}", "#fff") + poly(f"{w/2-12},{h-200} {w/2+12},{h-200} {w/2+8},{h-120} {w/2-8},{h-120}", GOLD)
    b += rect(w / 2 - 28, 330, 56, 90, skin, 10) + f'<ellipse cx="{w/2}" cy="270" rx="92" ry="112" fill="{skin}"/>'
    if i % 2 == 0:  # long hair
        b += f'<path d="M{w/2-100},280 q-10,-150 100,-150 q110,0 100,150 q-10,-70 -100,-80 q-90,10 -100,80z" fill="{hair}"/>'
        b += rect(w / 2 - 112, 270, 26, 150, hair, 12) + rect(w / 2 + 86, 270, 26, 150, hair, 12)
    else:
        b += f'<path d="M{w/2-96},250 q0,-130 96,-130 q96,0 96,130 q-40,-60 -96,-62 q-56,2 -96,62z" fill="{hair}"/>'
    b += circ(w / 2 - 34, 275, 7, "#1B1B1F") + circ(w / 2 + 34, 275, 7, "#1B1B1F")
    b += f'<path d="M{w/2-30},325 q30,26 60,0" stroke="#7A3E2B" stroke-width="6" fill="none" stroke-linecap="round"/>'
    return svg(w, h, b, grad("bg", ["#334E68", "#486581", "#243B53", "#627D98"][i % 4], "#102A43"))


def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    write("hero/campus.svg", campus())
    write("about/campus-1.svg", campus(1200, 900, people=True))
    write("about/classroom.svg", classroom())
    for k, name in [("pre", "pre-primary"), ("pri", "primary"), ("mid", "middle"), ("sec", "secondary"), ("sr", "senior-secondary")]:
        write(f"programs/{name}.svg", program(k))
    fac = {"smart-classroom": classroom, "science-lab": science_lab, "computer-lab": computer_lab, "library": library,
           "sports-complex": sports, "music-dance": music, "transport": transport, "cafeteria": cafeteria}
    for name, fn in fac.items():
        write(f"facilities/{name}.svg", fn())
    gal = {"campus-life": lambda: campus(1200, 800), "classroom-activities": lambda: classroom(1200, 800, lab=False),
           "annual-function": stage, "sports-events": sports, "cultural-celebrations": festival, "science-exhibition": expo}
    for name, fn in gal.items():
        write(f"gallery/{name}.svg", fn())
    for i in range(4):
        write(f"faculty/teacher-{i+1}.svg", portrait(i))
    print("Generated images in", os.path.abspath(ROOT))


if __name__ == "__main__":
    main()
