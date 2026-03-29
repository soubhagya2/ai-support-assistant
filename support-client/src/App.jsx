import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Upload,
  Send,
  Check,
  X,
  Loader2,
  RefreshCw,
  ArrowRight,
  Info,
  Layout
} from 'lucide-react';


const apiKey = import.meta.env.VITE_API_KEY;
const TEXT_MODEL = "gemini-2.0-flash"; 


const generatePollinationsImage = (prompt) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

// Helper for exponential backoff (for Gemini text API)
const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Text Workflow State
  const [textInput, setTextInput] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [workflowStep, setWorkflowStep] = useState('input');

  // Image Workflow State
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [imageVariations, setImageVariations] = useState([]);

  // --- API Functions ---

  // ✅ Gemini 1.5 Flash — Free text enhancement
  const enhancePrompt = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setError(null);

    const systemPrompt = "You are an expert prompt engineer. Analyze the user's intent and tone, then provide a highly detailed, descriptive, and artistic prompt for an image generation AI. Return ONLY the enhanced prompt text, no extra explanation.";

    try {
      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: textInput }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        }
      );

      const enhanced = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (enhanced) {
        setEnhancedPrompt(enhanced);
        setWorkflowStep('approval');
      } else {
        setError("Could not enhance prompt. Try again.");
      }
    } catch (err) {
      setError("Failed to enhance prompt. Check your API key in .env");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Pollinations.ai — Free image generation, no key needed
  const generateImage = async (prompt) => {
    setLoading(true);
    setError(null);
    try {
      const imageUrl = generatePollinationsImage(prompt);
      // Preload image to confirm it loads
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      setGeneratedImages(prev => [imageUrl, ...prev]);
      setWorkflowStep('result');
    } catch (err) {
      setError("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Gemini for analysis + Pollinations for variation
  const analyzeAndGenerateVariations = async () => {
    if (!uploadedImage) return;
    setLoading(true);
    setError(null);

    const base64Data = uploadedImage.split(',')[1];

    try {
      // Step 1: Analyze image with Gemini (free)
      const analysisResult = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [
                { text: "Analyze this image. Describe the objects, theme, artistic style, and core mood in a short paragraph. Then write a detailed image generation prompt based on it." },
                { inlineData: { mimeType: "image/jpeg", data: base64Data } }
              ]
            }]
          })
        }
      );

      const analysis = analysisResult.candidates?.[0]?.content?.parts?.[0]?.text;
      setImageAnalysis(analysis);

      // Step 2: Use analysis as prompt for Pollinations variation (free)
      const variationPrompt = `A creative artistic variation of: ${analysis?.slice(0, 300)}`;
      const variationUrl = generatePollinationsImage(variationPrompt);

      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = variationUrl;
      });

      setImageVariations(prev => [variationUrl, ...prev]);

    } catch (err) {
      setError("Analysis or variation generation failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const resetTextWorkflow = () => {
    setWorkflowStep('input');
    setEnhancedPrompt(null);
    setTextInput('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Layout className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Pear Media <span className="text-emerald-500">AI Lab</span>
            </h1>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-full">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'text' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Text Workflow
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'image' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Image Workflow
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto hover:bg-red-100 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Text-to-Image Workflow */}
        {activeTab === 'text' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  1. Enhance Prompt
                </h2>
                <div className="space-y-4">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                    disabled={loading || workflowStep !== 'input'}
                  />
                  {workflowStep === 'input' && (
                    <button
                      onClick={enhancePrompt}
                      disabled={loading || !textInput.trim()}
                      className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Enhance Intent & Tone
                    </button>
                  )}
                </div>
              </section>

              {workflowStep === 'approval' && (
                <section className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <h3 className="text-emerald-800 font-semibold mb-2 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    2. Approve Enhanced Prompt
                  </h3>
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 italic text-slate-700 text-sm mb-4 leading-relaxed max-h-40 overflow-y-auto">
                    "{enhancedPrompt}"
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => generateImage(enhancedPrompt)}
                      disabled={loading}
                      className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                      Approve & Generate
                    </button>
                    <button
                      onClick={resetTextWorkflow}
                      className="px-4 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50"
                    >
                      Reset
                    </button>
                  </div>
                </section>
              )}

              {workflowStep === 'result' && (
                <button
                  onClick={resetTextWorkflow}
                  className="w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate Another
                </button>
              )}
            </div>

            <div className="lg:col-span-7 space-y-6">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-500" />
                  Generated Results
                  <span className="ml-auto text-xs text-slate-400 font-normal">Powered by Pollinations.ai</span>
                </h2>

                {generatedImages.length === 0 && !loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                    <p>Generated images will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading && (
                      <div className="aspect-square bg-slate-100 rounded-xl flex flex-col items-center justify-center animate-pulse border-2 border-dashed border-slate-200">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
                        <span className="text-xs text-slate-500">Generating Masterpiece...</span>
                      </div>
                    )}
                    {generatedImages.map((img, idx) => (
                      <div key={idx} className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <img src={img} alt={`Generated ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => window.open(img, '_blank')}
                            className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold"
                          >
                            View Full Size
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* Image Workflow */}
        {activeTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-500" />
                  1. Upload Source
                </h2>
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 transition-all text-center ${uploadedImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 bg-slate-50'}`}
                >
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img src={uploadedImage} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-sm" />
                      <p className="text-sm text-emerald-600 font-medium">Image uploaded successfully</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-slate-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-6 h-6 text-slate-500" />
                      </div>
                      <p className="font-medium text-slate-700">Click or drag image to upload</p>
                      <p className="text-xs text-slate-400">Supports PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>

                {uploadedImage && (
                  <button
                    onClick={analyzeAndGenerateVariations}
                    disabled={loading}
                    className="w-full mt-6 py-3 px-4 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Analyze & Generate Variations
                  </button>
                )}
              </section>

              {imageAnalysis && (
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-slate-900 font-semibold mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-emerald-500" />
                    Image Analysis
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                    {imageAnalysis}
                  </p>
                </section>
              )}
            </div>

            <div className="lg:col-span-7 space-y-6">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-500" />
                  Variations & Similar Images
                  <span className="ml-auto text-xs text-slate-400 font-normal">Powered by Pollinations.ai</span>
                </h2>

                {imageVariations.length === 0 && !loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                    <p>Variations will appear here after analysis</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading && (
                      <div className="aspect-square bg-slate-100 rounded-xl flex flex-col items-center justify-center animate-pulse border-2 border-dashed border-slate-200">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
                        <span className="text-xs text-slate-500">Creating Variations...</span>
                      </div>
                    )}
                    {imageVariations.map((img, idx) => (
                      <div key={idx} className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <img src={img} alt={`Variation ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                          AI Variation
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-white font-bold mb-4">Pear Media AI Lab</h4>
            <p className="text-sm leading-relaxed">
              A state-of-the-art prototype showcasing the power of integrated NLP and Computer Vision APIs for creative workflows.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Integrated APIs</h4>
            <ul className="text-sm space-y-2">
              <li>• Gemini 1.5 Flash (Text — Free)</li>
              <li>• Pollinations.ai (Images — Free)</li>
              <li>• No paid APIs required</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Technical Stack</h4>
            <p className="text-sm">
              React 18+, Tailwind CSS, Lucide Icons, Gemini API, Pollinations.ai
            </p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          &copy; 2024 Pear Media. Prototype Assignment Delivery.
        </div>
      </footer>
    </div>
  );
}