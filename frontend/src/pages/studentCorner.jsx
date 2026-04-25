import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { API_URL } from "../config";

const FEATURES = [
  {
    key: "test",
    label: "Test Paper",
    desc: "Full exam paper with MCQs, short & long answers",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="7" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="7" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="7" y1="15" x2="10" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "summary",
    label: "Summary",
    desc: "Key concepts, definitions & concise takeaways",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="11" y1="7" x2="11" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="11" cy="14.5" r="0.8" fill="currentColor"/>
      </svg>
    ),
  },
  {
    key: "questions",
    label: "Important Questions",
    desc: "Top exam questions with hints & concept traps",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M8.5 8.5C8.5 6.5 13.5 6.5 13.5 9C13.5 11 11 11.5 11 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="11" cy="16.5" r="0.8" fill="currentColor"/>
        <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export default function StudentsCornerPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feature, setFeature] = useState("test");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return toast.error("Upload a PDF first");

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

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Generation failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AI_${feature}_${Date.now()}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Your PDF is ready!");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const selectedFeature = FEATURES.find((f) => f.key === feature);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Fraunces:ital,wght@0,700;1,400&display=swap');
        .feature-card { transition: border-color 0.2s, background 0.2s; }
        .feature-card:hover { border-color: rgba(99,102,241,0.5); }
        .upload-zone { transition: border-color 0.2s, background 0.2s; }
        .glow-btn { position: relative; overflow: hidden; }
        .glow-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, #6366F1, #A855F7, #6366F1); opacity: 0; transition: opacity .3s; }
        .glow-btn:not(:disabled):hover::before { opacity: 1; }
        .glow-btn span { position: relative; z-index: 1; }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-medium tracking-[0.2em] text-indigo-400 uppercase mb-3">
            AI Study Tools
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif" }} className="text-5xl font-bold text-white leading-tight mb-3">
            Student's<br />
            <span className="italic text-indigo-400">Corner</span>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Upload any PDF study material — get a test paper, smart summary, or exam questions instantly.
          </p>
        </div>

        {/* Feature Selection */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {FEATURES.map((item) => (
            <button
              key={item.key}
              onClick={() => setFeature(item.key)}
              className={`feature-card text-left p-4 rounded-xl border transition ${
                feature === item.key
                  ? "bg-indigo-950 border-indigo-500 text-white"
                  : "bg-[#111116] border-[#1E1E26] text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className={`mb-2 ${feature === item.key ? "text-indigo-400" : "text-gray-600"}`}>
                {item.icon}
              </div>
              <p className="text-sm font-medium mb-0.5">{item.label}</p>
              <p className="text-xs leading-snug opacity-60">{item.desc}</p>
            </button>
          ))}
        </div>

        {/* Upload Zone */}
        <div
          className={`upload-zone rounded-2xl border-2 border-dashed mb-4 transition cursor-pointer ${
            dragging
              ? "border-indigo-500 bg-indigo-950/30"
              : file
              ? "border-indigo-700 bg-[#111116]"
              : "border-[#2A2A35] bg-[#111116] hover:border-indigo-800"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            {file ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-indigo-900/60 flex items-center justify-center mb-3">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-indigo-400">
                    <rect x="3" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M7 2v4h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-white mb-1 max-w-xs truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-3 text-xs text-gray-600 hover:text-red-400 transition"
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-[#1A1A22] flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-gray-600">
                    <path d="M11 15V7M11 7L8 10M11 7L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 17h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-400 mb-1">
                  {dragging ? "Drop it here" : "Drop your PDF here"}
                </p>
                <p className="text-xs text-gray-600">or click to browse · PDF only · max 10MB</p>
              </>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !file}
          className="glow-btn w-full py-3.5 rounded-xl font-medium text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Generating your {selectedFeature?.label}…
              </>
            ) : (
              <>
                Generate {selectedFeature?.label}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </span>
        </button>

        {/* Footer chips */}
        <div className="flex gap-3 mt-8 flex-wrap">
          {["Gemini 1.5 Flash", "Free API", "PDF Output", "Instant"].map((tag) => (
            <span key={tag} className="text-xs text-gray-600 bg-[#111116] border border-[#1E1E26] px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}