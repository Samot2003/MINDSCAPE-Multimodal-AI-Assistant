// Imágenes predeterminadas: el original (se envía al backend) y su miniatura WebP (para la galería)
const originals = require.context("./images", false, /\.(png|jpe?g)$/);
const thumbs = require.context("./thumbs", false, /\.webp$/);

const baseName = (key) => key.replace(/^\.\//, "").replace(/\.[^.]+$/, "");

const thumbByName = Object.fromEntries(
  thumbs.keys().map((key) => [baseName(key), thumbs(key)])
);

const gallery = originals.keys().map((key, index) => ({
  index,
  full: originals(key),
  thumb: thumbByName[baseName(key)] || originals(key),
}));

export default gallery;
