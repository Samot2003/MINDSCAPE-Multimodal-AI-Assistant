import React, { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiUpload } from "react-icons/fi";

const ImageSelectorUI = ({
  images,
  selectedIndex,
  preview,
  isOwnImage,
  loading,
  onSelectImage,
  onSubmit,
  onBack,
}) => {
  const fileInputRef = useRef(null);
  const hasSelection = Boolean(preview);

  return (
    <div className="gallery">
      <header className="topbar">
        <button type="button" className="btn btn--quiet" onClick={onBack}>
          <FiArrowLeft aria-hidden="true" /> Inicio
        </button>
        <p className="wordmark">Mindscape</p>
      </header>

      <div className="gallery__header">
        <h1 className="gallery__title">Elige una imagen</h1>
        <p className="gallery__hint">No busques la correcta. Elige la que te mire primero.</p>
      </div>

      {/* Galería de imágenes predeterminadas y subida de una imagen propia */}
      <div className={`gallery__grid${hasSelection ? " gallery__grid--has-selection" : ""}`}>
        <button
          type="button"
          className={`tile tile--upload${isOwnImage ? " tile--selected" : ""}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <FiUpload aria-hidden="true" />
          {isOwnImage ? "Cambiar mi imagen" : "Subir una imagen propia"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          tabIndex={-1}
          onChange={onSelectImage}
        />

        {images.map((img) => (
          <button
            key={img.index}
            type="button"
            className={`tile${selectedIndex === img.index ? " tile--selected" : ""}`}
            aria-pressed={selectedIndex === img.index}
            aria-label={`Imagen ${img.index + 1}`}
            onClick={() => onSelectImage(img.index)}
          >
            <img src={img.thumb} alt="" loading="lazy" />
          </button>
        ))}
      </div>

      {/* Barra con la imagen elegida y la acción para empezar */}
      <AnimatePresence>
        {hasSelection && !loading && (
          <motion.div
            className="dock"
            role="region"
            aria-label="Imagen elegida"
            initial={{ opacity: 0, y: 24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 24, x: "-50%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <img className="dock__thumb" src={preview.thumb} alt="" />
            <p className="dock__text">{isOwnImage ? "Tu imagen está lista." : "Has elegido esta imagen."}</p>
            <div className="dock__actions">
              <button type="button" className="btn btn--ghost" onClick={() => onSelectImage(null)}>
                Elegir otra
              </button>
              <button type="button" className="btn btn--primary" onClick={onSubmit}>
                Empezar la conversación
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transición mientras el modelo analiza la imagen */}
      <AnimatePresence>
        {loading && preview && (
          <motion.div
            className="threshold"
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="threshold__bg" style={{ backgroundImage: `url(${preview.thumb})` }} />
            <div className="threshold__inner">
              <motion.img
                className="threshold__img"
                src={preview.full}
                alt=""
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: [1, 1.025, 1], opacity: 1 }}
                transition={{
                  opacity: { duration: 0.8 },
                  scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                }}
              />
              <p className="threshold__text">Mirando la imagen…</p>
              <p className="threshold__sub">La primera pregunta tarda unos segundos.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageSelectorUI;
