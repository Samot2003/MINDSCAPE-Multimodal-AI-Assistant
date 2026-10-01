"""Genera el GIF y el MP4 de la demo a partir de la grabación de capture.js.

Recorta las esperas al modelo (dejando un instante del indicador de escritura)
y, con --publish, copia las capturas, el GIF, el MP4 y una imagen del resumen
en PDF a docs/images/.
"""
import json
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
DOCS_IMAGES = os.path.join(HERE, "..", "..", "docs", "images")

KEEP_OF_WAIT = 1.2  # Segundos que se mantienen de cada espera al modelo
GIF_WIDTH = int(os.environ.get("GIF_WIDTH", 800))
GIF_FPS = int(os.environ.get("GIF_FPS", 7))
GIF_COLORS = int(os.environ.get("GIF_COLORS", 112))
STILLS = ["mindscape-home.png", "mindscape-image-selection.png", "mindscape-chat.png", "mindscape-finished.png"]


def find_ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        if shutil.which("ffmpeg"):
            return "ffmpeg"
        sys.exit("No se encontró ffmpeg: instala imageio-ffmpeg (pip install -r requirements.txt) o ffmpeg.")


FFMPEG = find_ffmpeg()


def ffmpeg(*args):
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def keep_segments(waits, total):
    # Intervalos del vídeo que se conservan, saltando la mayor parte de cada espera
    keep, cursor = [], 0.0
    for start, end in waits:
        if end - start <= KEEP_OF_WAIT + 0.3:
            continue
        keep.append((cursor, start + KEEP_OF_WAIT))
        cursor = end - 0.15
    keep.append((cursor, total + 5))
    return keep


def build_video():
    timeline = json.load(open(os.path.join(OUT, "timeline.json")))
    keep = keep_segments(timeline["waits"], timeline["total"])
    select = "+".join(f"between(t,{a:.2f},{b:.2f})" for a, b in keep)

    mp4 = os.path.join(OUT, "mindscape-demo.mp4")
    ffmpeg("-i", os.path.join(OUT, "session.webm"), "-vf", f"fps=25,select='{select}',setpts=N/25/TB", "-an",
           "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4)

    # GIF con paleta optimizada para el contenido del vídeo
    scale = f"fps={GIF_FPS},scale={GIF_WIDTH}:-1:flags=lanczos,hqdn3d=3:3:8:8"
    palette = os.path.join(OUT, "palette.png")
    gif = os.path.join(OUT, "mindscape-demo.gif")
    ffmpeg("-i", mp4, "-vf", f"{scale},palettegen=max_colors={GIF_COLORS}:stats_mode=diff", palette)
    # mpdecimate descarta los fotogramas casi idénticos (lectura, esperas) y los convierte en pausas
    ffmpeg("-i", mp4, "-i", palette, "-lavfi",
           f"{scale},mpdecimate=hi=768:lo=320:frac=0.5[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle",
           "-fps_mode", "vfr", gif)
    os.remove(palette)
    print(f"MP4: {os.path.getsize(mp4) / 1e6:.1f} MB · GIF: {os.path.getsize(gif) / 1e6:.1f} MB")


def build_summary_image():
    # Primera página del PDF del resumen como PNG, recortando el espacio en blanco
    pdf = os.path.join(OUT, "summary.pdf")
    if not (shutil.which("pdftoppm") and shutil.which("convert")):
        print("Aviso: sin pdftoppm/ImageMagick no se genera mindscape-summary.png")
        return None
    base = os.path.join(OUT, "summary")
    subprocess.run(["pdftoppm", "-png", "-r", "110", "-f", "1", "-l", "1", "-singlefile", pdf, base], check=True)
    png = os.path.join(OUT, "mindscape-summary.png")
    subprocess.run(["convert", f"{base}.png", "-trim", "-bordercolor", "white", "-border", "48",
                    "-bordercolor", "#d0d7de", "-border", "1", png], check=True)
    os.remove(f"{base}.png")
    return png


def publish():
    files = STILLS + ["mindscape-demo.gif", "mindscape-demo.mp4"]
    summary = build_summary_image()
    if summary:
        files.append(os.path.basename(summary))
    for name in files:
        shutil.copy(os.path.join(OUT, name), os.path.join(DOCS_IMAGES, name))
        print("→ docs/images/" + name)


if __name__ == "__main__":
    build_video()
    if "--publish" in sys.argv:
        publish()
