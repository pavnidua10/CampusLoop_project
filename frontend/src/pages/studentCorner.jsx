import { useState } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../config";

const StudentsCornerPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feature, setFeature] = useState("test");

  const handleSubmit = async () => {
    if (!file) {
      return toast.error("Please upload a PDF first");
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("feature", feature);

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/pdf_ai/generate`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "AI_Generated_Content.pdf";
      a.click();

      toast.success("Your AI file is ready 🎉");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            🎓 Student’s Corner
          </h1>
          <p className="text-gray-400">
            Upload your study material and let AI generate smart academic resources for you.
          </p>
        </div>

        {/* Feature Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { key: "test", label: "Generate Test Paper" },
            { key: "summary", label: "Generate Summary" },
            { key: "questions", label: "Important Questions" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFeature(item.key)}
              className={`p-4 rounded-xl border transition ${
                feature === item.key
                  ? "bg-indigo-600 border-indigo-500"
                  : "bg-gray-900 border-gray-800 hover:bg-gray-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Upload Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl p-10 mb-6">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-gray-400"
            />
            <p className="text-sm text-gray-500 mt-2">
              Only PDF files are supported
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition font-semibold"
          >
            {loading ? "Generating..." : "✨ Generate with AI"}
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-10 text-sm text-gray-400">
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            ⚡ Fast AI Processing
          </div>
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            📄 Downloadable PDF Output
          </div>
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            🎯 Smart Academic Optimization
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentsCornerPage;
