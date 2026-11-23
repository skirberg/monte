# Narration for each topic's Listen button: public/audio/<topic>.mp3, read by Kokoro-82M (Apache 2.0, open weights
# from Hugging Face, hexgrad/Kokoro-82M) through kokoro-onnx on the CPU. Free, offline once the model is downloaded.
#   pip install kokoro-onnx soundfile        (and ffmpeg on the PATH)
#   download kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
#   npx tsx scripts/speech-text.ts > /tmp/speech.json
#   python scripts/make-audio.py /tmp/speech.json /path/to/model-dir
# Re-run after a topic's text changes; the page falls back to the browser voice for any topic without a file.
import json, subprocess, sys, tempfile
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro

VOICE, SPEED = "af_heart", 1.0  # af_heart: Kokoro's highest-graded American English voice

texts = json.loads(Path(sys.argv[1]).read_text())
model = Path(sys.argv[2])
only = set(sys.argv[3:])
kokoro = Kokoro(str(model / "kokoro-v1.0.onnx"), str(model / "voices-v1.0.bin"))
out = Path(__file__).resolve().parent.parent / "public" / "audio"
out.mkdir(parents=True, exist_ok=True)

for topic, text in texts.items():
    if only and topic not in only:
        continue
    samples, rate = kokoro.create(text, voice=VOICE, speed=SPEED, lang="en-us")
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
        sf.write(wav.name, samples, rate)
        # Mono 48 kbps MP3: speech stays clear and a minute is about 360 KB.
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav.name, "-ac", "1", "-b:a", "48k", str(out / f"{topic}.mp3")], check=True)
    print(f"{topic}: {len(samples) / rate:.0f} s")
