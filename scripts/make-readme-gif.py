"""Build docs/media/difficulty-ladder.gif for the README from the real stimuli.

Each frame set shows one rung of the difficulty ladder: the correct image (morph 28)
beside two wrong answers. As the gap shrinks from 48 to 12 the wrong answers close in.
Run: python scripts/make-readme-gif.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FACES = ROOT / "static" / "faces"
OUT = ROOT / "docs" / "media" / "difficulty-ladder.gif"

PAIR = "face11_face12"
TARGET = 28
# (gap, wrong answers, label)
RUNGS = [
    (48, (76, 88), "Easy: the wrong answers look clearly different"),
    (36, (64, 76), "Closer: the differences are getting subtle"),
    (24, (52, 64), "Hard: you must use the eyes, nose and jaw"),
    (12, (40, 52), "At your limit: near-identical faces"),
]
SIZE, PAD, HEAD, FOOT = 200, 16, 56, 52
WIDTH = 3 * SIZE + 4 * PAD
HEIGHT = HEAD + SIZE + FOOT + PAD
BG, INK, MUTED, GREEN = (247, 248, 250), (31, 41, 55), (95, 102, 114), (22, 163, 74)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "arialbd.ttf" if bold else "arial.ttf"
    return ImageFont.truetype(name, size)


def face(level: int) -> Image.Image:
    return Image.open(FACES / f"{PAIR}_{level}.jpg").convert("RGB").resize((SIZE, SIZE))


def frame(gap: int, wrong: tuple[int, int], label: str, reveal: bool) -> Image.Image:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)
    draw.text((PAD, 12), "Which image matches the person you just saw?", fill=INK, font=font(20, True))
    draw.text((PAD, 36), f"Morph gap {gap}", fill=MUTED, font=font(14))

    order = [wrong[0], TARGET, wrong[1]]
    for i, level in enumerate(order):
        x = PAD + i * (SIZE + PAD)
        img.paste(face(level), (x, HEAD))
        if reveal and level == TARGET:
            draw.rectangle((x - 3, HEAD - 3, x + SIZE + 2, HEAD + SIZE + 2), outline=GREEN, width=5)
            draw.text((x + 8, HEAD + SIZE - 28), "Match", fill=GREEN, font=font(18, True))
    draw.text((PAD, HEAD + SIZE + 16), label, fill=INK, font=font(17))
    return img


def main() -> None:
    frames, durations = [], []
    for gap, wrong, label in RUNGS:
        frames += [frame(gap, wrong, label, False), frame(gap, wrong, label, True)]
        durations += [1400, 1200]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        OUT, save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=True
    )
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
