// src/App.jsx
import { useState } from "react";
import Header from "./components/Header";
import UploadCard from "./components/UploadCard";
import ResultCard from "./components/ResultCard";

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-calmGray">
      <Header />
      <UploadCard setResult={setResult} />
      <ResultCard result={result} />
    </div>
  );
}

export default App;
