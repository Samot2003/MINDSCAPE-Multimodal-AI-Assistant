import React from "react";
import { motion } from "framer-motion";
import gallery from "../assets/gallery";

// Reparte las imágenes en tres columnas; cada columna se duplica para que el desplazamiento sea continuo
const columns = [0, 1, 2].map((col) => {
  const items = gallery.filter((_, i) => i % 3 === col);
  return [...items, ...items];
});

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  }),
};

const HomeView = ({ onStart }) => {
  return (
    <div className="home">
      <div className="home__content">
        <main className="home__main">
          <motion.h1 className="home__title" variants={reveal} initial="hidden" animate="visible" custom={0}>
            Mindscape
          </motion.h1>
          <motion.p className="home__lead" variants={reveal} initial="hidden" animate="visible" custom={1}>
            Elige una imagen y deja que la conversación empiece por lo que te hace sentir.
          </motion.p>
          <motion.div variants={reveal} initial="hidden" animate="visible" custom={2}>
            <button type="button" className="btn btn--primary" onClick={onStart}>
              Elegir una imagen
            </button>
          </motion.div>

          <motion.ol
            className="home__steps"
            variants={reveal}
            initial="hidden"
            animate="visible"
            custom={3}
            aria-label="Cómo funciona"
          >
            <li>Elige una imagen</li>
            <li>Conversa con la IA</li>
            <li>Llévate un resumen</li>
          </motion.ol>
        </main>

        <p className="home__note">
          Prototipo académico (TFG, Universitat de Barcelona). Las respuestas las genera una IA y no
          sustituyen la ayuda de un profesional de la salud mental.
        </p>
      </div>

      {/* Mosaico decorativo con las imágenes de la galería */}
      <div className="mosaic" aria-hidden="true">
        {columns.map((items, col) => (
          <div className="mosaic__col" key={col}>
            {items.map((img, i) => (
              <img key={i} src={img.thumb} alt="" loading={i < 5 ? "eager" : "lazy"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeView;
