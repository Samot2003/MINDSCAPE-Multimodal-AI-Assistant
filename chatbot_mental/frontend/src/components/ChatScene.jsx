import React, { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const ZOOM = 1.22; // Acercamiento de la "cámara" cuando la conversación se fija en una zona

// La imagen ocupa toda la escena (como object-fit: cover) y la cámara se desplaza
// para llevar la zona señalada hacia el punto de lectura, sin dejar bordes vacíos.
const computeCamera = (stage, natural, focus, anchor, overview, reserve) => {
  // Vista de cierre: la imagen se aleja y queda enmarcada entera en el espacio libre
  if (overview) {
    const availW = stage.w - 2 * reserve.side;
    const availH = Math.max(stage.h - reserve.top - reserve.bottom, 160);
    const fit = Math.min(availW / natural.w, availH / natural.h);
    const width = natural.w * fit;
    const height = natural.h * fit;
    return {
      width,
      height,
      left: (stage.w - width) / 2,
      top: reserve.top + (availH - height) / 2,
      x: 0,
      y: 0,
      zoom: 1,
    };
  }

  const scale = Math.max(stage.w / natural.w, stage.h / natural.h);
  const width = natural.w * scale;
  const height = natural.h * scale;
  const left = (stage.w - width) / 2;
  const top = (stage.h - height) / 2;

  if (!focus) {
    return { width, height, left, top, x: 0, y: 0, zoom: 1 };
  }

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const x = clamp(stage.w * anchor.x - left - focus.x * width * ZOOM, stage.w - left - width * ZOOM, -left);
  const y = clamp(stage.h * anchor.y - top - focus.y * height * ZOOM, stage.h - top - height * ZOOM, -top);
  return { width, height, left, top, x, y, zoom: ZOOM };
};

const ChatScene = ({
  imageUrl,
  marks,
  focus,
  pendingFocus,
  highlighted,
  overview,
  reserve,
  interactive,
  anchor,
  onPoint,
  onImageLoad,
}) => {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const [stage, setStage] = useState(null);
  const [natural, setNatural] = useState(null);

  // Mide la escena para recalcular la cámara al cambiar el tamaño de la ventana
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setStage({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleLoad = (event) => {
    const img = event.currentTarget;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    onImageLoad?.(event);
  };

  // Convierte un clic en coordenadas normalizadas de la imagen (0-1)
  const handleClick = (event) => {
    if (!interactive || !canvasRef.current) {
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const round = (v) => Math.round(Math.min(Math.max(v, 0), 1) * 10000) / 10000;
    onPoint({
      x: round((event.clientX - rect.left) / rect.width),
      y: round((event.clientY - rect.top) / rect.height),
    });
  };

  const camera = stage && natural ? computeCamera(stage, natural, focus, anchor, overview, reserve) : null;
  const spot = focus || { x: 0.5, y: 0.5 };
  const path = marks.map((m, i) => `${i === 0 ? "M" : "L"} ${m.x * 100} ${m.y * 100}`).join(" ");

  return (
    <div className="scene" ref={stageRef}>
      {/* Fondo difuminado que aparece cuando la imagen se enmarca al cerrar */}
      {imageUrl && (
        <div
          className={`scene__backdrop${overview ? " is-visible" : ""}`}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      <div
        ref={canvasRef}
        className={`scene__canvas${interactive ? " is-interactive" : ""}${overview ? " is-framed" : ""}`}
        onClick={handleClick}
        style={
          camera
            ? {
                width: camera.width,
                height: camera.height,
                left: camera.left,
                top: camera.top,
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
                "--zoom": camera.zoom,
              }
            : { inset: 0, opacity: 0 }
        }
      >
        {imageUrl && (
          <img className="scene__img" src={imageUrl} alt="Imagen elegida para la conversación" onLoad={handleLoad} />
        )}

        {/* Foco de luz sobre la zona de la que se está hablando */}
        <div
          className={`scene__veil${focus ? " is-focused" : ""}`}
          style={{ "--fx": `${spot.x * 100}%`, "--fy": `${spot.y * 100}%` }}
        />

        {/* Recorrido de la conversación por la imagen */}
        {overview && marks.length > 1 && (
          <svg className="scene__path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <motion.path
              d={path}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.4, ease: "easeInOut", delay: 1.6 }}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        {/* Marcas: zonas señaladas por la IA y por la usuaria */}
        {marks.map((m) => (
          <span
            key={m.number}
            className={`mark mark--${m.sender}${m.current ? " is-current" : ""}${
              highlighted === m.number ? " is-highlighted" : ""
            }`}
            style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
            aria-hidden="true"
          >
            {m.number}
          </span>
        ))}

        {pendingFocus && (
          <span
            className="mark mark--pending"
            style={{ left: `${pendingFocus.x * 100}%`, top: `${pendingFocus.y * 100}%` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

export default ChatScene;
