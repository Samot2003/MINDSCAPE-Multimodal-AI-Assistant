// src/components/UploadCard.jsx
import { useState } from "react";
import axios from "axios";

export default function UploadCard({ setResult }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) return alert("Sube una imagen primero.");
    const formData = new FormData();
    formData.append("file", image);
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/analyze", formData);
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error al analizar la imagen.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto text-center">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-softBlue text-white px-4 py-2 rounded-lg hover:bg-softGreen transition"
      >
        {loading ? "Analizando..." : "Analizar Imagen"}
      </button>
    </div>
  );
}
