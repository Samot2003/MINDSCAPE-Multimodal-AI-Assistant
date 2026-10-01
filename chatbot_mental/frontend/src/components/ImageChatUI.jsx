import React, { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiArrowUp, FiBookOpen, FiDownload, FiX } from "react-icons/fi";
import ColorThief from "color-thief-browser";
import TextareaAutosize from "react-textarea-autosize";
import ChatScene from "./ChatScene";

// Convierte el color dominante de la imagen en un acento legible sobre fondo oscuro
const toAccent = ([r, g, b]) => {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const [rn, gn, bn] = [r / 255, g / 255, b / 255];
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  const sat = Math.min(Math.max(s * 100, 35), 70);
  return `hsl(${Math.round(h)} ${Math.round(sat)}% 74%)`;
};

// Tamaño del texto de la IA según su longitud, para que siempre quepa sobre la imagen
const voiceSize = (text) => (text.length < 180 ? "l" : text.length < 380 ? "m" : "s");

// Indica si se cumple una media query y se actualiza al cambiar el tamaño de la ventana
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
};

// Mide la altura de un elemento (para reservar el espacio que ocupa el texto sobre la imagen)
const useHeight = (ref) => {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return height;
};

const ImageChatUI = ({
  selectedImage,
  chatMessages,
  userInput,
  setUserInput,
  handleSend,
  loading,
  finished,
  pendingFocus,
  onPoint,
  downloading,
  onDownloadPdf,
  onRestart,
  onExit,
}) => {
  const [accent, setAccent] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const [viewFocus, setViewFocus] = useState(null);
  const inputRef = useRef(null);
  const notebookRef = useRef(null);
  const dialogueRef = useRef(null);
  const compact = useMediaQuery("(max-width: 860px)");
  const wide = useMediaQuery("(min-width: 1101px)");
  const dialogueHeight = useHeight(dialogueRef);

  // Punto de la escena hacia el que se lleva la zona señalada (deja sitio al texto inferior)
  const anchor = compact ? { x: 0.5, y: 0.27 } : { x: 0.5, y: 0.36 };

  // Espacio libre para enmarcar la imagen al cerrar la conversación
  const reserve = { top: compact ? 64 : 84, bottom: dialogueHeight + 24, side: compact ? 16 : 48 };

  // Genera una URL para mostrar la imagen seleccionada
  useEffect(() => {
    if (!(selectedImage instanceof Blob)) {
      setImageUrl(selectedImage);
      return;
    }
    const url = URL.createObjectURL(selectedImage);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  // Obtiene el color dominante de la imagen para usarlo como acento
  const handleImageLoad = (event) => {
    try {
      setAccent(toAccent(new ColorThief().getColor(event.currentTarget)));
    } catch {}
  };

  // Marcas numeradas en el orden de la conversación
  const marks = useMemo(() => {
    let number = 0;
    const lastBot = [...chatMessages].reverse().find((m) => m.sender === "bot");
    return chatMessages
      .map((msg, index) => ({ msg, index }))
      .filter(({ msg }) => msg.focus)
      .map(({ msg, index }) => ({
        number: ++number,
        index,
        sender: msg.sender,
        x: msg.focus.x,
        y: msg.focus.y,
        current: !finished && msg === lastBot,
      }));
  }, [chatMessages, finished]);
  const markByIndex = useMemo(() => Object.fromEntries(marks.map((m) => [m.index, m])), [marks]);

  // Último mensaje de la IA y el mensaje de la usuaria al que responde
  const lastBotIndex = chatMessages.map((m) => m.sender).lastIndexOf("bot");
  const lastUserIndex = chatMessages.map((m) => m.sender).lastIndexOf("user");
  const voice = !loading && lastBotIndex >= 0 ? chatMessages[lastBotIndex] : null;
  const echo = lastUserIndex >= 0 && (loading || lastUserIndex < lastBotIndex) ? chatMessages[lastUserIndex] : null;

  // La cámara sigue a la IA; al terminar, se aleja para mostrar el recorrido completo
  const cameraFocus = finished ? null : viewFocus || voice?.focus || null;

  // Al llegar un mensaje nuevo, la cámara vuelve a seguir la conversación
  useEffect(() => {
    setViewFocus(null);
    const list = notebookRef.current;
    if (list) {
      list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
    }
  }, [chatMessages.length]);

  // Devuelve el foco al campo de texto cuando llega la respuesta o se señala una zona
  useEffect(() => {
    if (!loading && !finished) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [loading, finished, pendingFocus]);

  const stops = marks.length;

  // Cierre: en pantallas anchas va en el cuaderno; en el resto, sobre la imagen
  const closingPanel = (
    <motion.section
      key="closing"
      className="closing"
      aria-labelledby="closing-title"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] } }}
    >
      <h2 id="closing-title" className="closing__title">
        Tu recorrido por la imagen
      </h2>
      <p className="closing__text">
        {stops > 1
          ? `La conversación se detuvo en ${stops} lugares de la imagen. Puedes llevarte un resumen o empezar de nuevo con otra imagen.`
          : "La conversación ha terminado. Puedes llevarte un resumen o empezar de nuevo con otra imagen."}
      </p>
      <div className="closing__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onDownloadPdf}
          disabled={downloading}
        >
          <FiDownload aria-hidden="true" />
          {downloading ? "Preparando el resumen…" : "Descargar resumen en PDF"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          Empezar con otra imagen
        </button>
      </div>
    </motion.section>
  );

  return (
    <div className={`session${finished ? " is-finished" : ""}`} style={accent ? { "--acento": accent } : undefined}>
      <div className="session__stage">
        <ChatScene
          imageUrl={imageUrl}
          marks={marks}
          focus={cameraFocus}
          pendingFocus={pendingFocus}
          highlighted={highlighted}
          overview={finished}
          reserve={reserve}
          interactive={!finished && !loading}
          anchor={anchor}
          onPoint={onPoint}
          onImageLoad={handleImageLoad}
        />

        <header className="session__bar">
          <button type="button" className="btn btn--quiet" onClick={onExit}>
            <FiArrowLeft aria-hidden="true" /> Salir
          </button>
          <p className="wordmark">Mindscape</p>
          <button
            type="button"
            className="btn btn--quiet session__notebook-toggle"
            aria-expanded={notebookOpen}
            aria-controls="notebook"
            onClick={() => setNotebookOpen(true)}
          >
            <FiBookOpen aria-hidden="true" /> Cuaderno
          </button>
        </header>

        <div className="session__dialogue" ref={dialogueRef}>
          {/* Voz de la conversación, escrita sobre la imagen */}
          <div className="voice" aria-live="polite">
            {echo && !finished && (
              <p className="voice__echo" key={`echo-${lastUserIndex}`}>
                {echo.focus && <span className="voice__dot" aria-hidden="true" />}
                {echo.text}
              </p>
            )}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="typing"
                  className="typing"
                  aria-label="Mindscape está escribiendo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </motion.div>
              ) : (
                voice && (
                  <motion.p
                    key={`voice-${lastBotIndex}`}
                    className={`voice__text voice__text--${voiceSize(voice.text)}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  >
                    {voice.text}
                  </motion.p>
                )
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.div key="composer" exit={{ opacity: 0 }}>
                {/* Campo para escribir mensajes, con la zona señalada si la hay */}
                <form
                  className="composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                >
                  {pendingFocus && (
                    <span className="composer__chip">
                      <span className="voice__dot" aria-hidden="true" />
                      Zona señalada
                      <button type="button" aria-label="Quitar la zona señalada" onClick={() => onPoint(null)}>
                        <FiX aria-hidden="true" />
                      </button>
                    </span>
                  )}
                  <label htmlFor="chat-input" className="visually-hidden">
                    Tu mensaje
                  </label>
                  <TextareaAutosize
                    id="chat-input"
                    ref={inputRef}
                    minRows={1}
                    maxRows={4}
                    placeholder={pendingFocus ? "¿Qué ves aquí?" : "Escribe lo que surja…"}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      // Enter envía el mensaje; Shift+Enter inserta un salto de línea
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className="composer__send"
                    disabled={loading || !userInput.trim()}
                    aria-label="Enviar mensaje"
                  >
                    <FiArrowUp aria-hidden="true" />
                  </button>
                </form>
                <p className="composer__hint">
                  Toca la imagen para señalar lo que te llama la atención. Cuando quieras terminar, díselo.
                </p>
              </motion.div>
            ) : (
              !wide && closingPanel
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cuaderno: la conversación completa; cada zona señalada enlaza con su marca en la imagen */}
      <aside id="notebook" className={`notebook${notebookOpen ? " is-open" : ""}`} aria-label="Cuaderno">
        <div className="notebook__head">
          <h2 className="notebook__title">Cuaderno</h2>
          <button
            type="button"
            className="btn btn--quiet notebook__close"
            aria-label="Cerrar el cuaderno"
            onClick={() => setNotebookOpen(false)}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        <AnimatePresence>{finished && wide && closingPanel}</AnimatePresence>
        <ol className="notebook__list" ref={notebookRef} role="log" aria-label="Conversación">
          {chatMessages.map((msg, idx) => {
            const mark = markByIndex[idx];
            return (
              <li
                key={idx}
                className={`entry entry--${msg.sender}`}
                data-sender={msg.sender}
                onMouseEnter={() => mark && setHighlighted(mark.number)}
                onMouseLeave={() => setHighlighted(null)}
              >
                {mark && (
                  <button
                    type="button"
                    className={`entry__mark entry__mark--${msg.sender}`}
                    aria-label={`Ver la zona ${mark.number} en la imagen`}
                    onClick={() => {
                      setViewFocus(msg.focus);
                      setNotebookOpen(false);
                    }}
                  >
                    {mark.number}
                  </button>
                )}
                <p className="entry__text">
                  <span className="visually-hidden">{msg.sender === "bot" ? "Mindscape: " : "Tú: "}</span>
                  {msg.text}
                </p>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
};

export default ImageChatUI;
