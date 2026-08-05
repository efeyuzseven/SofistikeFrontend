from pathlib import Path
from math import cos, pi

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "videos" / "review-lab-demo.webp"
SOURCE = ROOT / "public" / "images" / "hero-sleep.png"
FONT = Path(r"C:\Windows\Fonts\segoeui.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\segoeuib.ttf")

WIDTH, HEIGHT = 960, 540
FPS, SECONDS = 10, 9

MIDNIGHT = "#0f1b2d"
DEEP_TEAL = "#0e5c5a"
TERRACOTTA = "#c9694a"
OLIVE = "#6c7a4e"
OCHRE = "#dba13a"
LAVENDER = "#a6a3cb"
MINT = "#a9c9c0"
PAPER = "#fffef9"
SAND = "#e7dcc6"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT), size)


def ease(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return (1 - cos(value * pi)) / 2


def mix(start: tuple[int, int], end: tuple[int, int], amount: float) -> tuple[int, int]:
    amount = ease(amount)
    return (
        round(start[0] + (end[0] - start[0]) * amount),
        round(start[1] + (end[1] - start[1]) * amount),
    )


def cursor(draw: ImageDraw.ImageDraw, point: tuple[int, int], click: float = 0) -> None:
    x, y = point
    if click > 0:
        radius = 12 + int(18 * click)
        alpha_color = TERRACOTTA if click < 0.55 else OCHRE
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), outline=alpha_color, width=4)
    shape = [(x, y), (x + 4, y + 26), (x + 11, y + 19), (x + 18, y + 31), (x + 23, y + 28), (x + 16, y + 16), (x + 27, y + 14)]
    draw.polygon(shape, fill="#ffffff", outline=MIDNIGHT)


def draw_frame(second: float, product_image: Image.Image) -> Image.Image:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), "#f5f8f6")
    draw = ImageDraw.Draw(canvas)

    draw.rounded_rectangle((20, 18, 940, 522), radius=25, fill=PAPER, outline=SAND, width=2)
    draw.rounded_rectangle((20, 18, 940, 80), radius=25, fill="#fffdf8")
    draw.rectangle((20, 54, 940, 80), fill="#fffdf8")
    draw.line((20, 80, 940, 80), fill=SAND, width=2)
    for index, color in enumerate((TERRACOTTA, OCHRE, MINT)):
        x = 48 + index * 17
        draw.ellipse((x, 43, x + 8, 51), fill=color)
    draw.text((92, 34), "SOFİSTİKE +XTRA", font=font(17, True), fill=MIDNIGHT)
    draw.text((730, 35), "Review Lab", font=font(15, True), fill=DEEP_TEAL)

    draw.rounded_rectangle((52, 108, 464, 485), radius=18, fill="#f7f2ea", outline=SAND)
    image_crop = ImageOps.fit(product_image.convert("RGB"), (380, 220), method=Image.Resampling.LANCZOS)
    mask = Image.new("L", image_crop.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 379, 219), radius=14, fill=255)
    canvas.paste(image_crop, (68, 124), mask)
    draw.text((72, 362), "+XTRA UYKU", font=font(13, True), fill=LAVENDER)
    draw.text((72, 388), "Konfor Yastığı", font=font(26, True), fill=MIDNIGHT)
    draw.text((72, 430), "Gerçek deneyiminizi bizimle paylaşın.", font=font(14), fill="#626a64")

    panel = (492, 108, 908, 485)
    draw.rounded_rectangle(panel, radius=18, fill="#f4faf8", outline=MINT, width=2)

    submitted = second >= 6.3
    if not submitted:
        draw.text((524, 137), "Deneyimini paylaş", font=font(27, True), fill=MIDNIGHT)
        draw.text((524, 183), "Ürünü kullandıktan sonra ne düşündünüz?", font=font(14), fill="#5e6862")
        for star_index in range(5):
            star_x = 530 + star_index * 29
            draw.ellipse((star_x, 216, star_x + 13, 229), fill=OCHRE)
        draw.text((524, 251), "Yorumunuz", font=font(13, True), fill=DEEP_TEAL)
        draw.rounded_rectangle((522, 276, 878, 368), radius=12, fill="#ffffff", outline=MINT, width=2)

        review = "Yastık zamanla çöküyor."
        typed_count = round(len(review) * max(0, min(1, (second - 2.35) / 2.75)))
        typed = review[:typed_count]
        draw.text((542, 298), typed, font=font(18), fill=MIDNIGHT)
        if 2.35 <= second <= 5.25 and int(second * 4) % 2 == 0:
            text_width = draw.textlength(typed, font=font(18))
            draw.line((542 + text_width + 2, 298, 542 + text_width + 2, 322), fill=DEEP_TEAL, width=2)

        draw.rounded_rectangle((640, 399, 878, 453), radius=10, fill=DEEP_TEAL)
        draw.text((685, 415), "Yorumu Gönder", font=font(17, True), fill="#ffffff")
    else:
        draw.ellipse((524, 139, 574, 189), fill="#dff1ec")
        draw.text((538, 147), "✓", font=font(26, True), fill=DEEP_TEAL)
        draw.text((590, 143), "Yorum alındı", font=font(27, True), fill=MIDNIGHT)
        draw.text((524, 211), "TEKRARLANAN İHTİYAÇ", font=font(12, True), fill=TERRACOTTA)
        draw.rounded_rectangle((522, 238, 878, 298), radius=12, fill="#fff8f1", outline="#ebc7b8")
        draw.text((542, 256), "“Yastık zamanla çöküyor.”", font=font(18), fill=MIDNIGHT)
        draw.text((524, 326), "İYİLEŞTİRME KARARI", font=font(12, True), fill=OLIVE)
        draw.rounded_rectangle((522, 353, 878, 441), radius=12, fill="#edf5eb", outline="#bfceb3")
        draw.text((542, 370), "Ayarlanabilir iç dolgu", font=font(22, True), fill=DEEP_TEAL)
        draw.text((542, 404), "Daha uzun kullanım · kişisel konfor", font=font(14), fill="#59645c")

    start = (360, 276)
    input_point = (557, 296)
    button_point = (752, 425)
    if second < 0.8:
        point = start
    elif second < 2.05:
        point = mix(start, input_point, (second - 0.8) / 1.25)
    elif second < 5.2:
        point = input_point
    elif second < 6.0:
        point = mix(input_point, button_point, (second - 5.2) / 0.8)
    else:
        point = button_point

    click_amount = 0.0
    if 2.05 <= second < 2.35:
        click_amount = (second - 2.05) / 0.3
    elif 6.0 <= second < 6.3:
        click_amount = (second - 6.0) / 0.3
    if second < 6.45:
        cursor(draw, point, click_amount)

    draw.rounded_rectangle((347, 492, 613, 514), radius=11, fill="#e8f3ef")
    label = "Yorum yazılıyor…" if second < 5.25 else "İyileştirmeye dönüşüyor…"
    if submitted:
        label = "Review Lab içgörüsü hazır"
    text_width = draw.textlength(label, font=font(12, True))
    draw.text(((WIDTH - text_width) / 2, 496), label, font=font(12, True), fill=DEEP_TEAL)
    return canvas


def main() -> None:
    product = Image.open(SOURCE)
    frames = [draw_frame(index / FPS, product) for index in range(FPS * SECONDS)]
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        OUTPUT,
        format="WEBP",
        save_all=True,
        append_images=frames[1:],
        duration=round(1000 / FPS),
        loop=0,
        quality=82,
        method=4,
    )
    print(OUTPUT)


if __name__ == "__main__":
    main()
