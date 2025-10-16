// src/components/ResultCard.jsx
export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-semibold text-softBlue mb-2">Descripción visual</h2>
      <p className="text-gray-700 mb-4">{result.descripcion}</p>

      <h2 className="text-xl font-semibold text-softBlue mb-2">Reflexión emocional</h2>
      <p className="text-gray-700">{result.reflexion}</p>
    </div>
  );
}
