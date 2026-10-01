# Demo y capturas del README

Scripts para regenerar las capturas, el GIF y el vídeo de `docs/images/` a partir de una sesión real con Gemini.

- `capture.js` usa Playwright para recorrer la aplicación (inicio → selección de imagen → conversación → cierre → resumen en PDF). Mientras tanto graba un vídeo y toma las capturas.
- `build_assets.py` recorta las esperas al modelo y genera `mindscape-demo.gif` y `mindscape-demo.mp4`. Con `--publish`, además copia todo a `docs/images/` y convierte el PDF del resumen en `mindscape-summary.png`.

## Requisitos

- Backend en marcha en `http://localhost:8000` con una `GOOGLE_API_KEY` válida.
- Frontend en marcha (`npm start`).
- La grabación hace unas 4-5 peticiones a Gemini, así que debe quedar cuota disponible.
- Opcional, para `mindscape-summary.png`: `pdftoppm` (poppler-utils) e ImageMagick.

## Uso

```bash
cd scripts/demo
npm install
npx playwright install chromium
python -m venv .venv && .venv/bin/pip install -r requirements.txt

# Graba la sesión (APP_URL por defecto: http://localhost:3000)
APP_URL=http://localhost:3000 node capture.js

# Revisa out/ y, si todo está bien, publica en docs/images/
.venv/bin/python build_assets.py --publish
```

Variables opcionales:

| Variable | Por defecto | Uso |
|---|---|---|
| `APP_URL` | `http://localhost:3000` | URL del frontend. |
| `IMAGE_INDEX` | `3` | Imagen predeterminada que se elige en la demo. |
| `GIF_WIDTH` | `900` | Anchura del GIF en píxeles. |
| `GIF_FPS` | `8` | Fotogramas por segundo del GIF. |

Las respuestas del modelo cambian en cada ejecución, así que conviene revisar las capturas de `out/` antes de publicarlas.
